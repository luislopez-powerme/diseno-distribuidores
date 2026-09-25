/* Ficha de producto: galería, cantidad/subtotal y copiar SKU. Sin librerías. */
(function () {
  'use strict';

  /* ---- Galería ---- */
  var main = document.querySelector('.gallery-main img');
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.thumb'));
  var count = document.querySelector('.gallery-count');
  var current = 0;

  function show(i) {
    if (!thumbs.length) return;
    current = (i + thumbs.length) % thumbs.length;
    var t = thumbs[current];
    var img = t.querySelector('img');
    var full = t.getAttribute('data-full') || img.src;
    main.classList.add('is-switching');
    setTimeout(function () {
      main.src = full;
      main.alt = img.alt;
      main.classList.toggle('is-photo', t.classList.contains('is-photo'));
      main.classList.remove('is-switching');
    }, 120);
    thumbs.forEach(function (b, k) { b.setAttribute('aria-current', k === current ? 'true' : 'false'); });
    if (count) count.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(thumbs.length).padStart(2, '0');
  }
  thumbs.forEach(function (b, k) { b.addEventListener('click', function () { show(k); }); });
  var prev = document.querySelector('.gallery-arrow--prev');
  var next = document.querySelector('.gallery-arrow--next');
  if (prev) prev.addEventListener('click', function () { show(current - 1); });
  if (next) next.addEventListener('click', function () { show(current + 1); });
  document.addEventListener('keydown', function (e) {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  /* ---- Cantidad y subtotal (precios sin IVA; el IVA se calcula al finalizar la compra) ---- */
  var buy = document.querySelector('.buy');
  if (buy) {
    var unit = parseFloat(buy.getAttribute('data-unit-price')) || 0;
    var input = buy.querySelector('.qty input');
    var out = buy.querySelector('[data-subtotal]');
    var fmt = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    function render() {
      var q = Math.max(1, Math.min(999, parseInt(input.value, 10) || 1));
      input.value = q;
      if (out) out.innerHTML = '<span class="currency">$</span>' + fmt.format(unit * q);
    }
    Array.prototype.forEach.call(buy.querySelectorAll('.qty button'), function (b) {
      b.addEventListener('click', function () {
        input.value = (parseInt(input.value, 10) || 1) + (b.hasAttribute('data-minus') ? -1 : 1);
        render();
      });
    });
    input.addEventListener('change', render);
    render();
  }

  /* ---- Copiar SKU ---- */
  var sku = document.querySelector('.sku-copy');
  if (sku) {
    sku.addEventListener('click', function () {
      var text = sku.getAttribute('data-sku') || sku.textContent.trim();
      var done = function () { sku.classList.add('is-done'); setTimeout(function () { sku.classList.remove('is-done'); }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
      else done();
    });
  }
})();
