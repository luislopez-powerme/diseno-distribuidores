/* Nosotros: entrada del hero, contadores, parallax de fotos y trazo de la línea de tiempo. Sin librerías.
   Las apariciones al hacer scroll (.reveal / data-stagger) las resuelve main.js; aquí solo lo específico de la página. */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* 1. Hero: el título entra palabra por palabra y la foto se destapa */
  const hero = document.querySelector('.ab-hero');
  if (hero) {
    $$('.ab-hero h1').forEach((h) => {
      h.innerHTML = h.innerHTML.split(/<br\s*\/?>/).map((line) => '<span class="ab-line">' + line.trim().split(/\s+/).map((w) => `<span class="ab-word">${w}</span>`).join(' ') + '</span>').join('');
      $$('.ab-word', h).forEach((w, i) => w.style.setProperty('--w', i));
    });
    const go = () => hero.classList.add('is-ready');
    const soon = () => requestAnimationFrame(() => requestAnimationFrame(go));
    if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(soon, soon); else soon();
    setTimeout(go, 1200); /* por si las fuentes tardan o la pestaña está en segundo plano */
  }

  /* 2. Contadores: de data-from (o 0) a data-count cuando entran en pantalla; data-plain = sin separador de miles (años) */
  const fmt = new Intl.NumberFormat('es-MX');
  const counters = $$('[data-count]');
  const text = (el, n) => (el.dataset.prefix || '') + ('plain' in el.dataset ? String(n) : fmt.format(n)) + (el.dataset.suffix || '');
  const run = (el) => {
    const to = +el.dataset.count, from = +(el.dataset.from || 0);
    if (reduce) { el.textContent = text(el, to); return; }
    const dur = 1400, t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = text(el, Math.round(from + (to - from) * e));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    setTimeout(() => { el.textContent = text(el, to); }, dur + 200); /* valor final asegurado aunque rAF se pause */
  };
  if (counters.length) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } }), { threshold: .4 });
    counters.forEach((c) => { c.textContent = text(c, +(c.dataset.from || 0)); io.observe(c); });
  }

  /* 3. Parallax suave en las fotos marcadas (solo escritorio y sin reduced motion) */
  const par = $$('[data-parallax]');
  if (par.length && !reduce) {
    let ticking = false;
    const update = () => {
      ticking = false;
      if (innerWidth < 768) { par.forEach((el) => { el.style.transform = ''; }); return; }
      const vh = innerHeight;
      par.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const center = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-center * +el.dataset.parallax).toFixed(1)}px, 0) scale(1.12)`;
      });
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); update();
  }

  /* 4. Línea de tiempo: la línea se traza y los hitos aparecen en orden cuando la sección entra */
  const tl = document.querySelector('.ab-timeline');
  if (tl) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { tl.classList.add('is-drawn'); io.unobserve(tl); } }), { threshold: .25 });
    io.observe(tl);
  }
})();
