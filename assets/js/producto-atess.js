/* Ficha ATESS: solo el selector de cantidad. El resto de la página es estática. */
(function () {
  const qty = document.querySelector('[data-qty]'); if (!qty) return;
  const clamp = () => { qty.value = Math.max(1, Math.min(99, parseInt(qty.value, 10) || 1)); };
  document.querySelector('[data-minus]').addEventListener('click', () => { qty.value = (parseInt(qty.value, 10) || 1) - 1; clamp(); });
  document.querySelector('[data-plus]').addEventListener('click', () => { qty.value = (parseInt(qty.value, 10) || 1) + 1; clamp(); });
  qty.addEventListener('change', clamp);
})();
