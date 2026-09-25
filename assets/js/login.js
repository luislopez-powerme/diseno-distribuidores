/* Inicio de sesión (mockup): mostrar/ocultar contraseña y validación mínima; sin backend todavía. */
(function () {
  /* Recuperar contraseña (recuperar.html) */
  const rec = document.querySelector('[data-recover]');
  if (rec) {
    const done = document.querySelector('[data-recover-done]'), mail = rec.querySelector('#rec-email'), err = rec.querySelector('[data-error]');
    rec.addEventListener('input', () => { mail.closest('.field').classList.remove('is-invalid'); err.hidden = true; });
    rec.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!mail.checkValidity()) { mail.closest('.field').classList.add('is-invalid'); err.hidden = false; mail.focus(); return; }
      done.querySelector('[data-rec-mail]').textContent = mail.value.trim();
      rec.hidden = true; done.hidden = false;
    });
    document.querySelector('[data-rec-again]').addEventListener('click', () => { done.hidden = true; rec.hidden = false; mail.focus(); });
  }

  const form = document.querySelector('[data-login]'); if (!form) return;
  const pw = form.querySelector('[data-pw]'), pwInput = form.querySelector('#login-pass'), err = form.querySelector('[data-error]');
  pw.addEventListener('click', () => { const t = pwInput.type === 'password'; pwInput.type = t ? 'text' : 'password'; pw.textContent = t ? 'Ocultar' : 'Mostrar'; });
  form.addEventListener('input', (e) => { const f = e.target.closest('.field'); if (f) f.classList.remove('is-invalid'); err.hidden = true; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let bad = false;
    form.querySelectorAll('input[required]').forEach((i) => { const ok = i.checkValidity(); i.closest('.field').classList.toggle('is-invalid', !ok); bad = bad || !ok; });
    err.hidden = !bad;
    if (!bad) { const b = form.querySelector('.login-submit'); b.disabled = true; b.textContent = 'Entrando…'; const next = new URLSearchParams(location.search).get('next'); setTimeout(() => { location.href = /^[a-z0-9-]+\.html$/.test(next || '') ? next : 'index.html'; }, 700); }
  });
})();
