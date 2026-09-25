/* Listado de categoría (categoria.html) y resultados de búsqueda (buscar.html): filtrado, orden, chips activos y
   paginación en el cliente. Lee ?q= (búsqueda) y ?serie= (categoría) de la URL. La búsqueda ignora acentos y
   mayúsculas ("bateria" encuentra "Batería"). Los rangos de capacidad y potencia coinciden con build_categoria.py. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const grid = $('[data-grid]'); if (!grid) return;
  const mode = grid.dataset.mode || 'cat';            // 'cat' (categoria.html) | 'search' (buscar.html)
  const tiles = $$('.ptile', grid);
  const aside = $('.filters');
  const sortMain = $('.fgroup--sort .fselect'), sortMirror = $('[data-sort-mirror]');
  const chips = $('[data-chips]'), count = $('[data-count]'), empty = $('[data-empty]'), pager = $('[data-pager]');
  const PER_PAGE = 12;
  const WH = { 'lt500': [0, 499], '500-1000': [500, 1000], '1000-2000': [1001, 2048], '2000-4000': [2049, 4096], 'gt4000': [4097, 1e9] };
  const W = { 'lt600': [0, 599], '600-1800': [600, 1800], '1800-3600': [1801, 3600], 'gt3600': [3601, 1e9] };
  const LABEL = { new: 'Producto nuevo' };
  const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  let page = 1;

  /* URL: ?q=texto (búsqueda) · ?serie=Serie RIVER (categoría) · ?nuevo=1 (novedades) */
  const params = new URLSearchParams(location.search);
  const rawQ = (params.get('q') || '').trim();
  const query = norm(rawQ);
  tiles.forEach((t) => { t.dataset.norm = norm(t.dataset.name); });
  const serie = params.get('serie');
  const onlyNew = params.get('nuevo') === '1';
  if (onlyNew) $('input[name="new"]', aside).checked = true;
  if (serie) { const cb = $(`input[name="serie"][value="${serie}"]`, aside); if (cb) cb.checked = true; }
  const title = $('[data-title]'), crumb = $('[data-crumb]');
  if (query || serie || onlyNew) title.removeAttribute('data-default');
  if (query) {
    title.textContent = `Resultados para “${rawQ}”`;
    crumb.textContent = 'Búsqueda';
    document.title = `“${rawQ}” · Búsqueda · PowerMe Distribuidores`;
    $$('.search input, .search-big input').forEach((i) => { i.value = rawQ; });
    $$('[data-empty-q]').forEach((e) => { e.textContent = rawQ; });
  } else if (serie) {
    title.textContent = serie; crumb.textContent = serie;
    document.title = `${serie} · EcoFlow · PowerMe Distribuidores`;
  } else if (onlyNew) {
    title.textContent = 'Nuevos lanzamientos'; crumb.textContent = 'Nuevos';
    document.title = 'Nuevos lanzamientos · EcoFlow · PowerMe Distribuidores';
  }

  const inRange = (v, r) => v !== '' && +v >= r[0] && +v <= r[1];
  const state = () => ({
    serie: $$('input[name="serie"]:checked', aside).map(i => i.value),
    wh: $$('input[name="wh"]:checked', aside).map(i => i.value),
    w: $$('input[name="w"]:checked', aside).map(i => i.value),
    isNew: $('input[name="new"]', aside).checked,
    sort: sortMain.value,
  });

  const matches = (t, s) => {
    if (query && !t.dataset.norm.includes(query)) return false;
    if (s.serie.length && !s.serie.includes(t.dataset.serie)) return false;
    if (s.wh.length && !s.wh.some(k => inRange(t.dataset.wh, WH[k]))) return false;
    if (s.w.length && !s.w.some(k => inRange(t.dataset.w, W[k]))) return false;
    if (s.isNew && t.dataset.new !== '1') return false;
    return true;
  };
  const sorters = {
    rel: () => 0,
    new: (a, b) => (+b.dataset.new) - (+a.dataset.new),
    wh: (a, b) => (+b.dataset.wh || -1) - (+a.dataset.wh || -1),
    w: (a, b) => (+b.dataset.w || -1) - (+a.dataset.w || -1),
    name: (a, b) => a.dataset.name.localeCompare(b.dataset.name, 'es'),
  };

  const chip = (label, onRemove) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'rchip';
    b.innerHTML = `<span>${label}</span><i aria-hidden="true">×</i>`; b.setAttribute('aria-label', `Quitar filtro ${label}`);
    b.addEventListener('click', onRemove); return b;
  };
  const labelOf = (name, value) => { const i = $(`input[name="${name}"][value="${value}"]`, aside); return i ? i.parentElement.querySelector('span:not(.fbox):not(.fknob)').textContent : value; };
  const emptySearchHref = mode === 'search' ? 'buscar.html' : 'categoria.html';

  const render = () => {
    const s = state();
    const visible = tiles.filter(t => matches(t, s)).sort(sorters[s.sort]);
    const pages = Math.max(1, Math.ceil(visible.length / PER_PAGE));
    page = Math.min(page, pages);
    tiles.forEach(t => { t.hidden = true; });
    visible.forEach((t, i) => { grid.appendChild(t); t.hidden = !(i >= (page - 1) * PER_PAGE && i < page * PER_PAGE); });
    count.textContent = visible.length;
    count.nextSibling.textContent = visible.length === 1 ? ' producto' : ' productos';
    empty.hidden = visible.length > 0;
    grid.hidden = visible.length === 0;

    chips.innerHTML = '';
    if (query) chips.appendChild(chip(`“${rawQ}”`, () => { location.href = emptySearchHref; }));
    s.serie.forEach(v => chips.appendChild(chip(v, () => { $(`input[name="serie"][value="${v}"]`, aside).checked = false; page = 1; render(); })));
    s.wh.forEach(v => chips.appendChild(chip(labelOf('wh', v), () => { $(`input[name="wh"][value="${v}"]`, aside).checked = false; page = 1; render(); })));
    s.w.forEach(v => chips.appendChild(chip(labelOf('w', v), () => { $(`input[name="w"][value="${v}"]`, aside).checked = false; page = 1; render(); })));
    if (s.isNew) chips.appendChild(chip(LABEL.new, () => { $('input[name="new"]', aside).checked = false; page = 1; render(); }));
    const any = chips.children.length > 0;
    $$('[data-clear]').forEach(b => { b.hidden = !any; });

    pager.innerHTML = '';
    if (pages > 1) {
      const mk = (txt, p, cur, dis) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; if (cur) b.setAttribute('aria-current', 'page'); b.disabled = !!dis; b.addEventListener('click', () => { page = p; render(); grid.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); return b; };
      pager.appendChild(mk('‹', page - 1, false, page === 1));
      for (let p = 1; p <= pages; p++) pager.appendChild(mk(String(p), p, p === page));
      pager.appendChild(mk('›', page + 1, false, page === pages));
    }
  };

  aside.addEventListener('change', (e) => {
    if (e.target === sortMain) sortMirror.value = sortMain.value;
    page = 1; render();
  });
  sortMirror.addEventListener('change', () => { sortMain.value = sortMirror.value; page = 1; render(); });
  /* Limpiar filtros: en el listado con búsqueda vuelve al catálogo; en buscar.html conserva la búsqueda y quita los filtros */
  $$('[data-clear]').forEach(b => b.addEventListener('click', () => {
    $$('input[type="checkbox"]:not([disabled])', aside).forEach(i => { i.checked = i.name === 'stock'; });
    sortMain.value = sortMirror.value = 'rel';
    if (query && mode !== 'search') { location.href = 'categoria.html'; return; }
    page = 1; render();
  }));

  /* El buscador del header lleva a la página de resultados */
  const form = $('.search'); const input = $('.search input');
  if (form && input) form.addEventListener('submit', (e) => { e.preventDefault(); const q = input.value.trim(); location.href = q ? `buscar.html?q=${encodeURIComponent(q)}` : 'buscar.html'; });

  render();
})();
