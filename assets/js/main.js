/* distribuidores.powerme.mx — interacciones del mockup (sin dependencias) */
(() => {
  document.documentElement.classList.replace('no-js', 'js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mega menú: click/teclado (el hover lo resuelve CSS en escritorio) */
  const megas = $$('.has-mega');
  const closeMegas = (except) => megas.forEach((item) => {
    if (item === except) return;
    item.classList.remove('is-open');
    $('.nav-link', item).setAttribute('aria-expanded', 'false');
  });
  megas.forEach((item) => {
    const btn = $('.nav-link', item);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      closeMegas(item);
    });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.has-mega')) closeMegas(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMegas(); });

  /* Atajo "/" enfoca el buscador */
  const search = $('.search input');
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !/input|textarea/i.test(e.target.tagName)) { e.preventDefault(); search.focus(); }
  });

  /* Chips de filtro (solo visual en el mockup) */
  $$('.chips').forEach((group) => group.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $$('.chip', group).forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
  }));

  /* Banner del hero: cross-fade (500 ms como Syscom) + tinte de fondo por slide */
  const banner = $('.banner');
  if (banner) {
    const slides = $$('.slide', banner);
    const dots = $$('.dot', banner);
    const tints = $$('.hero-tint');
    const DUR = 6500;
    let i = 0, timer;
    const restart = () => { clearTimeout(timer); if (!reduceMotion) timer = setTimeout(() => go(i + 1), DUR); };
    const go = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => { d.classList.toggle('is-active', k === i); d.setAttribute('aria-selected', String(k === i)); });
      tints.forEach((t, k) => t.classList.toggle('is-active', k === i));
      restart();
    };
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
    $('.arrow--prev', banner).addEventListener('click', () => go(i - 1));
    $('.arrow--next', banner).addEventListener('click', () => go(i + 1));
    banner.addEventListener('mouseenter', () => clearTimeout(timer));
    banner.addEventListener('mouseleave', restart);
    banner.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
    });
    /* Swipe horizontal (touch / mouse) */
    let x0 = null;
    banner.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    banner.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
    });
    go(0);
  }

  /* Rieles horizontales (videos, productos): flechas que se ocultan en los extremos */
  $$('.rail').forEach((rail) => {
    const track = $('.rail-track', rail);
    const btns = $$('.rail-btn', rail);
    btns.forEach((b) => b.addEventListener('click', () => {
      track.scrollBy({ left: (b.dataset.dir === 'next' ? 1 : -1) * track.clientWidth * 0.8, behavior: 'smooth' });
    }));
    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      btns.forEach((b) => b.classList.toggle('is-hidden', b.dataset.dir === 'next' ? track.scrollLeft >= max : track.scrollLeft <= 2));
    };
    track.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  });

  /* Favoritos en las tarjetas de Más vendidos (solo estado visual en el mockup) */
  $$('.pcard-fav').forEach((b) => b.addEventListener('click', (e) => {
    e.preventDefault();
    const on = b.classList.toggle('is-fav');
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', on ? 'Quitar de favoritos' : 'Guardar en favoritos');
  }));

  /* Pop-up de video: los MP4 viven en assets/video/ (descargados de la cuenta de TikTok de PowerMe) y se reproducen con
     <video> nativo: arranque inmediato, sin marca ni franjas negras. Al pasar el mouse por la tarjeta se precarga el archivo. */
  const vm = $('#vmodal');
  if (vm) {
    const video = $('video', vm), wrap = $('.vmodal-frame', vm), title = $('#vmodal-title'), prod = $('.vmodal-product', vm);
    const srcOf = (id) => `assets/video/tt-${id}.mp4`;
    let last = null;
    const warmed = new Set();
    const warm = (id) => {
      if (warmed.has(id)) return; warmed.add(id);
      const l = document.createElement('link'); l.rel = 'prefetch'; l.as = 'video'; l.href = srcOf(id); document.head.appendChild(l);
    };
    video.addEventListener('playing', () => wrap.classList.add('is-ready'));
    video.addEventListener('waiting', () => wrap.classList.remove('is-ready'));
    const close = () => {
      vm.hidden = true; video.pause(); video.removeAttribute('src'); video.load();
      wrap.classList.remove('is-ready'); document.body.classList.remove('has-modal'); if (last) last.focus();
    };
    $$('.video-open').forEach((b) => {
      const card = b.closest('.video'), id = card.dataset.video;
      b.addEventListener('pointerenter', () => warm(id), { passive: true });
      b.addEventListener('click', () => {
        last = b;
        title.textContent = card.dataset.title || '';
        prod.href = card.dataset.product || '#';
        video.poster = $('img', b).getAttribute('src');
        wrap.classList.remove('is-ready');
        video.src = srcOf(id);
        vm.hidden = false; document.body.classList.add('has-modal');
        video.play().catch(() => { video.muted = true; video.play().catch(() => {}); });
        $('.vmodal-close', vm).focus();
      });
    });
    $$('[data-close]', vm).forEach((el) => el.addEventListener('click', close));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !vm.hidden) close(); });
  }

  /* Aparición al hacer scroll (con escalonado por grupo) */
  $$('[data-stagger]').forEach((g) => [...g.children].forEach((c, k) => c.style.setProperty('--i', k)));
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  $$('.reveal').forEach((el) => io.observe(el));
})();
