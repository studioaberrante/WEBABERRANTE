/* ============================================
   ABERRANTE TV — lógica
   Contenido de muestra (reemplazar con piezas cinematográficas reales)
   ============================================ */

const PIEZAS = {
  '1169366177': { titulo: 'Alo Yoga x Josefa Sorel', tipo: 'Cortometraje', autor: 'Studio Aberrante' },
  '1199576480': { titulo: 'Nike',            tipo: 'Pieza cinematográfica', autor: 'Studio Aberrante' },
  '1202693340': { titulo: 'Spotify',         tipo: 'Cortometraje', autor: 'Studio Aberrante' },
  '1199573268': { titulo: 'The Candle Shop', tipo: 'Pieza cinematográfica', autor: 'Studio Aberrante' },
  '1199573953': { titulo: 'Salcobrand',      tipo: 'Cortometraje', autor: 'Studio Aberrante' },
  '1199572315': { titulo: 'Hypnos',          tipo: 'Pieza cinematográfica', autor: 'Studio Aberrante' }
};

// Piezas del hero (carrusel destacado)
const DESTACADOS = ['1169366177', '1199576480', '1199572315'];

// Filas tipo Netflix
const FILAS = [
  { id: 'row-originals',  titulo: 'Aberrante Originals', sub: 'Contenido original creado por nosotros', posters: true,  ids: ['1169366177', '1199576480', '1199572315', '1202693340', '1199573953'] },
  { id: 'row-cortos',     titulo: 'Cortometrajes',        sub: 'Narrativas con estética de cine',          posters: false, ids: ['1202693340', '1199572315', '1199573953', '1199573268', '1169366177'] },
  { id: 'row-destacados', titulo: 'Lo más visto',         sub: '',                                          posters: false, ids: ['1199576480', '1169366177', '1202693340', '1199573268', '1199572315', '1199573953'] }
];

/* ---- THUMBNAILS DE VIMEO ---- */
const rawCache = {};
function getRaw(id) {
  if (rawCache[id]) return Promise.resolve(rawCache[id]);
  return fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`)
    .then(r => r.json())
    .then(d => { rawCache[id] = d.thumbnail_url || ''; return rawCache[id]; })
    .catch(() => '');
}
// Devuelve una URL del tamaño pedido (con respaldo a la original si no existe)
function getThumb(id, size = '640x360') {
  return getRaw(id).then(raw => raw ? raw.replace(/_\d+x\d+/, '_' + size) : '');
}
// Carga una imagen probando un tamaño grande y, si falla, la original
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

/* ---- HERO (carrusel destacado) ---- */
(function initHero() {
  const bg      = document.getElementById('tvHeroBg');
  const eyebrow = document.getElementById('tvHeroEyebrow');
  const title   = document.getElementById('tvHeroTitle');
  const sub     = document.getElementById('tvHeroSub');
  const watch   = document.getElementById('tvHeroWatch');
  const dotsBox = document.getElementById('tvHeroDots');
  let i = 0, timer;

  DESTACADOS.forEach((_, idx) => {
    const b = document.createElement('button');
    b.addEventListener('click', () => show(idx, true));
    dotsBox.appendChild(b);
  });

  function show(idx, restart) {
    i = (idx + DESTACADOS.length) % DESTACADOS.length;
    const id = DESTACADOS[i];
    const p = PIEZAS[id];
    loadImageWithFallback(id, '1280x720', (url) => { bg.style.backgroundImage = `url(${url})`; });
    eyebrow.textContent = p.tipo === 'Cortometraje' ? 'Aberrante Originals' : 'Destacado';
    title.textContent = p.titulo;
    sub.textContent = `${p.tipo} · ${p.autor}`;
    watch.onclick = () => openModal(id);
    [...dotsBox.children].forEach((d, k) => d.classList.toggle('active', k === i));
    if (restart) restartTimer();
  }
  function restartTimer() { clearInterval(timer); timer = setInterval(() => show(i + 1), 7000); }

  document.getElementById('tvHeroNext').addEventListener('click', () => show(i + 1, true));
  document.getElementById('tvHeroPrev').addEventListener('click', () => show(i - 1, true));

  show(0);
  restartTimer();
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
      <div class="tv-row-nav">
        <span class="tv-row-viewall">Ver todo →</span>
        <div class="tv-row-arrows">
          <button data-dir="-1" aria-label="Anterior">‹</button>
          <button data-dir="1" aria-label="Siguiente">›</button>
        </div>
      </div>`;
    section.appendChild(head);

    const track = document.createElement('div');
    track.className = 'tv-track';

    fila.ids.forEach(id => {
      const p = PIEZAS[id];
      if (!p) return;
      const card = document.createElement('div');
      card.className = 'tv-card';
      card.dataset.vimeo = id;
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
      getThumb(id, fila.posters ? '540x720' : '640x360').then(url => {
        if (url) card.querySelector('img').src = url;
      });
      track.appendChild(card);
    });

    section.appendChild(track);
    root.appendChild(section);

    // Flechas de la fila
    head.querySelectorAll('.tv-row-arrows button').forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = track.clientWidth * 0.8 * Number(btn.dataset.dir);
        track.scrollBy({ left: amount, behavior: 'smooth' });
      });
    });
    head.querySelector('.tv-row-viewall').addEventListener('click', () => {
      track.scrollBy({ left: track.scrollWidth, behavior: 'smooth' });
    });
  });
})();

/* ---- CLICK EN TARJETA -> MODAL ---- */
document.getElementById('tvRows').addEventListener('click', (e) => {
  const card = e.target.closest('.tv-card');
  if (card) openModal(card.dataset.vimeo);
});

/* ---- MODAL ---- */
const modal   = document.getElementById('tvModal');
const mIframe  = document.getElementById('tvModalIframe');
const mTitle   = document.getElementById('tvModalTitle');
const mCat     = document.getElementById('tvModalCat');

function openModal(id) {
  const p = PIEZAS[id];
  if (!p) return;
  mIframe.src = `https://player.vimeo.com/video/${id}?autoplay=1&badge=0`;
  mTitle.textContent = p.titulo;
  mCat.textContent = `${p.tipo} · ${p.autor}`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.classList.remove('open');
  mIframe.src = '';
  document.body.style.overflow = '';
}
document.getElementById('tvModalClose').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* ---- NAV: marcar activo + scroll a la fila ---- */
document.querySelectorAll('.tv-nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    const rowId = link.dataset.row;
    document.querySelectorAll('.tv-nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    if (!rowId) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
});

/* ---- HEADER SÓLIDO AL SCROLLEAR ---- */
const header = document.getElementById('tvHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('solid', window.scrollY > 60);
}, { passive: true });
