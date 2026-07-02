/* ============================================
   ABERRANTE TV — lógica
   ============================================ */

/* ---- INTRO DE ENTRADA (se reproduce al entrar a Aberrante TV) ---- */
(function initIntro() {
  const intro = document.getElementById('tvIntro');
  if (!intro) return;

  // Si llega con enlace directo a una pieza (#pieza/...), saltamos la intro
  // para que lo compartido se vea de inmediato.
  if (/^#pieza\//.test(location.hash)) { intro.remove(); return; }

  const video = document.getElementById('tvIntroVideo');

  function start() {
    document.body.style.overflow = 'hidden';
    let done = false, timer;

    function end() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      intro.classList.add('hide');
      document.body.style.overflow = '';
      setTimeout(() => intro.remove(), 600);
    }

    // Cierre por TIEMPO fijo, sincronizado con el final de la intro (~3.1 s).
    // No usamos 'ended' ni video.duration porque en algunos entornos no son fiables.
    timer = setTimeout(end, 3150);

    // Intenta reproducir CON sonido desde el inicio; si el navegador lo bloquea,
    // arranca muteada. (La intro la controla el JS; el <video> ya no tiene autoplay
    // para que no se reproduzca detrás de la pantalla de acceso.)
    if (video) {
      try { video.currentTime = 0; } catch (e) {}
      video.play().catch(() => { video.muted = true; video.play().catch(() => {}); });
    }
    intro.addEventListener('click', end); // permite saltar con click
  }

  start();
})();

const PIEZAS = {
  // --- Aberrante Originals (solo en Aberrante TV) ---
  '1203128705': { titulo: 'Final Day', tipo: 'Cortometraje', autor: 'Studio Aberrante', label: 'Aberrante Originals', tags: ['Cinemático', 'Original'] },
  '1203129093': { titulo: 'Route 5',   tipo: 'Cortometraje', autor: 'Studio Aberrante', label: 'Aberrante Originals', tags: ['Cinemático', 'Original'] },
  '1203129625': { titulo: '847 Días',  tipo: 'Cortometraje', autor: 'Studio Aberrante', label: 'Aberrante Originals', tags: ['Cinemático', 'Original'] },
  '1203130346': { titulo: 'Better Days with Music', tipo: 'Cortometraje', autor: 'Studio Aberrante', label: 'Aberrante Originals', tags: ['Cinemático', 'Música'] },
  '1203147533': { titulo: 'Para cuando ya no esté', tipo: 'Cortometraje', autor: 'Studio Aberrante', label: 'Aberrante Originals', tags: ['Cinemático', 'Emotivo'] },

  // --- Tráiler de Aberrante TV (destacado en el Hero) ---
  '1204431007': { titulo: 'Aberrante TV+', tipo: 'Tráiler', autor: 'Studio Aberrante', label: 'Tráiler oficial', tags: ['Tráiler'], descripcion: 'Un vistazo a todo lo que se viene en Aberrante TV+: nuestros Originals, los creadores que elegimos y mucho más por descubrir.' },

  // --- Aberrante Selects (creadores externos que curamos) ---
  '1204119921': {
    titulo: 'A World Without a Phone',
    tipo: 'Cortometraje',
    autor: 'Talat Nasreddin',
    pais: 'Indonesia',
    label: 'Aberrante Selects',
    tags: ['Selects', 'Invitado'],
    descripcion: 'Un niño que crece en un pueblo donde todos viven pegados a sus teléfonos nunca ha conocido un mundo sin pantallas. Su vida cambia cuando se encuentra con un misterioso anciano que lo transporta a una época anterior a que las pantallas dominaran la vida cotidiana. Juntos recorren un pasado vibrante donde los niños llenaban las calles de risas, las amistades se construían cara a cara y el pueblo rebosaba de alegría. Al ver todo lo que se perdió, el niño regresa con un recordatorio simple pero poderoso: alguna vez existió un mundo sin teléfonos.',
    redes: [{ red: 'LinkedIn', url: 'https://www.linkedin.com/in/nasreddintalat/' }]
  },
  '1205321697': {
    titulo: 'Get Ready With Me',
    tipo: 'Cortometraje',
    autor: 'Nina Menzel',
    label: 'Aberrante Selects',
    tags: ['Selects', 'Invitado'],
    descripcion: 'Una versión surrealista y satírica del formato "Get Ready With Me", que traslada la rutina matutina privada habitual a un mundo exterior inquietante. El video sigue a distintos personajes a través de rituales extraños y exagerados, usando el humor y la absurdidad cinematográfica para reinterpretar la autopresentación cotidiana y la performance de estar "lista".',
    redes: [{ red: 'Instagram', url: 'https://www.instagram.com/chaudsoleil' }]
  }
};

