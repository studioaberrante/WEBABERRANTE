/* ============================================
   STUDIO ABERRANTE — main.js
   Scroll-Animated Canvas + GSAP
   ============================================ */

gsap.registerPlugin(ScrollTrigger);

/* ---- CONTENT LOADER ---- */
async function loadContent() {
  let data;
  try {
    const res = await fetch('content/site.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('fetch failed');
    data = await res.json();
  } catch (e) {
    console.warn('Could not load content/site.json, using static HTML.', e);
    return;
  }

  // Hero eyebrow
  const eyebrow = document.getElementById('heroEyebrow');
  if (eyebrow && data.hero?.eyebrow) {
    eyebrow.textContent = data.hero.eyebrow;
  }

  // Services
  const serviceItems = document.querySelectorAll('.service-item');
  if (data.services) {
    data.services.forEach((svc, i) => {
      const item = serviceItems[i];
      if (!item) return;
      const img  = item.querySelector('.service-img');
      const num  = item.querySelector('.service-num');
      const name = item.querySelector('.service-name');
      const desc = item.querySelector('.service-desc');
      if (img)  { img.src = svc.image; img.alt = svc.name; }
      if (num)  num.textContent = svc.num;
      if (name) name.textContent = svc.name;
      if (desc) desc.textContent = svc.desc;
    });
  }

  // Brands marquee: estático en el HTML — no depende de site.json
  // (en conexiones lentas el fetch dejaba la franja vacía)

  // Manifesto
  const manifesto = document.getElementById('manifestoText');
  if (manifesto && data.manifesto) {
    manifesto.innerHTML = data.manifesto
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .join('<br>\n        ');
  }
}

/* ---- HERO WORD CYCLING ---- */
(function initWordCycle() {
  const words    = ['Human', 'Traditional', 'Physical', 'Natural', 'Real'];
  let idx        = 0; // starts showing 'Real' (last in array), cycles forward
  const wordEl   = document.getElementById('heroWord');

  // Start at 'Real' (index 4), then cycle Human → Traditional → Physical → Natural → Real
  idx = words.indexOf('Real');

  function nextWord() {
    idx = (idx + 1) % words.length;

    // 1. Slide current word up & out
    wordEl.classList.add('exit');

    setTimeout(() => {
      // 2. Set new text, position below (no transition)
      wordEl.textContent = words[idx];
      wordEl.classList.remove('exit');
      wordEl.classList.add('enter');

      // 3. Force reflow then slide up into place
      void wordEl.offsetWidth;
      wordEl.classList.remove('enter');
    }, 380);
  }

  setInterval(nextWord, 2400);
})();

/* ---- "¿QUÉ MIERDA HACEMOS?" WORD CYCLING ---- */
(function initQhWordCycle() {
  const wordEl = document.getElementById('qhWord');
  if (!wordEl) return;
  const wrap = wordEl.parentElement; // .qh-word-wrap
  const words = ['MIERDA', 'CARAJOS', 'CHUCHA', 'WEÁ', 'DIABLOS'];
  let idx = 0;

  // Fija el ancho del hueco al de la palabra más larga para que
  // "HACEMOS?" no se mueva cada vez que cambia la palabra.
  function sizeWrap() {
    const cs = getComputedStyle(wordEl);
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;' +
      'font-family:' + cs.fontFamily + ';font-size:' + cs.fontSize +
      ';font-weight:' + cs.fontWeight + ';letter-spacing:' + cs.letterSpacing +
      ';text-transform:' + cs.textTransform + ';';
    document.body.appendChild(probe);
    let max = 0;
    words.forEach(w => { probe.textContent = w; max = Math.max(max, probe.offsetWidth); });
    probe.remove();
    wrap.style.width = Math.ceil(max) + 'px';
  }

  sizeWrap();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeWrap);
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(sizeWrap, 150); });

  function nextWord() {
    idx = (idx + 1) % words.length;
    wordEl.classList.add('exit');
    setTimeout(() => {
      wordEl.textContent = words[idx];
      wordEl.classList.remove('exit');
      wordEl.classList.add('enter');
      void wordEl.offsetWidth;
      wordEl.classList.remove('enter');
    }, 420);
  }

  setInterval(nextWord, 2000);
})();

