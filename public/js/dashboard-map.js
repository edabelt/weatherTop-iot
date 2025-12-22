(function () {
  function init() {
    var el = document.getElementById("map");
    if (!el || !window.L) return;
    var data = [];
    try { data = JSON.parse(el.dataset.stations || "[]"); } catch {}
    var center = [20, 0];
    if (data.length) center = [data[0].lat, data[0].lng];
    var map = L.map("map").setView(center, data.length ? 6 : 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);
    var bounds = [];
    data.forEach(function (s) {
      if (!isFinite(s.lat) || !isFinite(s.lng)) return;
      var m = L.marker([s.lat, s.lng]).addTo(map);
      m.bindPopup(s.name || "Station");
      bounds.push([s.lat, s.lng]);
    });
    if (bounds.length > 1) map.fitBounds(bounds, { padding: [20, 20] });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