const ORIGINALS = ['1203128705', '1203129093', '1203129625', '1203130346', '1203147533'];

// Tráiler de Aberrante TV (se muestra primero en el Hero)
const TRAILER_ID = '1204431007';

const FILAS = [
  { id: 'row-originals', titulo: 'Aberrante Originals', sub: 'Contenido original creado por nosotros', posters: true,  ids: ORIGINALS },
  { id: 'row-staff',     titulo: 'Staff Picks',          sub: 'Selección del equipo',                  posters: false, ids: ['1203129093', '1204119921'] },
  { id: 'row-selects',   titulo: 'Aberrante Selects',     sub: 'Creadores que elegimos',                posters: false, ids: ['1204119921', '1205321697'] },
  { id: 'row-cat',       titulo: 'Categorías',           sub: '',                                       posters: false, comingSoon: true }
];

const SLIDE_MS   = 6000;   // duración de cada Original en el Hero
const TRAILER_MS = 30000;  // duración del tráiler en el Hero (~30s)

// Hero: primero el tráiler de Aberrante TV, luego rotan los Originals.
// Cada slide tiene su propia duración.
const HERO = [
  { id: TRAILER_ID, dur: TRAILER_MS },
  ...ORIGINALS.map(id => ({ id, dur: SLIDE_MS }))
];