/* ---- REEL: rubros rotativos ---- */
(function initReelWordCycle() {
  const wordEl = document.getElementById('reelWord');
  if (!wordEl) return;
  const wrap = wordEl.parentElement; // .reel-word-wrap
  const words = ['Clonamos', 'Animamos', 'Diseñamos', 'Generamos', 'Creamos'];
  let idx = 0;

  // Fija el ancho del hueco al de la palabra más larga para que el
  // texto no salte de tamaño cada vez que cambia la palabra.
  function sizeWrap() {
    const cs = getComputedStyle(wordEl);
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;' +
      'font-family:' + cs.fontFamily + ';font-size:' + cs.fontSize +
      ';font-weight:' + cs.fontWeight + ';letter-spacing:' + cs.letterSpacing +
      ';text-transform:' + cs.textTransform + ';';
    document.body.appendChild(probe);
    let max = 0;
    words.forEach(w => { probe.textContent = w; max = Math.max(max, probe.offsetWidth); });
    probe.remove();
    wrap.style.width = Math.ceil(max) + 'px';
  }

  sizeWrap();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeWrap);
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(sizeWrap, 150); });

  function nextWord() {
    idx = (idx + 1) % words.length;
    wordEl.classList.add('exit');
    setTimeout(() => {
      wordEl.textContent = words[idx];
      wordEl.classList.remove('exit');
      wordEl.classList.add('enter');
      void wordEl.offsetWidth;
      wordEl.classList.remove('enter');
    }, 420);
  }

  setInterval(nextWord, 2200);
})();

/* ---- MARQUEE DE MARCAS (relleno automático sin huecos) ---- */
(function initBrandsMarquee() {
  const track = document.getElementById('brandsTrack');
  if (!track) return;
  const baseHTML = track.innerHTML; // un set de logos

  function build() {
    // 1) un grupo que cubra al menos el ancho de pantalla
    track.style.animation = 'none';
    track.innerHTML = baseHTML;
    let guard = 0;
    while (track.scrollWidth < window.innerWidth && guard < 30) {
      track.innerHTML += baseHTML;
      guard++;
    }
    // 2) duplicar el grupo -> dos mitades idénticas para loop sin saltos
    const groupHTML = track.innerHTML;
    track.innerHTML = groupHTML + groupHTML;
    // 3) velocidad constante (~55px/s) sin importar cuántas copias haya
    const halfWidth = track.scrollWidth / 2;
    const duration = Math.max(20, halfWidth / 55);
    track.style.animation = `marquee-scroll ${duration}s linear infinite`;
  }

  build();
  // Rebuild cuando carguen imágenes/fuentes y al cambiar el tamaño
  window.addEventListener('load', build);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
})();

/* ---- LOADER ---- */
(function initLoader() {
  const loader  = document.getElementById('loader');
  const fill    = document.getElementById('loaderBarFill');
  let progress  = 0;
  let hidden    = false;

  const interval = setInterval(() => {
    progress = Math.min(progress + Math.random() * 12, 88);
    fill.style.width = progress + '%';
  }, 150);

  // Tiempo que se sostiene la frase "100% inteligencia artificial" antes
  // de entrar (incluye su fade de entrada).
  const CLAIM_MS = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1800 : 2600;

  function hideLoader() {
    if (hidden) return;
    hidden = true;
    clearInterval(interval);
    fill.style.width = '100%';
    setTimeout(() => loader.classList.add('claim'), 350);
    setTimeout(() => loader.classList.add('hidden'), 350 + CLAIM_MS);
  }

  // Se oculta APENAS el video del hero empieza a reproducirse → sin pantalla negra.
  // Tope de seguridad solo por si el autoplay está bloqueado.
  const iframe = document.querySelector('.hero-video-wrap iframe');
  if (iframe && typeof Vimeo !== 'undefined') {
    try {
      const player = new Vimeo.Player(iframe);
      player.on('play', () => hideLoader());
      player.on('playing', () => hideLoader());
    } catch (e) { /* si el player falla, el tope de abajo igual oculta */ }
  }
  setTimeout(hideLoader, 10000); // tope de seguridad (autoplay bloqueado)
})();

