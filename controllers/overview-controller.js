import { stationStore } from "../models/stationstore.js";
import { fetchCurrent, forecastDaily, forecastHourly } from "../utils/openweather.js";
import { degToCompass, beaufort } from "../utils/wind.js";
import { makeTempTrendSvg } from "../utils/svg-trend.js";

function iconUrl(id) {
  if (!id) return "";
  return `https://openweathermap.org/img/wn/${id}@2x.png`;
}

export const overviewController = {
  async overview(req, res) {
    const user = res.locals.user;
    if (!user) return res.redirect("/login");

    const station = await stationStore.getStationById(req.params.id);
    if (!station) return res.redirect("/dashboard");

    if (!Number.isFinite(station.lat) || !Number.isFinite(station.lng)) {
      return res.render("stations/overview", {
        title: `Station – ${station.name}`,
        user,
        station,
        current: null,
        hourlySvg: "",
        outlook: [],
        iconUrl,
        map: { lat: 0, lng: 0 },
      });
    }

    let current = null;
    let outlook = [];
    let hourly = [];
    try {
      const cur = await fetchCurrent(station.lat, station.lng);
      current = cur
        ? {
            when: new Date((cur.dt || Date.now()) * 1000).toLocaleString(),
            temp: Math.round(cur.main?.temp),
            feels: Math.round(cur.main?.feels_like),
            desc: cur.weather?.[0]?.description || "",
            iconId: cur.weather?.[0]?.icon || "",
            windMs: Number(cur.wind?.speed ?? 0).toFixed(1),
            windDir: Number.isFinite(cur.wind?.deg) ? degToCompass(cur.wind.deg) : "",
            windBft: beaufort(cur.wind?.speed ?? 0),
            pressure: cur.main?.pressure ?? null,
          }
        : null;

      outlook = await forecastDaily(station.lat, station.lng, 5);
      hourly = await forecastHourly(station.lat, station.lng, 12);
    } catch {
      current = null;
      outlook = [];
      hourly = [];
    }

    const hourlyLikeReports = hourly.map((h, i) => ({
      temp: h.temp,
      createdAt: h.iso || new Date(Date.now() + i * 3 * 3600 * 1000).toISOString(),
    }));
    const hourlySvg = makeTempTrendSvg(hourlyLikeReports, { width: 960, height: 260 });

    res.render("stations/overview", {
      title: `Station – ${station.name}`,
      user,
      station,
      current,
      hourlySvg,
      outlook,
      map: { lat: station.lat, lng: station.lng },
      iconUrl,
    });
  },
};