/* ---- ESTADÍSTICAS (Supabase): likes y visualizaciones reales ---- */
const SB_URL = 'https://qsjzfjulpijkptdqxune.supabase.co';
const SB_KEY = 'sb_publishable_G0uJX-43eW2LtJtcsstrag_uoBFwdle';
const SB_HEADERS = { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' };

const STATS = {}; // id -> { likes, views }
function statScore(id) { const s = STATS[id]; return s ? s.views + s.likes * 3 : 0; }

function sbRpc(fn, body) {
  return fetch(`${SB_URL}/rest/v1/rpc/${fn}`, { method: 'POST', headers: SB_HEADERS, body: JSON.stringify(body) })
    .then(r => { if (!r.ok) throw new Error(fn); return r.json(); });
}

// Carga inicial de contadores; si falla, la web sigue funcionando con 0
const statsReady = fetch(`${SB_URL}/rest/v1/tv_stats?select=id,likes,views`, { headers: SB_HEADERS })
  .then(r => r.json())
  .then(rows => { rows.forEach(r => { STATS[r.id] = { likes: r.likes, views: r.views }; }); })
  .catch(() => {});

// Likes del usuario en este dispositivo (para pintar el corazón y evitar dobles)
const LIKES_KEY = 'aberrante_tv_likes';
let likedSet;
try { likedSet = new Set(JSON.parse(localStorage.getItem(LIKES_KEY) || '[]')); }
catch (e) { likedSet = new Set(); }
function saveLiked() { try { localStorage.setItem(LIKES_KEY, JSON.stringify([...likedSet])); } catch (e) {} }

// Una visualización por pieza por visita (se cuenta al presionar Reproducir)
const viewedSession = new Set();
function countView(id) {
  if (viewedSession.has(id)) return;
  viewedSession.add(id);
  sbRpc('tv_view', { piece_id: id })
    .then(n => {
      if (!STATS[id]) STATS[id] = { likes: 0, views: 0 };
      STATS[id].views = n;
    })
    .catch(() => {});
}

/* ---- THUMBNAILS DE VIMEO ---- */
const rawCache = {};
function getRaw(id) {
  if (rawCache[id]) return Promise.resolve(rawCache[id]);
  return fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`)
    .then(r => r.json())
    .then(d => { rawCache[id] = d.thumbnail_url || ''; return rawCache[id]; })
    .catch(() => '');
}
function loadImageWithFallback(id, size, onReady) {
  getRaw(id).then(raw => {
    if (!raw) return;
    const big = raw.replace(/_\d+x\d+/, '_' + size);
    const img = new Image();
    img.onload = () => onReady(big);
    img.onerror = () => onReady(raw);
    img.src = big;
  });
}
function applyThumb(imgEl, id, size) {
  getRaw(id).then(raw => { if (raw) imgEl.src = raw.replace(/_\d+x\d+/, '_' + size); });
}

/* ---- TARJETA (reutilizable) ---- */
function makeCard(id, posters) {
  const p = PIEZAS[id];
  const card = document.createElement('div');
  card.className = 'tv-card';
  card.dataset.vimeo = id;
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${p.titulo} — ${p.tipo} de ${p.autor}`);
  card.innerHTML = `
    <div class="tv-card-thumb">
      <img alt="${p.titulo}" loading="lazy">
      <div class="tv-card-play">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </div>
    </div>
    <div class="tv-card-info">
      <p class="tv-card-name">${p.titulo}</p>
      <p class="tv-card-sub">${p.tipo} · ${p.autor}</p>
    </div>`;
  applyThumb(card.querySelector('img'), id, posters ? '540x720' : '640x360');
  return card;
}

/* ---- HERO (Originals reproduciéndose, rotan cada SLIDE_MS) ---- */
(function initHero() {
  const bg       = document.getElementById('tvHeroBg');
  const video    = document.getElementById('tvHeroVideo');
  const eyebrow  = document.getElementById('tvHeroEyebrow');
  const title    = document.getElementById('tvHeroTitle');
  const sub      = document.getElementById('tvHeroSub');
  const watch    = document.getElementById('tvHeroWatch');
  const progress = document.getElementById('tvHeroProgress');
  let i = 0, timer;

  // Construir segmentos de progreso (uno por slide del Hero)
  const segs = HERO.map((_, idx) => {
    const seg = document.createElement('span');
    seg.className = 'seg';
    seg.innerHTML = '<span class="seg-fill"></span>';
    seg.addEventListener('click', () => show(idx));
    progress.appendChild(seg);
    return seg.querySelector('.seg-fill');
  });

  function paintSegments() {
    segs.forEach((fill, k) => {
      const seg = fill.parentElement;
      fill.style.transition = 'none';
      fill.style.width = '0%';
      if (k === i) {
        // El que se reproduce: barra que se llena durante la duración del slide
        seg.classList.add('active');
        void fill.offsetWidth; // reflow
        fill.style.transition = `width ${HERO[i].dur}ms linear`;
        fill.style.width = '100%';
      } else {
        // El resto: puntos
        seg.classList.remove('active');
      }
    });
  }

  function show(idx) {
    i = (idx + HERO.length) % HERO.length;
    const id = HERO[i].id;
    const p = PIEZAS[id];
    // Imagen de respaldo mientras carga el video
    loadImageWithFallback(id, '1280x720', (url) => { bg.style.backgroundImage = `url(${url})`; });
    // Video en silencio, loop, sin controles
    video.src = `https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1&badge=0`;
    eyebrow.textContent = p.label;
    title.textContent = p.titulo;
    sub.textContent = `${p.tipo} · ${p.autor}`;
    watch.onclick = () => openDetail(id);
    paintSegments();
    restartTimer();
  }
  // Sin auto-rotación si el usuario prefiere menos movimiento (accesibilidad);
  // los puntos siguen permitiendo cambiar de slide a mano.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function restartTimer() {
    clearTimeout(timer);
    if (reduceMotion) return;
    timer = setTimeout(() => show(i + 1), HERO[i].dur);
  }

  show(0);
})();