/* ---- FORMULARIO CONTACTO ---- */
(function initContactoForm() {
  const form    = document.getElementById('contactoForm');
  const success = document.getElementById('contactoSuccess');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    fetch('https://formspree.io/f/xdavzogz', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
    .then(res => {
      if (res.ok) {
        form.style.display = 'none';
        success.classList.add('visible');
      } else {
        throw new Error();
      }
    })
    .catch(() => {
      alert('Hubo un problema al enviar. Escríbenos directamente a Contacto@studioaberrante.com');
    });
  });
})();

/* ---- BOOTSTRAP ---- */
loadContent().then(() => {
  initEntranceAnimations();
  initServiciosHScroll();
  // Recalcular posiciones de scroll cuando la página termina de cargar
  // (el video, imágenes y fuentes cambian la altura y desfasan los triggers)
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  setTimeout(() => ScrollTrigger.refresh(), 1500);
});

/* ---- PORTFOLIO MODAL ---- */
(function initPortfolioModal() {
  const modal    = document.getElementById('portfolioModal');
  const iframe   = document.getElementById('portfolioModalIframe');
  const btnClose = document.getElementById('portfolioModalClose');
  if (!modal || !iframe || !btnClose) return;

  function openModal(vimeoId) {
    iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&badge=0&autopause=0`;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('cursor-hidden'); // cursor normal sobre el video
  }

  function closeModal() {
    modal.classList.remove('open');
    iframe.src = '';
    document.body.style.overflow = '';
    document.body.classList.remove('cursor-hidden');
  }

  document.addEventListener('portfolio:open', (e) => openModal(e.detail.vimeoId));
  btnClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
})();

/* ---- PORTAFOLIO: halo de videos ----
   Las tarjetas giran sobre una elipse. La tarjeta i queda en θ = i·paso + rotación:
   x = rx·cosθ, y = ry·sinθ, escala = min + (1−min)·(cosθ+1)/2. El mismo cosθ
   ubica, escala y apila cada tarjeta, así la que se ve más cerca siempre está
   más cerca. Una sola rotación mueve el anillo entero (autoplay, arrastre y
   ajuste final) tocando solo transforms, nunca el layout. */
(function initHaloReel() {
  const stage   = document.getElementById('haloStage');
  const ring    = document.getElementById('haloRing');
  const copy    = document.getElementById('haloCopy');
  const msgEl   = document.getElementById('haloMsg');
  const brandEl = document.getElementById('haloBrand');
  if (!stage || !ring) return;

  const cards = Array.from(ring.querySelectorAll('.halo-card'));
  const count = cards.length;
  if (!count) return;

  const TAU = Math.PI * 2;
  const CARD_W = 300, CARD_H = 169, MIN_SCALE = 0.42;
  const HOLD_MS = 3200, STEP_MS = 800;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileMq = window.matchMedia('(max-width: 768px)');
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const state = { r: 0 };
  const step = TAU / count;
  let w = 0, h = 0, rx = 0, ry = 0, cx = 0, cardW = CARD_W, cardH = CARD_H;
  let dragging = false, hovering = false, visible = true;
  let tween = null, timer = 0, active = -1, swapToken = 0;

  function measure() {
    w = stage.offsetWidth;
    h = stage.offsetHeight;
    // En mobile el anillo también cuelga del borde izquierdo, con radio de
    // media pantalla: la tarjeta del frente queda centrada y las demás se
    // abren en abanico hacia la izquierda.
    const mobile = mobileMq.matches;
    cx = 0;
    rx = w * (mobile ? 0.5 : 0.34);
    ry = h * (mobile ? 0.34 : 0.36);
    // Las tarjetas se achican de forma continua para caber en la caja, no
    // a saltos por breakpoint.
    const fit = clamp(Math.min(w / (rx + CARD_W), h / (2 * ry + CARD_H)), 0.45, 1);
    cardW = CARD_W * fit;
    cardH = CARD_H * fit;
    cards.forEach((c) => {
      c.style.width = cardW + 'px';
      c.style.height = cardH + 'px';
      c.style.marginLeft = (-cardW / 2) + 'px';
      c.style.marginTop = (-cardH / 2) + 'px';
      c.style.left = (cx * 100) + '%';
    });
    if (copy) copy.style.left = mobile ? '' : Math.round(w * cx + rx + cardW / 2 + 40) + 'px';
    render();
  }

  function render() {
    let best = -2, bestIdx = 0;
    cards.forEach((c, i) => {
      const t = i * step + state.r;
      const cos = Math.cos(t);
      const s = MIN_SCALE + (1 - MIN_SCALE) * ((cos + 1) / 2);
      c.style.transform = `translate3d(${(cos * rx).toFixed(1)}px, ${(Math.sin(t) * ry).toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
      c.style.zIndex = Math.round(s * 1000);
      if (cos > best) { best = cos; bestIdx = i; }
    });
    if (bestIdx !== active) setActive(bestIdx);
  }

  function setActive(i) {
    const first = active === -1;
    active = i;
    if (!msgEl || !brandEl) return;
    const card = cards[i];
    if (first) {
      msgEl.textContent = card.dataset.msg || '';
      brandEl.textContent = card.dataset.brand || '';
      return;
    }
    const token = ++swapToken;
    msgEl.classList.add('swap');
    brandEl.classList.add('swap');
    setTimeout(() => {
      if (token !== swapToken) return;
      msgEl.textContent = card.dataset.msg || '';
      brandEl.textContent = card.dataset.brand || '';
      msgEl.classList.remove('swap');
      brandEl.classList.remove('swap');
    }, 220);
  }

  function spinTo(target, duration, ease, onComplete) {
    if (tween) tween.kill();
    if (reduceMotion || !duration) {
      state.r = target;
      render();
      if (onComplete) onComplete();
      return;
    }
    tween = gsap.to(state, { r: target, duration, ease, onUpdate: render, onComplete });
  }

  const snapped = () => Math.round(state.r / step) * step;

  // Autoplay: cada paso agenda el siguiente, así una pausa (arrastre, hover,
  // fuera de pantalla) solo cuesta volver a chequear.
  function schedule() {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (dragging || hovering || !visible || document.hidden) { schedule(); return; }
      spinTo(snapped() - step, STEP_MS / 1000, 'power2.inOut', schedule);
    }, HOLD_MS);
  }

  /* ── arrastre ──
     Deslizar en horizontal gira el anillo: un recorrido de ~0.6 anchos de
     tarjeta avanza una tarjeta. Se usa la distancia en X y no el ángulo
     respecto al centro, porque un swipe horizontal sobre la tarjeta del
     frente pasa por el eje de la elipse y el ángulo casi no cambia; el gesto
     vertical, que sí lo cambiaría, se reserva para el scroll de la página
     (touch-action: pan-y). */
  const drag = { lastX: 0, x0: 0, y0: 0, moved: 0, card: null };

  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.lastX = e.clientX;
    drag.x0 = e.clientX;
    drag.y0 = e.clientY;
    drag.moved = 0;
    drag.card = e.target.closest('.halo-card');
    dragging = true;
    stage.classList.add('is-dragging');
    stage.setPointerCapture(e.pointerId);
    if (tween) tween.kill();
  });

  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0));
    const dx = e.clientX - drag.lastX;
    drag.lastX = e.clientX;
    // dx negativo (swipe a la izquierda) avanza a la siguiente tarjeta,
    // igual que el autoplay.
    state.r += (dx / (cardW * 0.6)) * step;
    render();
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
    if (drag.moved < 6 && drag.card) {
      document.dispatchEvent(new CustomEvent('portfolio:open', { detail: { vimeoId: drag.card.dataset.vimeo } }));
    }
    // Se asienta sobre la tarjeta más cercana: el anillo nunca queda entre dos.
    spinTo(snapped(), 0.5, 'expo.out');
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  stage.addEventListener('keydown', (e) => {
    const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    spinTo(snapped() - dir * step, STEP_MS / 1000, 'power2.inOut');
  });

  cards.forEach((c) => {
    c.addEventListener('pointerenter', () => { hovering = true; });
    c.addEventListener('pointerleave', () => { hovering = false; });
  });

  /* ── carátulas: el iframe se funde encima recién cuando reproduce ── */
  const players = [];
  cards.forEach((card) => {
    const iframe = card.querySelector('iframe');
    if (!iframe) return;
    const show = () => card.classList.add('playing');
    const fallback = () => iframe.addEventListener('load', () => setTimeout(show, 600));
    if (typeof Vimeo === 'undefined') { fallback(); return; }
    try {
      const player = new Vimeo.Player(iframe);
      player.on('play', show);
      player.on('playing', show);
      players.push(player);
    } catch (e) { fallback(); }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visible = entry.isIntersecting;
        if (!visible) return;
        // Con varios videos de fondo en la página el navegador a veces bloquea
        // el autoplay de los que cargan después: se reintenta al entrar.
        players.forEach((p) => {
          p.getPaused().then((paused) => { if (paused) p.play().catch(() => {}); }).catch(() => {});
        });
      });
    }, { threshold: 0.15 }).observe(stage);
  }

  measure();
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(stage);
  else window.addEventListener('resize', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  if (!reduceMotion) schedule();
})();

