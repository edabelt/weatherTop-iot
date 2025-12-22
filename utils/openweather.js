import axios from "axios";

const API = "https://api.openweathermap.org/data/2.5";

function key() {
  const k = process.env.OWM_API_KEY;
  if (!k) throw new Error("OWM_API_KEY not set");
  return k;
}

export function iconUrl(id) {
  return id ? `https://openweathermap.org/img/wn/${id}@2x.png` : "";
}

export async function fetchCurrent(lat, lon) {
  const { data } = await axios.get(`${API}/weather`, {
    params: { lat, lon, units: "metric", appid: key() },
  });
  return data;
}

export async function fetchForecast5d(lat, lon) {
  const { data } = await axios.get(`${API}/forecast`, {
    params: { lat, lon, units: "metric", appid: key() },
  });
  return data;
}

export async function forecastDaily(lat, lon, days = 5) {
  const { data } = await axios.get(`${API}/forecast`, {
    params: { lat, lon, units: "metric", appid: key() },
  });

  const byDate = new Map();
  for (const x of data.list || []) {
    const d = (x.dt_txt || "").slice(0, 10);
    if (!d) continue;
    const arr = byDate.get(d) || [];
    arr.push(x);
    byDate.set(d, arr);
  }

  const today = new Date().toISOString().slice(0, 10);
  const dates = [...byDate.keys()].filter((d) => d > today).sort();

  const out = [];
  for (const d of dates) {
    const items = byDate.get(d) || [];
    const pick =
      items.find((it) => (it.dt_txt || "").includes("12:00:00")) ||
      items[Math.floor(items.length / 2)] ||
      null;

    const temps = items
      .map((it) => Number(it.main?.temp))
      .filter((t) => Number.isFinite(t));

    const min = temps.length ? Math.round(Math.min(...temps)) : null;
    const max = temps.length ? Math.round(Math.max(...temps)) : null;

    out.push({
      key: d,
      min,
      max,
      iconId: pick?.weather?.[0]?.icon || "",
      description: pick?.weather?.[0]?.description || "",
    });

    if (out.length >= days) break;
  }

  return out;
}

export async function forecastHourly(lat, lon, count = 12) {
  const { data } = await axios.get(`${API}/forecast`, {
    params: { lat, lon, units: "metric", appid: key() },
  });
  const list = (data.list || []).slice(0, count);
  return list.map((x) => ({
    iso: x.dt_txt,
    temp: Number(x.main?.temp),
    iconId: x.weather?.[0]?.icon || "",
    description: x.weather?.[0]?.description || "",
  }));
}
