/* ============================================
   STUDIO ABERRANTE — main.js
   Scroll-Animated Canvas + GSAP
   ============================================ */

gsap.registerPlugin(ScrollTrigger);

/* ---- CONTENT LOADER ---- */
async function loadContent() {
  let data;
  try {
    const res = await fetch('content/site.json');
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

  // Brands marquee — two copies for seamless loop
  const track = document.getElementById('brandsTrack');
  if (track && data.brands?.length) {
    const buildSet = () => data.brands.map(b =>
      `<span class="brand-item">${b}</span><span class="brand-sep">·</span>`
    ).join('');
    track.innerHTML = buildSet() + buildSet();
  }

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

/* ---- CONFIG ---- */
const TOTAL_FRAMES = 295;
const FRAMES_DIR   = 'videobannerfoto/';

function framePath(n) {
  return FRAMES_DIR + 'ezgif-frame-' + String(n).padStart(3, '0') + '.jpg';
}

/* ---- CANVAS SETUP ---- */
const canvas = document.getElementById('heroCanvas');
const ctx    = canvas.getContext('2d');

let currentImg = null;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  if (currentImg) drawImage(currentImg);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* ---- DRAW (cover-fit) ---- */
function drawImage(img) {
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const cw = canvas.width;
  const ch = canvas.height;
  const ir = img.naturalWidth / img.naturalHeight;
  const cr = cw / ch;

  let sx, sy, sw, sh;

  if (cr > ir) {
    sw = img.naturalWidth;
    sh = sw / cr;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  } else {
    sh = img.naturalHeight;
    sw = sh * cr;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  }

  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
}

/* ---- FRAME CACHE ---- */
const frames = new Array(TOTAL_FRAMES).fill(null);
let loadedCount = 0;

function preloadFrame(index) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      frames[index] = img;
      loadedCount++;
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = framePath(index + 1); // frames are 1-indexed
  });
}

/* ---- BOOTSTRAP ---- */
// Load content first, then frames → so GSAP measures DOM after hydration
loadContent().then(() => {
  preloadFrame(0).then((img) => {
    if (img) {
      currentImg = img;
      drawImage(img);
    }
    initHeroScroll();
    initEntranceAnimations();
  });
});

// Preload rest in background (priority: first half first)
(async () => {
  // Batch 1: frames 1–90
  for (let i = 1; i < 91; i++) preloadFrame(i);
  await new Promise(r => setTimeout(r, 500));
  // Batch 2: frames 91–180
  for (let i = 91; i < TOTAL_FRAMES; i++) preloadFrame(i);
})();

/* ---- HERO SCROLL ANIMATION ---- */
function initHeroScroll() {
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: '+=220%',        // pin duration = 2.2x viewport height
    pin: true,
    scrub: 0.5,           // smooth scrub
    onUpdate: (self) => {
      const idx = Math.min(
        TOTAL_FRAMES - 1,
        Math.floor(self.progress * TOTAL_FRAMES)
      );
      const img = frames[idx];
      if (img) {
        currentImg = img;
        drawImage(img);
      }
    }
  });
}

/* ---- ENTRANCE ANIMATIONS ---- */
function initEntranceAnimations() {

  // Hero text
  gsap.fromTo('.hero-eyebrow', {
    y: 16,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: 'power3.out',
    delay: 0.3
  });

  gsap.fromTo('.hero-title', {
    y: 40,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 1.2,
    ease: 'power3.out',
    delay: 0.45
  });

  gsap.fromTo('.scroll-hint', {
    opacity: 0
  }, {
    opacity: 1,
    duration: 1,
    ease: 'power2.out',
    delay: 1.1
  });

  // Logo flotante
  gsap.fromTo('.hero-logo-float', {
    x: 20,
    opacity: 0
  }, {
    x: 0,
    opacity: 1,
    duration: 1.2,
    ease: 'power3.out',
    delay: 0.6
  });

  // Services items
  gsap.utils.toArray('.service-item').forEach((el, i) => {
    gsap.fromTo(el, {
      y: 50,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 0.75,
      ease: 'power3.out',
      delay: (i % 3) * 0.08,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
      }
    });
  });

  // Services header
  gsap.fromTo('.services-title', {
    y: 30,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.services-header',
      start: 'top 82%',
    }
  });

  gsap.fromTo('.section-label', {
    opacity: 0
  }, {
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.services-header',
      start: 'top 82%',
    }
  });

  // Manifesto
  gsap.fromTo('.manifesto-text', {
    y: 30,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.manifesto',
      start: 'top 78%',
    }
  });

  // Footer title
  gsap.fromTo('.footer-title', {
    y: 40,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.footer',
      start: 'top 80%',
    }
  });

  gsap.fromTo('.footer-cta', {
    y: 20,
    opacity: 0
  }, {
    y: 0,
    opacity: 1,
    duration: 0.9,
    ease: 'power3.out',
    delay: 0.2,
    scrollTrigger: {
      trigger: '.footer',
      start: 'top 80%',
    }
  });
}

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
