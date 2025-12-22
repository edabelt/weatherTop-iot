// controllers/station-dashboard-controller.js
import { stationStore } from "../models/stationstore.js";
import { reportStore } from "../models/reportstore.js";
import { accountsController } from "./accounts-controller.js";
import { fetchCurrent, fetchForecast5d } from "../utils/openweather.js";
import { computeStats } from "../utils/stats.js";
import { geocodeCity } from "../utils/geocode.js";
import { getIotState } from "../services/mqttService.js";

function buildLive(d) {
  if (!d) return null;
  const w = d.weather?.[0] || {};
  return {
    iconId: w.icon || "",
    description: w.description || "",
    temp: Number.isFinite(d.main?.temp) ? Number(d.main.temp.toFixed(1)) : null,
    windSpeed: Number.isFinite(d.wind?.speed) ? Number(d.wind.speed.toFixed(2)) : null,
    windDirection: Number.isFinite(d.wind?.deg) ? d.wind.deg : null,
    pressure: Number.isFinite(d.main?.pressure) ? Number(d.main.pressure) : null,
  };
}

function rangeFromForecast(list, live) {
  const now = Date.now();
  const end = now + 24 * 3600 * 1000;
  const items = (list || []).filter((x) => {
    const t = (x.dt || 0) * 1000;
    return t >= now && t <= end;
  });
  if (!items.length && !live) return null;

  const temps = items
    .map((x) => Number(x.main?.temp))
    .filter((n) => Number.isFinite(n));
  const winds = items
    .map((x) => Number(x.wind?.speed))
    .filter((n) => Number.isFinite(n));
  const presses = items
    .map((x) => Number(x.main?.pressure))
    .filter((n) => Number.isFinite(n));

  if (Number.isFinite(live?.temp)) temps.push(Number(live.temp));
  if (Number.isFinite(live?.windSpeed)) winds.push(Number(live.windSpeed));
  if (Number.isFinite(live?.pressure)) presses.push(Number(live.pressure));

  if (!temps.length && !winds.length && !presses.length) return null;

  const minTemp = temps.length ? Number(Math.min(...temps).toFixed(1)) : null;
  const maxTemp = temps.length ? Number(Math.max(...temps).toFixed(1)) : null;
  const minWind = winds.length ? Number(Math.min(...winds).toFixed(2)) : null;
  const maxWind = winds.length ? Number(Math.max(...winds).toFixed(2)) : null;
  const minPressure = presses.length ? Math.round(Math.min(...presses)) : null;
  const maxPressure = presses.length ? Math.round(Math.max(...presses)) : null;

  return { minTemp, maxTemp, minWind, maxWind, minPressure, maxPressure };
}

function toCompass(deg) {
  if (!Number.isFinite(deg)) return "";
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  const idx = Math.round(((deg % 360) / 22.5)) % 16;
  return dirs[idx];
}

function getIotForStation(iotState, station) {
  // We support two mapping strategies:
  // 1) station._id matches telemetry.stationId
  // 2) station.name matches telemetry.stationId (useful if you name stations like "home-1")
  const byId = station?._id ? iotState.lastTelemetryByStation[station._id] : null;
  const byName = station?.name ? iotState.lastTelemetryByStation[station.name] : null;

  const telemetry = byId || byName || null;

  const evById = station?._id ? iotState.lastEventByStation[station._id] : null;
  const evByName = station?.name ? iotState.lastEventByStation[station.name] : null;

  const event = evById || evByName || null;

  const isHot = event?.type === "TEMP_HIGH";

  return { telemetry, event, isHot };
}

export const stationDashboardController = {
  async index(req, res) {
    const user = res.locals.user || (await accountsController.getLoggedInUser(req));
    if (!user) return res.redirect("/login");

    const stations = await stationStore.getUserStations(user._id);

    // IoT live state (in-memory)
    const iotState = getIotState();

    const enriched = await Promise.all(
      stations.map(async (s) => {
        // Attach IoT info (telemetry/event) per station
        const iot = getIotForStation(iotState, s);

        // OpenWeather live (existing behaviour)
        let live = null;
        if (Number.isFinite(s.lat) && Number.isFinite(s.lng)) {
          try {
            const ow = await fetchCurrent(s.lat, s.lng);
            live = buildLive(ow);
            live.windDirection = toCompass(live.windDirection);
          } catch {
            live = null;
          }
        }

        // Reports stats (existing behaviour)
        const reports = await reportStore.listByStation(s._id);
        const stats = computeStats(reports);

        // 24h range from forecast (existing behaviour)
        try {
          if (Number.isFinite(s.lat) && Number.isFinite(s.lng)) {
            const fc = await fetchForecast5d(s.lat, s.lng);
            const rng = rangeFromForecast(fc?.list || [], live);
            if (rng) {
              stats.minTemp = rng.minTemp;
              stats.maxTemp = rng.maxTemp;
              stats.minWind = rng.minWind;
              stats.maxWind = rng.maxWind;
              stats.minPressure = rng.minPressure;
              stats.maxPressure = rng.maxPressure;
            }
          }
        } catch {
          // ignore forecast errors for robustness
        }

        return {
          _id: s._id,
          name: s.name,
          lat: s.lat,
          lng: s.lng,
          live,
          stats,
          iot, // ✅ NEW: dashboard can show live IoT status
        };
      })
    );

    enriched.sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base", numeric: true })
    );

    const stationsJson = JSON.stringify(
      enriched
        .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng))
        .map((s) => ({ id: s._id, name: s.name, lat: s.lat, lng: s.lng }))
    );

    res.render("dashboard-view", {
      title: "Your Stations",
      user,
      stations: enriched,
      stationsJson,
      error: req.query.error || null,
    });
  },

  async addStation(req, res) {
    const user = res.locals.user || (await accountsController.getLoggedInUser(req));
    if (!user) return res.redirect("/login");

    const rawName = req.body.name?.trim();
    let lat = req.body.lat ? Number(req.body.lat) : null;
    let lng = req.body.lng ? Number(req.body.lng) : null;
    if (!rawName) return res.redirect("/dashboard?error=Please+enter+a+city+name");

    let best = null;
    try {
      const results = await geocodeCity(rawName, "", 1);
      best = results[0] || null;
    } catch {
      return res.redirect("/dashboard?error=Could+not+contact+OpenWeather");
    }
    if (!best) return res.redirect("/dashboard?error=City+not+found");

    const name =
      [best.name, best.state].filter(Boolean).join(", ") +
      (best.country ? `, ${best.country}` : "");

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      lat = best.lat;
      lng = best.lng;
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.redirect("/dashboard?error=Missing+coordinates+for+that+city");
    }

    await stationStore.addStation({ name, lat, lng, userId: user._id });
    res.redirect("/dashboard");
  },

  async deleteStation(req, res) {
    const user = res.locals.user || (await accountsController.getLoggedInUser(req));
    if (!user) return res.redirect("/login");
    const id = req.params.id;

    if (typeof reportStore.removeByStation === "function") {
      await reportStore.removeByStation(id);
    } else if (typeof reportStore.deleteByStation === "function") {
      await reportStore.deleteByStation(id);
    }

    if (typeof stationStore.removeStation === "function") {
      await stationStore.removeStation(id);
    } else if (typeof stationStore.deleteStationById === "function") {
      await stationStore.deleteStationById(id);
    }

    res.redirect("/dashboard");
  },
};

