document.addEventListener("DOMContentLoaded", function () {
  var el = document.getElementById("station-map");
  if (!el || !window.L) return;

  var lat = parseFloat(el.dataset.lat);
  var lng = parseFloat(el.dataset.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

  var map = L.map("station-map", { zoomControl: true }).setView([lat, lng], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  L.marker([lat, lng]).addTo(map);

  setTimeout(() => map.invalidateSize(), 0);
});