/* ---- ENTRANCE ANIMATIONS ---- */
function initEntranceAnimations() {

  // Hero text
  gsap.fromTo('.hero-eyebrow', {
    y: 16, opacity: 0
  }, {
    y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.3
  });

  gsap.fromTo('.hero-title', {
    y: 40, opacity: 0
  }, {
    y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.45
  });

  gsap.fromTo('.scroll-hint', {
    opacity: 0
  }, {
    opacity: 1, duration: 1, ease: 'power2.out', delay: 1.1
  });

  gsap.fromTo('.hero-logo-float', {
    x: 20, opacity: 0
  }, {
    x: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.6
  });

  // Qué hacemos
  gsap.fromTo('.qh-title', {
    y: 40, opacity: 0
  }, {
    y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.que-hacemos', start: 'top 75%' }
  });

  gsap.fromTo('.qh-intro', {
    y: 24, opacity: 0
  }, {
    y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2,
    scrollTrigger: { trigger: '.que-hacemos', start: 'top 70%' }
  });

  // (Servicios usa scroll horizontal propio, ver initServiciosHScroll)

  // Portafolio (halo): el texto de la derecha entra al llegar a la sección.
  // clearProps deja los estilos limpios para que el cambio de mensaje
  // (clase .swap) siga funcionando después.
  gsap.fromTo('.halo-copy > *', {
    y: 24, opacity: 0
  }, {
    y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out',
    clearProps: 'all',
    scrollTrigger: { trigger: '.halo', start: 'top 75%' }
  });

  // Nosotros
  gsap.fromTo('.nosotros-header .section-label', {
    opacity: 0
  }, {
    opacity: 1, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '.nosotros-header', start: 'top 82%' }
  });

  gsap.fromTo('.nosotros-title', {
    y: 30, opacity: 0
  }, {
    y: 0, opacity: 1, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.nosotros-header', start: 'top 82%' }
  });

  gsap.utils.toArray('.nosotros-video').forEach((el, i) => {
    gsap.fromTo(el, {
      y: 40, opacity: 0
    }, {
      y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
      delay: i * 0.15,
      scrollTrigger: { trigger: '.nosotros-banner', start: 'top 82%' }
    });
  });

  // Manifesto
  gsap.fromTo('.manifesto-text', {
    y: 30, opacity: 0
  }, {
    y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
    scrollTrigger: { trigger: '.manifesto', start: 'top 78%' }
  });

  // Footer
  gsap.fromTo('.footer-title', {
    y: 40, opacity: 0
  }, {
    y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
    scrollTrigger: { trigger: '.footer', start: 'top 80%' }
  });

  gsap.fromTo('.footer-cta', {
    y: 20, opacity: 0
  }, {
    y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.2,
    scrollTrigger: { trigger: '.footer', start: 'top 80%' }
  });
}

