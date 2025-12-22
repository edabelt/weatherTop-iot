document.addEventListener("DOMContentLoaded", function () {
  var el = document.getElementById("overview-map");
  if (!el || !window.L) return;
  var lat = parseFloat(el.dataset.lat);
  var lng = parseFloat(el.dataset.lng);
  if (!isFinite(lat) || !isFinite(lng)) return;
  var name = el.dataset.name || "Station";
  var map = L.map("overview-map").setView([lat, lng], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  L.marker([lat, lng]).addTo(map).bindPopup(name);
});