/* ---- RENDER DE FILAS ---- */
(function renderRows() {
  const root = document.getElementById('tvRows');
  FILAS.forEach(fila => {
    const section = document.createElement('section');
    section.className = 'tv-row' + (fila.posters ? ' tv-row--posters' : '');
    section.id = fila.id;

    const head = document.createElement('div');
    head.className = 'tv-row-head';
    head.innerHTML = `
      <div class="tv-row-titles">
        <h2>${fila.titulo}</h2>
        ${fila.sub ? `<p>${fila.sub}</p>` : ''}
      </div>
      ${fila.comingSoon ? '' : `
      <div class="tv-row-nav">
        <div class="tv-row-arrows">
          <button data-dir="-1" aria-label="Anterior">‹</button>
          <button data-dir="1" aria-label="Siguiente">›</button>
        </div>
      </div>`}`;
    section.appendChild(head);

    if (fila.comingSoon) {
      const soon = document.createElement('div');
      soon.className = 'tv-row-soon';
      soon.innerHTML = '<span>Próximamente</span>';
      section.appendChild(soon);
      root.appendChild(section);
      return;
    }

    const track = document.createElement('div');
    track.className = 'tv-track';
    fila.ids.forEach(id => { if (PIEZAS[id]) track.appendChild(makeCard(id, fila.posters)); });
    section.appendChild(track);
    root.appendChild(section);

    head.querySelectorAll('.tv-row-arrows button').forEach(btn => {
      btn.addEventListener('click', () => {
        track.scrollBy({ left: track.clientWidth * 0.8 * Number(btn.dataset.dir), behavior: 'smooth' });
      });
    });
  });
})();

/* ---- FILA "TENDENCIAS" (recomendación real según likes y vistas) ---- */
statsReady.then(() => {
  const ids = Object.keys(PIEZAS)
    .filter(id => id !== TRAILER_ID && statScore(id) > 0)
    .sort((a, b) => statScore(b) - statScore(a))
    .slice(0, 8);
  if (ids.length < 2) return; // aún no hay datos suficientes para recomendar

  const section = document.createElement('section');
  section.className = 'tv-row';
  section.id = 'row-tendencias';
  section.innerHTML = `
    <div class="tv-row-head">
      <div class="tv-row-titles">
        <h2>Tendencias</h2>
        <p>Lo más visto en Aberrante TV</p>
      </div>
      <div class="tv-row-nav">
        <div class="tv-row-arrows">
          <button data-dir="-1" aria-label="Anterior">‹</button>
          <button data-dir="1" aria-label="Siguiente">›</button>
        </div>
      </div>
    </div>`;
  const track = document.createElement('div');
  track.className = 'tv-track';
  ids.forEach(id => track.appendChild(makeCard(id, false)));
  section.appendChild(track);
  section.querySelectorAll('.tv-row-arrows button').forEach(btn => {
    btn.addEventListener('click', () => {
      track.scrollBy({ left: track.clientWidth * 0.8 * Number(btn.dataset.dir), behavior: 'smooth' });
    });
  });
  document.getElementById('row-originals').after(section);
});

