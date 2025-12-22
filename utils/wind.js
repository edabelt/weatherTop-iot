export function degToCompass(deg) {
  if (!Number.isFinite(deg)) return "";
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  const ix = Math.round(deg / 22.5) % 16;
  return dirs[ix];
}

export function beaufort(ms) {
  const v = Number(ms);
  if (!Number.isFinite(v) || v < 0) return 0;
  const t = [0.3,1.6,3.4,5.5,8.0,10.8,13.9,17.2,20.8,24.5,28.5,32.7];
  let i = 0;
  while (i < t.length && v >= t[i]) i++;
  return i;
}

export function cToF(c) {
  const v = Number(c);
  if (!Number.isFinite(v)) return "";
  return Math.round((v * 9/5 + 32) * 10) / 10;
}

export function fmtWind(ms) {
  const v = Number(ms);
  if (!Number.isFinite(v)) return "";
  const n = Math.round(v * 10) / 10;
  return n % 1 === 0 ? String(n.toFixed(0)) : String(n.toFixed(1));
}

export function fmtPressure(p) {
  const v = Number(p);
  if (!Number.isFinite(v)) return "";
  return String(Math.round(v));
}
