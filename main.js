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

  function hideLoader() {
    if (hidden) return;
    hidden = true;
    clearInterval(interval);
    fill.style.width = '100%';
    setTimeout(() => loader.classList.add('hidden'), 300);
  }

  // Espera a que el video de Vimeo empiece a reproducirse
  window.addEventListener('load', () => {
    const iframe = document.querySelector('.hero-video-wrap iframe');
    if (iframe && typeof Vimeo !== 'undefined') {
      const player = new Vimeo.Player(iframe);
      const timeout = setTimeout(hideLoader, 8000); // máximo 8s de espera
      player.on('play', () => {
        clearTimeout(timeout);
        setTimeout(hideLoader, 200);
      });
    } else {
      setTimeout(hideLoader, 1000);
    }
  });
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
});

/* ---- PORTFOLIO THUMBNAILS ---- */
(function loadPortfolioThumbnails() {
  document.querySelectorAll('.portfolio-item[data-vimeo]').forEach(item => {
    const id  = item.dataset.vimeo;
    const img = item.querySelector('.portfolio-thumb-img');
    if (!id || !img) return;
    fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.thumbnail_url) {
          // Pedir versión más grande reemplazando dimensiones
          img.src = data.thumbnail_url.replace(/_\d+x\d+/, '_1280x720');
          img.style.display = 'block';
        }
      })
      .catch(() => {});
  });
})();

/* ---- PORTFOLIO MODAL ---- */
(function initPortfolioModal() {
  const modal   = document.getElementById('portfolioModal');
  const iframe  = document.getElementById('portfolioModalIframe');
  const btnClose = document.getElementById('portfolioModalClose');

  document.getElementById('portfolioGrid').addEventListener('click', (e) => {
    const item = e.target.closest('.portfolio-item');
    if (!item) return;
    const vimeoId = item.dataset.vimeo;
    if (!vimeoId) return;
    iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&badge=0&autopause=0`;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  function closeModal() {
    modal.classList.remove('open');
    iframe.src = '';
    document.body.style.overflow = '';
  }

  btnClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
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

  // Portfolio header
  gsap.fromTo('.portfolio-header .section-label', {
    opacity: 0
  }, {
    opacity: 1, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '.portfolio-header', start: 'top 82%' }
  });

  gsap.fromTo('.portfolio-title', {
    y: 30, opacity: 0
  }, {
    y: 0, opacity: 1, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.portfolio-header', start: 'top 82%' }
  });

  // Portfolio items
  gsap.utils.toArray('.portfolio-item').forEach((el, i) => {
    gsap.fromTo(el, {
      y: 40, opacity: 0
    }, {
      y: 0, opacity: 1, duration: 0.75, ease: 'power3.out',
      delay: (i % 2) * 0.1,
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
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

  gsap.utils.toArray('.nosotros-item').forEach((el, i) => {
    gsap.fromTo(el, {
      y: 40, opacity: 0
    }, {
      y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
      delay: i * 0.15,
      scrollTrigger: { trigger: '.nosotros-grid', start: 'top 82%' }
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