/* ---- VISTA DE DETALLE (estilo Netflix) ---- */
const detail      = document.getElementById('tvDetail');
const dStage      = document.getElementById('tvDetailStage');
const dCoverImg   = document.getElementById('tvDetailCoverImg');
const dBigPlay    = document.getElementById('tvDetailBigPlay');
const dIframe     = document.getElementById('tvDetailIframe');
const dScroll     = document.getElementById('tvDetailScroll');
const dTitle      = document.getElementById('tvDetailTitle');
const dType       = document.getElementById('tvDetailType');
const dPlay       = document.getElementById('tvDetailPlay');
const dDesc       = document.getElementById('tvDetailDesc');
const dAuthor     = document.getElementById('tvDetailAuthor');
const dCountry    = document.getElementById('tvDetailCountry');
const dContact    = document.getElementById('tvDetailContact');
const dSocials    = document.getElementById('tvDetailSocials');
const dLike       = document.getElementById('tvDetailLike');
const dLikeCount  = document.getElementById('tvDetailLikeCount');
const dTags       = document.getElementById('tvDetailTags');
const dRelated    = document.getElementById('tvRelated');
let currentId = null;

// Render de redes sociales del creador (array de { red, url })
function renderSocials(redes) {
  if (!redes || !redes.length) return '';
  return redes.map(r =>
    `<a class="tv-social" href="${r.url}" target="_blank" rel="noopener">${r.red} ↗</a>`
  ).join('');
}

function openDetail(id, fromHistory) {
  const p = PIEZAS[id];
  if (!p) return;
  currentId = id;

  // URL propia por pieza: permite compartir enlaces directos y que el
  // botón atrás del navegador cierre el detalle en vez de salir del sitio.
  // (sin duplicar la entrada si ya estamos en esa pieza)
  if (!fromHistory && location.hash !== '#pieza/' + id) history.pushState({ pieza: id }, '', '#pieza/' + id);

  // Portada grande (aún no se reproduce el video)
  dStage.classList.remove('playing');
  dIframe.src = '';
  dCoverImg.alt = p.titulo;
  applyThumb(dCoverImg, id, '1280x720');

  dTitle.textContent = p.titulo;
  const s = STATS[id];
  const views = s && s.views > 0
    ? `${s.views.toLocaleString('es-CL')} ${s.views === 1 ? 'visualización' : 'visualizaciones'}`
    : '';
  dType.textContent = [p.label ? `${p.tipo} · ${p.label}` : p.tipo, views].filter(Boolean).join(' · ');

  dDesc.textContent = p.descripcion || '';
  dDesc.style.display = p.descripcion ? '' : 'none';

  dAuthor.textContent = p.autor;
  dCountry.textContent = p.pais ? `· ${p.pais}` : '';
  dSocials.innerHTML = renderSocials(p.redes);
  dContact.style.display = (p.redes && p.redes.length) ? '' : 'none';

  dLike.classList.toggle('liked', likedSet.has(id));
  dLikeCount.textContent = s ? s.likes : 0;
  dTags.innerHTML = p.tags.map(t => `<span>${t}</span>`).join('');

  // Relacionados: otras piezas (sin el tráiler), las más populares primero
  dRelated.innerHTML = '';
  Object.keys(PIEZAS)
    .filter(k => k !== id && k !== TRAILER_ID)
    .sort((a, b) => statScore(b) - statScore(a))
    .forEach(rid => dRelated.appendChild(makeCard(rid, false)));

  detail.classList.add('open');
  document.body.style.overflow = 'hidden';
  dScroll.scrollTop = 0;
}

function playVideo() {
  if (!currentId) return;
  countView(currentId);
  dIframe.src = `https://player.vimeo.com/video/${currentId}?autoplay=1&badge=0`;
  dStage.classList.add('playing');
  dStage.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
dPlay.addEventListener('click', playVideo);
dBigPlay.addEventListener('click', playVideo);

function closeDetail(fromHistory) {
  // Si el detalle dejó una entrada en el historial, retrocedemos para
  // mantener el historial limpio; popstate hace el cierre real.
  if (!fromHistory && /^#pieza\//.test(location.hash)) { history.back(); return; }
  detail.classList.remove('open');
  dStage.classList.remove('playing');
  dIframe.src = '';
  document.body.style.overflow = '';
  currentId = null;
}

document.getElementById('tvDetailBack').addEventListener('click', () => closeDetail());
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && detail.classList.contains('open')) closeDetail(); });

