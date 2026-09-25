/* Carrito de muestra: cantidades y totales en el cliente, tres pasos en el hash (#carrito / #pago / #listo),
   pestañas de método de pago, formato de tarjeta y validación HTML5 del checkout con resaltado. Sin backend todavía. */
(function () {
  const root = document.querySelector('[data-cart]'); if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => Array.from(r.querySelectorAll(s));
  const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
  const steps = $$('.rstep'), tabs = $$('[data-step-tab]');
  const HASH = { 1: '#carrito', 2: '#pago', 3: '#listo' };
  const headCount = document.querySelector('.btn-cart .count');

  const show = (n, push = true) => {
    steps.forEach((s) => { s.hidden = +s.dataset.step !== n; });
    tabs.forEach((t) => { const k = +t.dataset.stepTab; t.classList.toggle('is-active', k === n); t.classList.toggle('is-done', k < n); });
    if (push) history.replaceState(null, '', HASH[n]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Totales y resumen (con miniaturas en el paso de pago) */
  const items = () => $$('.cart-item');
  const set = (sel, v) => $$(sel).forEach((e) => { e.textContent = fmt.format(v); });
  const recalc = () => {
    let sub = 0, qty = 0; const mini = $('[data-mini]'); if (mini) mini.innerHTML = '';
    items().forEach((it) => {
      const price = +it.dataset.price, q = +it.querySelector('input').value || 1, line = q * price; sub += line; qty += q;
      it.querySelector('[data-line]').textContent = fmt.format(line);
      if (mini) {
        const li = document.createElement('li');
        li.innerHTML = `<img src="${it.dataset.img}" alt="" loading="lazy"><span><span class="cs-name">${it.dataset.name}</span><small>${q} × ${fmt.format(price)} + IVA</small></span><b>${fmt.format(line)}</b>`;
        mini.appendChild(li);
      }
    });
    const iva = sub * 0.16;
    set('[data-sub]', sub); set('[data-iva]', iva); set('[data-total]', sub + iva); set('[data-pay-total]', sub + iva);
    $$('[data-count-items]').forEach((e) => { e.textContent = qty ? String(qty) : ''; });
    if (headCount) headCount.textContent = qty;
    const empty = items().length === 0;
    $('[data-empty]').hidden = !empty; $('[data-summary]').hidden = empty;
  };

  root.addEventListener('click', (e) => {
    const it = e.target.closest('.cart-item'); if (!it) return;
    const inp = it.querySelector('input');
    if (e.target.closest('[data-plus]')) inp.value = Math.min(99, +inp.value + 1);
    else if (e.target.closest('[data-minus]')) inp.value = Math.max(1, +inp.value - 1);
    else if (e.target.closest('[data-remove]')) it.remove();
    else return;
    recalc();
  });
  root.addEventListener('change', (e) => {
    if (e.target.matches('.ci-qty input')) { e.target.value = Math.min(99, Math.max(1, +e.target.value || 1)); recalc(); }
  });

  $('[data-next]').addEventListener('click', () => { if (items().length) show(2); });
  $('[data-back]').addEventListener('click', () => show(1));

  /* Paso 2: pestañas de método, wallets, formato de tarjeta, limpiar dirección */
  const form = $('[data-checkout]');
  const syncPay = () => { const v = $('input[name="pago"]:checked').value; $$('[data-pay-panel]').forEach((p) => { p.hidden = p.dataset.payPanel !== v; }); };
  $$('input[name="pago"]').forEach((r) => r.addEventListener('change', syncPay)); syncPay();
  const WALLET = { apple: 'Al pagar se abrirá Apple Pay para confirmar con tu dispositivo.', google: 'Al pagar se abrirá Google Pay para confirmar con tu cuenta.' };
  const syncWallet = () => { const w = $('input[name="wallet"]:checked').value; const card = w === 'card'; $('[data-card-fields]').hidden = !card; const n = $('[data-wallet-note]'); n.hidden = card; n.textContent = WALLET[w] || ''; };
  $$('input[name="wallet"]').forEach((r) => r.addEventListener('change', syncWallet)); syncWallet();
  const card = $('[data-card]'), exp = $('[data-exp]');
  card.addEventListener('input', () => { const d = card.value.replace(/\D/g, '').slice(0, 16); card.value = d.replace(/(.{4})(?=.)/g, '$1 '); });
  exp.addEventListener('input', () => { const d = exp.value.replace(/\D/g, '').slice(0, 4); exp.value = d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d; });
  $('[data-clear-addr]').addEventListener('click', () => {
    $$('input, select', $('[data-addr]')).forEach((el) => { if (el.name === 'env_pais') return; el.value = ''; el.closest('.field').classList.remove('is-invalid'); });
    $('[data-addr] input').focus();
  });

  /* Validación */
  const clearInvalid = (e) => { const f = e.target.closest('.field'); if (f) f.classList.remove('is-invalid'); $('[data-error]').hidden = true; };
  form.addEventListener('input', clearInvalid); form.addEventListener('change', clearInvalid);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    $$('.is-invalid', form).forEach((f) => f.classList.remove('is-invalid'));
    let first = null;
    $$('input, select', form).forEach((el) => {
      if (el.closest('[hidden]') || el.disabled) return;
      if (!el.checkValidity()) { const f = el.closest('.field'); if (f) f.classList.add('is-invalid'); first = first || f || el; }
    });
    if (first) { $('[data-error]').hidden = false; first.scrollIntoView({ behavior: 'smooth', block: 'center' }); const i = first.querySelector ? first.querySelector('input, select') : null; if (i) i.focus({ preventScroll: true }); return; }
    const d = new Date(), p = (n) => String(n).padStart(2, '0');
    $('[data-order]').textContent = `#PM-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${Math.floor(Math.random() * 9000) + 1000}`;
    $('[data-mail]').textContent = $('#pc-email').value.trim() || 'tu correo';
    $('[data-pago]').textContent = $('input[name="pago"]:checked').dataset.label;
    show(3);
  });

  if (location.hash === '#pago' || location.hash === '#envio') show(2, false); else show(1, false);
  recalc();
})();
