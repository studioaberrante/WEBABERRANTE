/* ============================================
   ABERRANTE TV — lógica
   Contenido de muestra (reemplazar con piezas cinematográficas reales)
   ============================================ */

const PIEZAS = {
  '1169366177': { titulo: 'Alo Yoga x Josefa Sorel', tipo: 'Cortometraje',        autor: 'Studio Aberrante', label: 'Aberrante Originals', likes: 24, tags: ['Cinemático', 'Wellness', 'Moda'] },
  '1199576480': { titulo: 'Nike',            tipo: 'Pieza cinematográfica', autor: 'Studio Aberrante', label: 'Staff Picks',         likes: 41, tags: ['Deporte', 'Cinemático', 'Épico'] },
  '1202693340': { titulo: 'Spotify',         tipo: 'Cortometraje',        autor: 'Studio Aberrante', label: 'Aberrante Originals', likes: 18, tags: ['Música', 'Lifestyle'] },
  '1199573268': { titulo: 'The Candle Shop', tipo: 'Pieza cinematográfica', autor: 'Studio Aberrante', label: 'Staff Picks',         likes: 12, tags: ['Atmósfera', 'Producto'] },
  '1199573953': { titulo: 'Salcobrand',      tipo: 'Cortometraje',        autor: 'Studio Aberrante', label: 'Aberrante Originals', likes: 9,  tags: ['Narrativa', 'Marca'] },
  '1199572315': { titulo: 'Hypnos',          tipo: 'Pieza cinematográfica', autor: 'Studio Aberrante', label: 'Staff Picks',         likes: 33, tags: ['Onírico', 'Cinemático'] }
};

const DESTACADOS = ['1169366177', '1199576480', '1199572315'];

const FILAS = [
  { id: 'row-originals', titulo: 'Aberrante Originals', sub: 'Contenido original creado por nosotros', posters: true,  ids: ['1169366177', '1199576480', '1199572315', '1202693340', '1199573953'] },
  { id: 'row-staff',     titulo: 'Staff Picks',          sub: 'Selección del equipo',                  posters: false, ids: ['1199576480', '1199573268', '1199572315', '1169366177', '1199573953'] },
  { id: 'row-cat',       titulo: 'Lo más visto',         sub: '',                                       posters: false, ids: ['1199576480', '1169366177', '1202693340', '1199573268', '1199572315', '1199573953'] }
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
    eyebrow.textContent = p.label;
    title.textContent = p.titulo;
    sub.textContent = `${p.tipo} · ${p.autor}`;
    watch.onclick = () => openDetail(id);
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
    fila.ids.forEach(id => { if (PIEZAS[id]) track.appendChild(makeCard(id, fila.posters)); });
    section.appendChild(track);
    root.appendChild(section);

    head.querySelectorAll('.tv-row-arrows button').forEach(btn => {
      btn.addEventListener('click', () => {
        track.scrollBy({ left: track.clientWidth * 0.8 * Number(btn.dataset.dir), behavior: 'smooth' });
      });
    });
    head.querySelector('.tv-row-viewall').addEventListener('click', () => {
      track.scrollBy({ left: track.scrollWidth, behavior: 'smooth' });
    });
  });
})();

/* ---- VISTA DE DETALLE ---- */
const detail      = document.getElementById('tvDetail');
const dIframe     = document.getElementById('tvDetailIframe');
const dScroll     = document.getElementById('tvDetailScroll');
const dTitle      = document.getElementById('tvDetailTitle');
const dType       = document.getElementById('tvDetailType');
const dAuthor     = document.getElementById('tvDetailAuthor');
const dLabel      = document.getElementById('tvDetailLabel');
const dLike       = document.getElementById('tvDetailLike');
const dLikeCount  = document.getElementById('tvDetailLikeCount');
const dTags       = document.getElementById('tvDetailTags');
const dRelated    = document.getElementById('tvRelated');
const likedSet    = new Set();
let currentId = null;

function openDetail(id) {
  const p = PIEZAS[id];
  if (!p) return;
  currentId = id;
  dIframe.src = `https://player.vimeo.com/video/${id}?autoplay=1&badge=0`;
  dTitle.textContent = p.titulo;
  dType.textContent = p.tipo;
  dAuthor.textContent = p.autor;
  dLabel.textContent = p.label;
  const liked = likedSet.has(id);
  dLike.classList.toggle('liked', liked);
  dLikeCount.textContent = p.likes + (liked ? 1 : 0);
  dTags.innerHTML = p.tags.map(t => `<span>${t}</span>`).join('');

  // Relacionados: otras piezas
  dRelated.innerHTML = '';
  Object.keys(PIEZAS).filter(k => k !== id).forEach(rid => dRelated.appendChild(makeCard(rid, false)));

  detail.classList.add('open');
  document.body.style.overflow = 'hidden';
  dScroll.scrollTop = 0;
}

function closeDetail() {
  detail.classList.remove('open');
  dIframe.src = '';
  document.body.style.overflow = '';
}

document.getElementById('tvDetailBack').addEventListener('click', closeDetail);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && detail.classList.contains('open')) closeDetail(); });

// Like (local, demostrativo)
dLike.addEventListener('click', () => {
  if (!currentId) return;
  const liked = likedSet.has(currentId);
  if (liked) likedSet.delete(currentId); else likedSet.add(currentId);
  dLike.classList.toggle('liked', !liked);
  dLikeCount.textContent = PIEZAS[currentId].likes + (likedSet.has(currentId) ? 1 : 0);
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
  const data = { title: `${p.titulo} — Aberrante TV`, text: `Mira "${p.titulo}" en Aberrante TV`, url: location.href };
  if (navigator.share) {
    try { await navigator.share(data); } catch (e) {}
  } else {
    try { await navigator.clipboard.writeText(location.href); showToast('Enlace copiado'); }
    catch (e) { showToast('Copia el enlace desde la barra'); }
  }
});

// Click en tarjeta (filas o relacionados) -> detalle
document.getElementById('tvRows').addEventListener('click', (e) => {
  const card = e.target.closest('.tv-card');
  if (card) openDetail(card.dataset.vimeo);
});
dRelated.addEventListener('click', (e) => {
  const card = e.target.closest('.tv-card');
  if (card) openDetail(card.dataset.vimeo);
});

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
