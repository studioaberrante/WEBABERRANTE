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

  function hideLoader() {
    if (hidden) return;
    hidden = true;
    clearInterval(interval);
    fill.style.width = '100%';
    setTimeout(() => loader.classList.add('hidden'), 300);
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
    document.body.classList.add('cursor-hidden'); // cursor normal sobre el video
  });

  function closeModal() {
    modal.classList.remove('open');
    iframe.src = '';
    document.body.style.overflow = '';
    document.body.classList.remove('cursor-hidden');
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

/* ---- SHOWCASE: revelado de tarjetas + cifras que se calculan ---- */
(function initShowcase() {
  const cards = document.querySelectorAll('.showcase-card');
  if (!cards.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function finalText(el) {
    return (el.dataset.prefix || '') + el.dataset.count + (el.dataset.suffix || '');
  }

  function animateNum(el) {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const dur = 1500;
    let t0 = null;
    function tick(t) {
      if (t0 === null) t0 = t;
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // frena al final, como cálculo que converge
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      entry.target.classList.add('in');
      entry.target.querySelectorAll('.stat-num[data-count]').forEach((n, i) => {
        if (reduceMotion) { n.textContent = finalText(n); return; }
        n.textContent = (n.dataset.prefix || '') + '0' + (n.dataset.suffix || '');
        setTimeout(() => animateNum(n), 300 + i * 200);
      });
    });
  }, { threshold: 0.35 });

  cards.forEach((c) => io.observe(c));
})();