// Botón atrás/adelante del navegador: abre o cierra el detalle según el hash
window.addEventListener('popstate', () => {
  const m = location.hash.match(/^#pieza\/(\d+)$/);
  if (m && PIEZAS[m[1]]) openDetail(m[1], true);
  else if (detail.classList.contains('open')) closeDetail(true);
});

// Like real (persistente en Supabase, con actualización optimista)
dLike.addEventListener('click', () => {
  if (!currentId) return;
  const id = currentId;
  const liked = likedSet.has(id);
  const delta = liked ? -1 : 1;
  if (liked) likedSet.delete(id); else likedSet.add(id);
  saveLiked();
  dLike.classList.toggle('liked', !liked);
  if (!STATS[id]) STATS[id] = { likes: 0, views: 0 };
  STATS[id].likes = Math.max(STATS[id].likes + delta, 0);
  dLikeCount.textContent = STATS[id].likes;
  sbRpc('tv_like', { piece_id: id, delta })
    .then(n => { STATS[id].likes = n; if (currentId === id) dLikeCount.textContent = n; })
    .catch(() => {});
});

// Compartir
const toast = document.getElementById('tvToast');
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}
document.getElementById('tvDetailShare').addEventListener('click', async () => {
  const p = PIEZAS[currentId];
  // Enlace directo a la pieza: quien lo abra llega directo a este detalle
  const shareUrl = location.origin + location.pathname + '#pieza/' + currentId;
  const data = { title: `${p.titulo} — Aberrante TV`, text: `Mira "${p.titulo}" en Aberrante TV`, url: shareUrl };
  if (navigator.share) {
    try { await navigator.share(data); } catch (e) {}
  } else {
    try { await navigator.clipboard.writeText(shareUrl); showToast('Enlace copiado'); }
    catch (e) { showToast('Copia el enlace desde la barra'); }
  }
});

// Click o teclado (Enter/Espacio) en tarjeta -> detalle
function cardActivate(e) {
  if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
  const card = e.target.closest('.tv-card');
  if (!card) return;
  if (e.type === 'keydown') e.preventDefault();
  openDetail(card.dataset.vimeo);
}
document.getElementById('tvRows').addEventListener('click', cardActivate);
document.getElementById('tvRows').addEventListener('keydown', cardActivate);
dRelated.addEventListener('click', cardActivate);
dRelated.addEventListener('keydown', cardActivate);

// Enlace directo compartido: abre la pieza de inmediato, dejando el home
// como paso previo en el historial (así "Volver" no saca del sitio).
(function initDeepLink() {
  const m = location.hash.match(/^#pieza\/(\d+)$/);
  if (m && PIEZAS[m[1]]) {
    history.replaceState(null, '', location.pathname + location.search);
    openDetail(m[1]);
    // Refresca likes/vistas cuando lleguen las estadísticas
    statsReady.then(() => { if (currentId === m[1]) openDetail(m[1], true); });
  }
})();

/* ---- NAV TUBELIGHT ---- */
(function initTube() {
  const nav  = document.getElementById('tvNav');
  const tube = document.getElementById('tvNavTube');
  const links = [...nav.querySelectorAll('a')];

  function moveTube(link) {
    tube.style.left = link.offsetLeft + 'px';
    tube.style.width = link.offsetWidth + 'px';
  }
  function setActive(link) {
    links.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    moveTube(link);
  }

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      setActive(link);
      if (link.dataset.target === 'top') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });
  });

  const init = () => moveTube(nav.querySelector('a.active'));
  init();
  window.addEventListener('resize', init);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
})();

