/* ============================================
   ABERRANTE TV — lógica
   ============================================ */

/* ---- CATÁLOGO (de momento: tus 6 piezas actuales) ---- */
const PIEZAS = {
  '1169366177': { titulo: 'Alo Yoga x Josefa Sorel', categoria: 'Campaña Publicitaria' },
  '1199576480': { titulo: 'Nike',            categoria: 'Campaña Publicitaria' },
  '1202693340': { titulo: 'Spotify',         categoria: 'Campaña Publicitaria' },
  '1199573268': { titulo: 'The Candle Shop', categoria: 'Campaña Publicitaria' },
  '1199573953': { titulo: 'Salcobrand',      categoria: 'Campaña Publicitaria' },
  '1199572315': { titulo: 'Hypnos',          categoria: 'Campaña Publicitaria' }
};

// Pieza destacada del hero (video de fondo)
const DESTACADO = '1169366177';

// Filas tipo Netflix (puedes reordenar / crear categorías reales)
const FILAS = [
  { titulo: 'Lo más nuevo',          ids: ['1202693340', '1199572315', '1199573953', '1199573268'] },
  { titulo: 'Campañas Publicitarias', ids: ['1169366177', '1199576480', '1202693340', '1199573268', '1199573953', '1199572315'] },
  { titulo: 'Marcas Globales',        ids: ['1199576480', '1169366177', '1202693340'] }
];

/* ---- THUMBNAILS DE VIMEO (caché simple) ---- */
const thumbCache = {};
function getThumb(id) {
  if (thumbCache[id]) return Promise.resolve(thumbCache[id]);
  return fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`)
    .then(r => r.json())
    .then(d => {
      const url = (d.thumbnail_url || '').replace(/_\d+x\d+/, '_960x540');
      thumbCache[id] = url;
      return url;
    })
    .catch(() => '');
}

/* ---- HERO DESTACADO ---- */
(function initHero() {
  const data = PIEZAS[DESTACADO];
  if (!data) return;
  document.getElementById('tvHeroTitle').textContent = data.titulo;
  document.getElementById('tvHeroDesc').textContent =
    'Una de nuestras piezas insignia, producida íntegramente con inteligencia artificial.';
  const video = document.getElementById('tvHeroVideo');
  video.src = `https://player.vimeo.com/video/${DESTACADO}?background=1&autoplay=1&loop=1&muted=1&badge=0`;
  document.getElementById('tvHeroPlay').addEventListener('click', () => openModal(DESTACADO));
})();

/* ---- RENDER DE FILAS ---- */
(function renderRows() {
  const root = document.getElementById('tvRows');
  FILAS.forEach(fila => {
    const section = document.createElement('section');
    section.className = 'tv-row';

    const h2 = document.createElement('h2');
    h2.className = 'tv-row-title';
    h2.textContent = fila.titulo;
    section.appendChild(h2);

    const track = document.createElement('div');
    track.className = 'tv-track';

    fila.ids.forEach(id => {
      const p = PIEZAS[id];
      if (!p) return;
      const card = document.createElement('div');
      card.className = 'tv-card';
      card.dataset.vimeo = id;
      card.innerHTML = `
        <img alt="${p.titulo}" loading="lazy">
        <div class="tv-card-overlay"></div>
        <div class="tv-card-play">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div class="tv-card-info">
          <p class="tv-card-name">${p.titulo}</p>
          <p class="tv-card-cat">${p.categoria}</p>
        </div>`;
      getThumb(id).then(url => { if (url) card.querySelector('img').src = url; });
      track.appendChild(card);
    });

    enableDragScroll(track);
    section.appendChild(track);
    root.appendChild(section);
  });
})();

/* ---- CLICK EN TARJETA -> MODAL ---- */
document.getElementById('tvRows').addEventListener('click', (e) => {
  const card = e.target.closest('.tv-card');
  if (card && !card.dataset.dragged) openModal(card.dataset.vimeo);
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
  mCat.textContent = p.categoria;
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

/* ---- ARRASTRE LATERAL DE LAS FILAS (mouse) ---- */
function enableDragScroll(track) {
  let down = false, startX = 0, startLeft = 0, moved = false;
  track.addEventListener('pointerdown', (e) => {
    down = true; moved = false;
    startX = e.clientX; startLeft = track.scrollLeft;
  });
  track.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    track.scrollLeft = startLeft - dx;
  });
  const up = (e) => {
    down = false;
    // marcar la tarjeta como arrastrada para que el click no abra el modal
    const card = e.target.closest && e.target.closest('.tv-card');
    if (card && moved) { card.dataset.dragged = '1'; setTimeout(() => delete card.dataset.dragged, 0); }
  };
  track.addEventListener('pointerup', up);
  track.addEventListener('pointerleave', () => { down = false; });
}

/* ---- HEADER SÓLIDO AL SCROLLEAR ---- */
const header = document.getElementById('tvHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('solid', window.scrollY > 60);
}, { passive: true });

/* ---- CURSOR PERSONALIZADO (igual que el sitio) ---- */
(function initCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.appendChild(dot);
  document.body.classList.add('has-custom-cursor');
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, scale = 1, target = 1;
  const HOT = 'a, button, .tv-card';
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseover', e => { if (e.target.closest(HOT)) target = 2.5; });
  document.addEventListener('mouseout',  e => { if (e.target.closest(HOT)) target = 1; });
  (function loop() {
    cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2; scale += (target - scale) * 0.2;
    dot.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%) scale(${scale})`;
    requestAnimationFrame(loop);
  })();
})();
