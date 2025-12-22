// controllers/station-controller.js
import { stationStore } from "../models/stationstore.js";
import { reportStore } from "../models/reportstore.js";
import { fetchCurrent } from "../utils/openweather.js";
import { degToCompass } from "../utils/wind.js";
import { weatherCodes, windDirs } from "../utils/weather-codes.js";
import { makeTempTrendSvg } from "../utils/svg-trend.js";

// IoT (MQTT + CSV)
import { getIotState } from "../services/mqttService.js";
import { getRecentTelemetry } from "../services/iotStore.js";

/* -----------------------------
   Helpers
-------------------------------- */

function buildLiveFromOWM(d) {
  if (!d) return null;
  const w = d.weather?.[0] || {};
  return {
    when: new Date((d.dt || Date.now()) * 1000).toLocaleString(),
    iconId: w.icon || "",
    description: w.description || "",
    code: w.id ?? "",
    temp: Number.isFinite(d.main?.temp) ? Number(d.main.temp.toFixed(1)) : null,
    tempMin: Number.isFinite(d.main?.temp_min)
      ? Number(d.main.temp_min.toFixed(1))
      : null,
    tempMax: Number.isFinite(d.main?.temp_max)
      ? Number(d.main.temp_max.toFixed(1))
      : null,
    windSpeed: Number.isFinite(d.wind?.speed)
      ? Number(d.wind.speed.toFixed(2))
      : null,
    windDirection: Number.isFinite(d.wind?.deg)
      ? degToCompass(d.wind.deg)
      : "",
    pressure: Number.isFinite(d.main?.pressure)
      ? Number(d.main.pressure)
      : null,
  };
}

function buildLiveFromIoT(t) {
  if (!t) return null;
  return {
    when: t.timestamp ? new Date(t.timestamp).toLocaleString() : "",
    temp: t.temperature != null ? Number(Number(t.temperature).toFixed(1)) : null,
    windSpeed:
      t.windSpeed != null ? Number(Number(t.windSpeed).toFixed(2)) : null,
    pressure:
      t.pressure != null ? Math.round(Number(t.pressure)) : null,
  };
}

// For demo purposes (can be upgraded later)
function resolveIotStationId(station) {
  return station?.iotStationId || "home-1";
}

/* -----------------------------
   Controller
-------------------------------- */

export const stationController = {
  async show(req, res) {
    const station = await stationStore.getStationById(req.params.id);
    if (!station) return res.redirect("/dashboard");

    const reports = await reportStore.listByStation(station._id);

    /* -----------------------------
       OpenWeather (cloud)
    -------------------------------- */
    let liveOWM = null;
    if (Number.isFinite(station.lat) && Number.isFinite(station.lng)) {
      try {
        const ow = await fetchCurrent(station.lat, station.lng);
        liveOWM = buildLiveFromOWM(ow);
      } catch {
        liveOWM = null;
      }
    }

    /* -----------------------------
       IoT (edge / MQTT)
    -------------------------------- */
    const iotState = getIotState();
    const IOT_STATION_ID = resolveIotStationId(station);

    const iotTelemetry =
      iotState.lastTelemetryByStation[IOT_STATION_ID] || null;
    const iotEvent =
      iotState.lastEventByStation[IOT_STATION_ID] || null;

    const liveIoT = buildLiveFromIoT(iotTelemetry);

    const isTempHigh =
      iotEvent &&
      iotEvent.type === "TEMP_HIGH" &&
      Number(iotEvent.value) >= Number(iotEvent.threshold);

    /* -----------------------------
       Recent IoT history (CSV)
    -------------------------------- */
    const recentTelemetry = getRecentTelemetry(50)
      .filter((x) => x.stationId === IOT_STATION_ID)
      .slice(-10)
      .reverse();

    /* -----------------------------
       Prefill report form
       (OWM preferred, IoT fallback)
    -------------------------------- */
    const prefill = liveOWM
      ? {
          temp: liveOWM.temp,
          windSpeed: liveOWM.windSpeed,
          pressure: liveOWM.pressure,
        }
      : liveIoT
      ? {
          temp: liveIoT.temp,
          windSpeed: liveIoT.windSpeed,
          pressure: liveIoT.pressure,
        }
      : { temp: "", windSpeed: "", pressure: "" };

    /* -----------------------------
       Trend chart (manual reports)
    -------------------------------- */
    const tempSvg = makeTempTrendSvg(reports, {
      width: 960,
      height: 260,
    });

    /* -----------------------------
       Render
    -------------------------------- */
    res.render("stations/detail", {
      title: station.name,
      user: res.locals.user,
      station,
      reports,
      tempSvg,

      // Existing UI expects "live" = OpenWeather
      live: liveOWM,

      // Form helpers
      weatherCodes,
      windDirs,
      prefill,
      selectedCode: liveOWM?.code || "",
      selectedDir: liveOWM?.windDirection || "",

      // ✅ IoT bundle for station-cards + detail page
      iot: {
        stationId: IOT_STATION_ID,
        telemetry: iotTelemetry,
        event: iotEvent,
        isHot: isTempHigh,
      },

      // Optional extras (tables / debugging)
      recentTelemetry,
    });
  },

  async addReport(req, res) {
    const station = await stationStore.getStationById(req.params.id);
    if (!station) return res.redirect("/dashboard");

    const report = {
      stationId: station._id,
      code: Number(req.body.code),
      temp: Number(req.body.temp),
      windSpeed: Number(req.body.windSpeed),
      windDirection: req.body.windDirection,
      pressure: Number(req.body.pressure),
      createdAt: new Date().toISOString(),
    };

    await reportStore.addReport(report);
    res.redirect(`/stations/${station._id}`);
  },

  async autoRead(req, res) {
    const station = await stationStore.getStationById(req.params.id);
    if (!station) return res.redirect("/dashboard");
    res.redirect(`/stations/${station._id}`);
  },
};