/* ---- SERVICIOS: SCROLL HORIZONTAL FIJADO (pin) ---- */
function initServiciosHScroll() {
  const section  = document.querySelector('.servicios');
  const track    = document.getElementById('serviciosTrack');
  const progress = document.getElementById('serviciosProgress');
  const hint     = document.getElementById('serviciosHint');
  if (!section || !track) return;

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1px)', () => {
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        scrub: 0.3,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progress) progress.style.width = (self.progress * 100) + '%';
        }
      }
    });

    // Indicador "Desliza →": aparece tras inactividad dentro de la sección
    let idleTimer;
    const st = () => tween.scrollTrigger;
    const resetIdle = () => {
      clearTimeout(idleTimer);
      if (hint) hint.style.opacity = '0';
      idleTimer = setTimeout(() => {
        if (hint && st() && st().isActive && st().progress < 0.92) hint.style.opacity = '1';
      }, 2000);
    };
    window.addEventListener('scroll', resetIdle, { passive: true });
    resetIdle();

    // Arrastre lateral SOLO en computador (mouse). En táctil se usa el scroll
    // normal del dedo, que ya mueve los servicios vía el pin (sin interferir).
    const cleanups = [];
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let dragging = false, lastX = 0;
      const onDown = (e) => { dragging = true; lastX = e.clientX; resetIdle(); };
      const onMove = (e) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        window.scrollBy(0, -dx * 2.4);
        lastX = e.clientX;
      };
      const onUp = () => { dragging = false; };
      section.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
      cleanups.push(() => {
        section.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      });
    }

    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
      gsap.set(track, { x: 0 });
      clearTimeout(idleTimer);
      window.removeEventListener('scroll', resetIdle);
      cleanups.forEach((fn) => fn());
    };
  });
}