/* ---- HEADER SÓLIDO AL SCROLLEAR ---- */
const header = document.getElementById('tvHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('solid', window.scrollY > 60);
}, { passive: true });

/* ---- FONDO DE ONDA ANIMADO (CTA) — versión nativa optimizada ---- */
(function initCtaWave() {
  const canvas = document.getElementById('tvCtaWave');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const SCALE = 3; // resolución reducida = más liviano
  let width, height, imageData, data, raf = null, running = false;
  const startTime = Date.now();

  const SIN = new Float32Array(1024), COS = new Float32Array(1024);
  for (let i = 0; i < 1024; i++) { const a = (i / 1024) * Math.PI * 2; SIN[i] = Math.sin(a); COS[i] = Math.cos(a); }
  const fSin = (x) => SIN[Math.floor(((x % (Math.PI * 2)) / (Math.PI * 2)) * 1024) & 1023];
  const fCos = (x) => COS[Math.floor(((x % (Math.PI * 2)) / (Math.PI * 2)) * 1024) & 1023];

  function resize() {
    canvas.width = Math.max(1, canvas.clientWidth);
    canvas.height = Math.max(1, canvas.clientHeight);
    width = Math.floor(canvas.width / SCALE);
    height = Math.floor(canvas.height / SCALE);
    imageData = ctx.createImageData(width, height);
    data = imageData.data;
  }

  function render() {
    if (!running) return;
    const time = (Date.now() - startTime) * 0.001;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const ux = (2 * x - width) / height;
        const uy = (2 * y - height) / height;
        let a = 0, d = 0;
        for (let i = 0; i < 4; i++) { a += fCos(i - d + time * 0.5 - a * ux); d += fSin(i * uy + a); }
        const wave = (fSin(a) + fCos(d)) * 0.5;
        const intensity = 0.3 + 0.4 * wave;
        const baseVal = 0.1 + 0.15 * fCos(ux + uy + time * 0.3);
        const blue = 0.2 * fSin(a * 1.5 + time * 0.2);
        const purple = 0.15 * fCos(d * 2 + time * 0.1);
        const r = Math.max(0, Math.min(1, baseVal + purple * 0.8)) * intensity;
        const g = Math.max(0, Math.min(1, baseVal + blue * 0.6)) * intensity;
        const b = Math.max(0, Math.min(1, baseVal + blue * 1.2 + purple * 0.4)) * intensity;
        const idx = (y * width + x) * 4;
        data[idx] = r * 255; data[idx + 1] = g * 255; data[idx + 2] = b * 255; data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
    raf = requestAnimationFrame(render);
  }

  function start() { if (running) return; running = true; render(); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

  resize();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });

  // Pausa solo cuando la sección NO está en pantalla (ahorra CPU)
  const section = document.getElementById('tv-cta');
  function checkVisible() {
    const r = section.getBoundingClientRect();
    const visible = r.top < window.innerHeight && r.bottom > 0;
    if (visible) start(); else stop();
  }
  window.addEventListener('scroll', checkVisible, { passive: true });
  start();          // arranca de inmediato
  checkVisible();   // y se autopausa si no se ve
})();

/* ---- FORMULARIO "ENVÍANOS TU PIEZA" ---- */
(function initTvForm() {
  const modal   = document.getElementById('tvFormModal');
  const openBtn = document.getElementById('tvCtaBtn');
  const closeBtn = document.getElementById('tvFormClose');
  const form    = document.getElementById('tvForm');
  const success = document.getElementById('tvFormSuccess');
  if (!modal || !openBtn) return;

  const open  = () => { modal.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });

  const formError = document.getElementById('tvFormError');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formError.classList.remove('show');
    fetch(form.action, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
      .then(res => {
        if (res.ok) { form.style.display = 'none'; success.classList.add('show'); }
        else throw new Error();
      })
      .catch(() => formError.classList.add('show'));
  });
})();
