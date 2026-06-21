/* ============================================
   ABERRANTE TV — lógica
   Contenido de muestra (reemplazar con piezas cinematográficas reales)
   ============================================ */

/* ---- INTRO DE ENTRADA (se reproduce al entrar a Aberrante TV) ---- */
(function initIntro() {
  const intro = document.getElementById('tvIntro');
  if (!intro) return;

  const video = document.getElementById('tvIntroVideo');
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

  // Cierre por TIEMPO fijo, sincronizado con el zoom final de las letras (~4 s).
  // No usamos 'ended' ni video.duration porque en algunos entornos no son fiables.
  timer = setTimeout(end, 4000);

  if (video) video.play().catch(() => {});
  intro.addEventListener('click', end); // permite saltar con click
})();

const PIEZAS = {
  // --- Aberrante Originals (solo en Aberrante TV) ---
  '1203128705': { titulo: 'Final Day', tipo: 'Cortometraje', autor: 'Studio Aberrante', label: 'Aberrante Originals', likes: 0, tags: ['Cinemático', 'Original'] },
  '1203129093': { titulo: 'Route 5',   tipo: 'Cortometraje', autor: 'Studio Aberrante', label: 'Aberrante Originals', likes: 0, tags: ['Cinemático', 'Original'] },
  '1203129625': { titulo: '847 Días',  tipo: 'Cortometraje', autor: 'Studio Aberrante', label: 'Aberrante Originals', likes: 0, tags: ['Cinemático', 'Original'] },
  '1203130346': { titulo: 'Better Days with Music', tipo: 'Cortometraje', autor: 'Studio Aberrante', label: 'Aberrante Originals', likes: 0, tags: ['Cinemático', 'Música'] }
};

const ORIGINALS = ['1203128705', '1203129093', '1203129625', '1203130346'];

// Hero: los Originals (se reproducen en silencio y rotan)
const DESTACADOS = ORIGINALS;

const FILAS = [
  { id: 'row-originals', titulo: 'Aberrante Originals', sub: 'Contenido original creado por nosotros', posters: true,  ids: ORIGINALS },
  { id: 'row-staff',     titulo: 'Staff Picks',          sub: 'Selección del equipo',                  posters: false, ids: ORIGINALS },
  { id: 'row-cat',       titulo: 'Lo más visto',         sub: '',                                       posters: false, ids: ORIGINALS }
];

const SLIDE_MS = 6000;

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

  // Construir segmentos de progreso (uno por Original)
  const segs = DESTACADOS.map((_, idx) => {
    const seg = document.createElement('span');
    seg.className = 'seg';
    seg.innerHTML = '<span class="seg-fill"></span>';
    seg.addEventListener('click', () => show(idx));
    progress.appendChild(seg);
    return seg.querySelector('.seg-fill');
  });

  function paintSegments() {
    segs.forEach((fill, k) => {
      fill.style.transition = 'none';
      if (k < i) fill.style.width = '100%';
      else if (k > i) fill.style.width = '0%';
      else {
        fill.style.width = '0%';
        void fill.offsetWidth; // reflow
        fill.style.transition = `width ${SLIDE_MS}ms linear`;
        fill.style.width = '100%';
      }
    });
  }

  function show(idx) {
    i = (idx + DESTACADOS.length) % DESTACADOS.length;
    const id = DESTACADOS[i];
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
  function restartTimer() { clearTimeout(timer); timer = setTimeout(() => show(i + 1), SLIDE_MS); }

  document.getElementById('tvHeroNext').addEventListener('click', () => show(i + 1));
  document.getElementById('tvHeroPrev').addEventListener('click', () => show(i - 1));

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
