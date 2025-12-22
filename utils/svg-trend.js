function esc(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function labelFromIso(iso, i) {
  if (!iso) return `Report #${i + 1}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return `Report #${i + 1}`;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}
function niceCeil(x) {
  if (!Number.isFinite(x) || x <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(x)));
  const f = x / p;
  const m = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return m * p;
}
function ticks0toMax(max, n = 5) {
  const hi = niceCeil(max);
  if (n <= 2) return [0, hi];
  const step = hi / (n - 1);
  const t = [];
  for (let i = 0; i < n; i++) t.push(Math.round((i * step + Number.EPSILON) * 10) / 10);
  return t;
}
export function makeTempTrendSvg(reports = [], opts = {}) {
  const drawW = Number.isFinite(opts.width) ? opts.width : 960;
  const drawH = Number.isFinite(opts.height) ? opts.height : 320;
  const padL = 44, padR = 16, padT = 20, padB = 48;

  const rows = reports
    .map((r, i) => {
      const t = Date.parse(r.createdAt);
      const ts = Number.isFinite(t) ? t : i;
      const v = Number(r.temp);
      return Number.isFinite(v) ? { ts, v, label: labelFromIso(r.createdAt, i) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));

  const n = rows.length;
  if (n === 0) {
    return `<svg viewBox="0 0 ${drawW} ${drawH}" width="100%" style="height:auto;aspect-ratio:${drawW}/${drawH};display:block" role="img" aria-label="No temperature data"><rect x="0" y="0" width="${drawW}" height="${drawH}" fill="#ffffff" rx="8"/><text x="${drawW/2}" y="${drawH/2}" text-anchor="middle" fill="#7a7a7a" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="14">No temperature data yet</text></svg>`;
  }

  const temps = rows.map(r => r.v);
  const max = Math.max(...temps);
  const lo = 0, hi = niceCeil(max);

  const innerW = drawW - padL - padR;
  const innerH = drawH - padT - padB;

  const xFor = (i) => (n === 1 ? padL + innerW / 2 : padL + (innerW * i) / (n - 1));
  const yFor = (v) => padT + innerH * (1 - (v - lo) / (hi - lo));

  const yTicks = ticks0toMax(hi, 5);
  const yGrid = yTicks.map(yv => {
    const y = yFor(yv).toFixed(1);
    return `<line x1="${padL}" y1="${y}" x2="${drawW - padR}" y2="${y}" stroke="#eeeeee" stroke-width="1"/><text x="${padL - 10}" y="${Number(y) + 4}" text-anchor="end" fill="#4a4a4a" font-size="12" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif">${Math.round(yv)}°C</text>`;
  }).join("");

  const xGrid = rows.map((r, i) => {
    const x = xFor(i).toFixed(1);
    return `<line x1="${x}" y1="${padT}" x2="${x}" y2="${drawH - padB}" stroke="#f2f2f2" stroke-width="1"/>`;
  }).join("");

  const xLabels = rows.map((r, i) => {
    const x = xFor(i).toFixed(1);
    return `<text x="${x}" y="${drawH - 10}" text-anchor="middle" fill="#4a4a4a" font-size="10" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" transform="rotate(-25 ${x},${drawH - 10})">${esc(r.label)}</text>`;
  }).join("");

  const pts = rows.map((r, i) => `${xFor(i).toFixed(1)},${yFor(r.v).toFixed(1)}`).join(" ");
  const dots = rows.map((r, i) => `<circle cx="${xFor(i).toFixed(1)}" cy="${yFor(r.v).toFixed(1)}" r="3" fill="#48c78e"/>`).join("");
  const valueLabels = (n <= 20)
    ? rows.map((r, i) => `<text x="${xFor(i).toFixed(1)}" y="${(yFor(r.v) - 6).toFixed(1)}" text-anchor="middle" fill="#2f855a" font-size="11" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif">${r.v.toFixed(1)}°C</text>`).join("")
    : "";

  return `<svg viewBox="0 0 ${drawW} ${drawH}" width="100%" style="height:auto;aspect-ratio:${drawW}/${drawH};display:block" role="img" aria-label="Temperature trend"><rect x="0" y="0" width="${drawW}" height="${drawH}" fill="#ffffff" rx="8"/><rect x="${padL}" y="${padT}" width="${innerW}" height="${innerH}" fill="#ffffff" stroke="#eaeaea" rx="6"/>${yGrid}${xGrid}<polyline points="${pts}" fill="none" stroke="#48c78e" stroke-width="2"/>${dots}${valueLabels}${xLabels}</svg>`;
}