/* ---- MENÚ MÓVIL ---- */
(function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav    = document.getElementById('headerNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ---- HEADER SCROLL STATE ---- */
const header = document.getElementById('header');

ScrollTrigger.create({
  start: 'top -80',
  onUpdate: (self) => {
    if (self.scroll() > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
});

/* (Cursor personalizado retirado: se usa el puntero normal del sistema) */

/* ---- NOSOTROS: carátulas de los videos del equipo ---- */
(function initNosotrosPosters() {
  const videos = document.querySelectorAll('.nosotros-video[data-vimeo]');
  if (!videos.length) return;

  videos.forEach((wrap) => {
    const iframe = wrap.querySelector('iframe');
    if (!iframe) return;
    const show = () => wrap.classList.add('playing');
    let player = null;
    if (typeof Vimeo !== 'undefined') {
      try {
        player = new Vimeo.Player(iframe);
        player.on('play', show);
        player.on('playing', show);
      } catch (e) { /* cae al respaldo de abajo */ }
    }
    if (!player) {
      iframe.addEventListener('load', () => setTimeout(show, 600));
      return;
    }
    // Con varios videos de fondo en la misma página el navegador a veces
    // bloquea el autoplay de los que cargan después (hero + reel ya
    // reproducen). Reintenta apenas la tarjeta entra en pantalla.
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          player.getPaused().then((paused) => {
            if (paused) player.play().catch(() => {});
          });
        });
      }, { threshold: 0.25 });
      io.observe(wrap);
    }
  });
})();
