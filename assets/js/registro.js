/* Registro en pasos: 1 términos (checkbox habilita Continuar) → 2 formulario (validación HTML5 con resaltado)
   → 3 confirmación. El paso vive en el hash (#terminos / #datos / #listo) para poder volver atrás. */
(function () {
  const root = document.querySelector('[data-registro]'); if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => Array.from(r.querySelectorAll(s));
  const steps = $$('.rstep'), tabs = $$('[data-step-tab]');
  const accept = $('[data-accept]'), next = $('[data-next]'), form = $('[data-form]');
  const HASH = { 1: '#terminos', 2: '#datos', 3: '#listo' };

  const show = (n, push = true) => {
    steps.forEach((s) => { s.hidden = +s.dataset.step !== n; });
    tabs.forEach((t) => { const k = +t.dataset.stepTab; t.classList.toggle('is-active', k === n); t.classList.toggle('is-done', k < n); });
    if (push) history.replaceState(null, '', HASH[n]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Paso 1 */
  accept.addEventListener('change', () => { next.disabled = !accept.checked; });
  next.addEventListener('click', () => { if (accept.checked) show(2); });
  $('[data-back]').addEventListener('click', () => show(1));

  /* Paso 2: mostrar contraseña, "Otro" en uso de factura, validación */
  const pw = $('[data-pw]'), pwInput = $('#reg_password');
  pw.addEventListener('click', () => { const t = pwInput.type === 'password'; pwInput.type = t ? 'text' : 'password'; pw.textContent = t ? 'Ocultar' : 'Mostrar'; });
  const uso = $('[data-uso]'), otro = $('[data-uso-otro]'), otroInput = $('#custom_invoice_use');
  uso.addEventListener('change', () => { const isOtro = uso.value.startsWith('Otro'); otro.hidden = !isOtro; otroInput.required = isOtro; if (!isOtro) otroInput.value = ''; });

  const clearInvalid = (e) => { const f = e.target.closest('.field, .choice, .accept-check'); if (f) f.classList.remove('is-invalid'); $('[data-error]').hidden = true; };
  form.addEventListener('input', clearInvalid); form.addEventListener('change', clearInvalid);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    $$('.field, .choice').forEach((f) => f.classList.remove('is-invalid'));
    let first = null;
    $$('input, select', form).forEach((el) => {
      if (el.closest('[hidden]') || el.disabled) return;
      if (!el.checkValidity()) { const f = el.closest('.field, .choice') || el.closest('.accept-check'); if (f) f.classList.add('is-invalid'); first = first || f || el; }
    });
    if (first) { $('[data-error]').hidden = false; first.scrollIntoView({ behavior: 'smooth', block: 'center' }); const i = first.querySelector ? first.querySelector('input, select') : null; if (i) i.focus({ preventScroll: true }); return; }
    $$('.is-invalid').forEach((f) => f.classList.remove('is-invalid'));
    const name = $('#b2bking_field_413').value.trim();
    $('[data-done-name]').textContent = name ? `${name}, tu solicitud` : 'tu solicitud';
    $('[data-done-email]').textContent = $('#reg_email').value.trim();
    show(3);
  });

  /* Estado inicial desde el hash (#datos solo si ya aceptó en esta sesión) */
  if (location.hash === '#datos' && sessionStorage.getItem('pm-acepto') === '1') { accept.checked = true; next.disabled = false; show(2, false); }
  else show(1, false);
  accept.addEventListener('change', () => { try { sessionStorage.setItem('pm-acepto', accept.checked ? '1' : '0'); } catch (e) {} });
})();
