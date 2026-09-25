/* Mapa de showrooms con Leaflet + OpenStreetMap. Las tarjetas .show llevan lat/lng/zoom en data-*;
   al tocar una tarjeta o su botón el mapa vuela al showroom y abre el pop-up, y el pop-up enlaza a Google Maps. */
(function () {
  const el = document.getElementById('map'); if (!el || typeof L === 'undefined') return;
  const cards = Array.from(document.querySelectorAll('.show'));
  const map = L.map(el, { scrollWheelZoom: false, zoomControl: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
  map.on('focus', () => map.scrollWheelZoom.enable());
  map.on('blur', () => map.scrollWheelZoom.disable());

  const pinSvg = '<svg viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg"><path d="M15 37C15 37 2 24.5 2 14.5A13 13 0 0 1 28 14.5C28 24.5 15 37 15 37Z" fill="#0C0C0C"/><circle cx="15" cy="14.5" r="5" fill="#fff"/></svg>';
  const icon = (soon) => L.divIcon({ className: 'pin' + (soon ? ' pin--soon' : ''), html: pinSvg, iconSize: [30, 38], iconAnchor: [15, 37], popupAnchor: [0, -34] });

  const markers = new Map();
  cards.forEach((c) => {
    const lat = +c.dataset.lat, lng = +c.dataset.lng;
    const addr = c.querySelector('.show-addr').innerHTML;
    const soon = c.hasAttribute('data-soon');
    const m = L.marker([lat, lng], { icon: icon(soon), title: c.dataset.name }).addTo(map);
    m.bindPopup(`<b>${c.dataset.name}${soon ? ' · Próximamente' : ''}</b>${addr}<a class="pop-link" href="${c.dataset.maps}" target="_blank" rel="noopener">Abrir en Google Maps →</a>`);
    m.on('click', () => activate(c, false));
    markers.set(c, m);
  });

  const activate = (card, fly) => {
    cards.forEach((x) => x.classList.toggle('is-active', x === card));
    const m = markers.get(card);
    if (fly) map.flyTo([+card.dataset.lat, +card.dataset.lng], +card.dataset.zoom || 15, { duration: .9 });
    setTimeout(() => m.openPopup(), fly ? 950 : 0);
  };
  cards.forEach((c) => {
    c.addEventListener('click', (e) => { if (e.target.closest('a')) return; activate(c, true); });
  });

  const bounds = L.latLngBounds(cards.map((c) => [+c.dataset.lat, +c.dataset.lng]));
  map.fitBounds(bounds, { padding: [48, 48] });
})();
