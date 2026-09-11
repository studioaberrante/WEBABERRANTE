/* ---- HERO FX: el titular se "genera" desde ruido, como una imagen de IA ----
   Un canvas WebGL cubre el titular del hero. El texto real sigue en el DOM
   (transparente) para Google y lectores de pantalla; acá se dibuja con la
   misma fuente en un canvas 2D, se sube como textura y un shader lo resuelve
   desde ruido (desplazamiento líquido, disolución en grano y una leve
   aberración cromática) al entrar y cada vez que cambia la palabra. En
   reposo respira apenas: nunca del todo quieto.
   Sin librerías. Si no hay WebGL o se prefiere menos movimiento, no hace
   nada y queda el texto normal. Corre a 30 fps y solo con el hero en
   pantalla. */
(function initHeroFx() {
  const hero   = document.getElementById('hero');
  const holder = document.querySelector('.hero-text');
  const title  = document.querySelector('.hero-title');
  const wordEl = document.getElementById('heroWord');
  if (!hero || !holder || !title || !wordEl) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-fx';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', {
    alpha: true, premultipliedAlpha: true, antialias: false,
    depth: false, stencil: false, powerPreference: 'low-power',
  });
  if (!gl) return;

  const VS = 'attribute vec2 a;varying vec2 v;void main(){v=a*0.5+0.5;gl_Position=vec4(a,0.,1.);}';
  const FS = `precision mediump float;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time, u_all, u_word;
uniform vec4 u_rect;
varying vec2 v;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
void main(){
  float inWord = step(u_rect.x, v.x) * step(v.x, u_rect.z) * step(u_rect.y, v.y) * step(v.y, u_rect.w);
  float p = mix(u_all, min(u_all, u_word), inWord);
  float d = 1.0 - p;                                   /* ruido que falta por resolver */
  vec2 flow = vec2(noise(v*6.0 + u_time*0.35), noise(v*6.0 + 7.3 - u_time*0.3)) - 0.5;
  vec2 disp = flow * (d*0.14 + 0.004);                 /* líquido al inicio, respiración al final */
  float ca = d*0.012 + 0.0012;                         /* aberración cromática */
  float r = texture2D(u_tex, v + disp + vec2(ca, 0.0)).a;
  float g = texture2D(u_tex, v + disp).a;
  float b = texture2D(u_tex, v + disp - vec2(ca, 0.0)).a;
  float grain = noise(v*u_res*0.5 + u_time*9.0);
  float keep = smoothstep(d - 0.08, d + 0.08, grain);  /* cada píxel aparece cuando su grano supera lo que falta */
  float spark = smoothstep(d - 0.04, d, grain) * (1.0 - smoothstep(d, d + 0.04, grain)) * d * g;
  vec3 col = vec3(r, g, b) * keep + spark * 1.6;
  float a = max(max(r, g), b) * keep;
  gl_FragColor = vec4(col, a);
}`;

  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) { return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const U = {};
  ['u_tex', 'u_res', 'u_time', 'u_all', 'u_word', 'u_rect'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
  gl.uniform1i(U.u_tex, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  holder.appendChild(canvas);
  hero.classList.add('fx-on');

  /* ── textura de texto: mismo tipo, tamaño y centrado que el DOM ── */
  const tcv = document.createElement('canvas');
  const tctx = tcv.getContext('2d');
  const PAD = 32;                       // holgura en px CSS para que el líquido no se corte
  let W = 1, H = 1;
  let rect = { x: 0, y: 0, z: 0, w: 0 };

  function draw() {
    const cs = getComputedStyle(title);
    const tr = title.getBoundingClientRect();
    const hr = holder.getBoundingClientRect();
    if (!tr.width || !tr.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 768 ? 1.5 : 2);
    const cssW = tr.width + PAD * 2, cssH = tr.height + PAD;
    canvas.style.left = (tr.left - hr.left - PAD) + 'px';
    canvas.style.top = (tr.top - hr.top - PAD / 2) + 'px';
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    W = Math.round(cssW * dpr); H = Math.round(cssH * dpr);
    canvas.width = W; canvas.height = H;
    tcv.width = W; tcv.height = H;

    const fs = parseFloat(cs.fontSize) * dpr;
    const lh = parseFloat(cs.lineHeight) * dpr;
    tctx.clearRect(0, 0, W, H);
    tctx.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
    if ('letterSpacing' in tctx) tctx.letterSpacing = ((parseFloat(cs.letterSpacing) || 0) * dpr) + 'px';
    tctx.fillStyle = '#fff';
    tctx.textBaseline = 'middle';
    tctx.textAlign = 'center';

    const word = wordEl.textContent.trim();
    const l1 = 'Not ' + word + ',';
    const cx = W / 2;
    const y1 = (PAD / 2) * dpr + lh * 0.5;
    const y2 = (PAD / 2) * dpr + lh * 1.5;
    tctx.fillText(l1, cx, y1);
    tctx.fillText('Not Normal.', cx, y2);

    // Caja de la palabra en uv (origen abajo-izquierda) para resolver solo
    // esa zona cuando cambia.
    const wAll = tctx.measureText(l1).width;
    const wNot = tctx.measureText('Not ').width;
    const wWord = tctx.measureText(word).width;
    const x0 = cx - wAll / 2 + wNot - 4, x1 = x0 + wWord + 8;
    rect = { x: x0 / W, y: 1 - (y1 + lh * 0.55) / H, z: x1 / W, w: 1 - (y1 - lh * 0.55) / H };

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tcv);
    gl.viewport(0, 0, W, H);
    needsFrame = true;
  }

  /* ── estado de la animación ── */
  const state = { all: 0, word: 1 };
  let running = true, needsFrame = true, last = 0;

  function animate(key, duration) {
    state[key] = 0;
    if (typeof gsap !== 'undefined') {
      gsap.to(state, { [key]: 1, duration, ease: 'power2.out', overwrite: 'auto' });
    } else {
      const t0 = performance.now();
      const tick = (t) => { state[key] = Math.min(1, (t - t0) / (duration * 1000)); if (state[key] < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }
  }

  function frame(t) {
    requestAnimationFrame(frame);
    if (!running || document.hidden) return;
    if (t - last < 1000 / 30) return;          // 30 fps basta y ahorra batería
    last = t;
    gl.uniform2f(U.u_res, W, H);
    gl.uniform1f(U.u_time, t / 1000);
    gl.uniform1f(U.u_all, state.all);
    gl.uniform1f(U.u_word, state.word);
    gl.uniform4f(U.u_rect, rect.x, rect.y, rect.z, rect.w);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  // Arranque: el titular se genera cuando el loader deja ver la web.
  const loader = document.getElementById('loader');
  function start() { draw(); animate('all', 1.9); }
  if (!loader || loader.classList.contains('hidden')) {
    start();
  } else {
    new MutationObserver((_, obs) => {
      if (loader.classList.contains('hidden')) { obs.disconnect(); setTimeout(start, 150); }
    }).observe(loader, { attributes: true, attributeFilter: ['class'] });
  }

  // Cada palabra nueva se vuelve a generar (solo su zona).
  new MutationObserver(() => { draw(); animate('word', 1.1); })
    .observe(wordEl, { childList: true, characterData: true, subtree: true });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => { running = entries[0].isIntersecting; }, { threshold: 0.05 }).observe(hero);
  }
  if ('ResizeObserver' in window) new ResizeObserver(() => draw()).observe(title);
  else window.addEventListener('resize', draw);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);

  draw();
  requestAnimationFrame(frame);
})();
