import { getIotState } from "../services/mqttService.js";
import { getRecentTelemetry, getRecentEvents } from "../services/iotStore.js";

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function avg(nums) {
  const valid = nums.filter((n) => n != null);
  if (valid.length === 0) return null;
  const sum = valid.reduce((a, b) => a + b, 0);
  return sum / valid.length;
}

function min(nums) {
  const valid = nums.filter((n) => n != null);
  if (valid.length === 0) return null;
  return Math.min(...valid);
}

function max(nums) {
  const valid = nums.filter((n) => n != null);
  if (valid.length === 0) return null;
  return Math.max(...valid);
}

export const iotController = {
  index(req, res) {
    const state = getIotState();

    const stationId = Object.keys(state.lastTelemetryByStation)[0] || null;
    const telemetry = stationId ? state.lastTelemetryByStation[stationId] : null;
    const event = stationId ? state.lastEventByStation[stationId] : null;

    // History from CSV (strings) – reverse so newest first for display
    const telemetryHistory = getRecentTelemetry(20).reverse();
    const eventHistory = getRecentEvents(10).reverse();

    // Compute derived metrics from telemetryHistory
    const temps = telemetryHistory.map((t) => toNum(t.temperature));
    const hums = telemetryHistory.map((t) => toNum(t.humidity));
    const winds = telemetryHistory.map((t) => toNum(t.windSpeed));
    const pressures = telemetryHistory.map((t) => toNum(t.pressure));

const stats = {
  countTelemetry: telemetryHistory.length,

  tempMin: min(temps),
  tempMax: max(temps),
  tempAvg: avg(temps)?.toFixed(1),

  humidityAvg: avg(hums)?.toFixed(1),
  windAvg: avg(winds)?.toFixed(1),
  pressureAvg: avg(pressures)?.toFixed(0),

  eventCount: eventHistory.length,
};
	
    res.render("iot", {
      title: "Internet of Things",
      telemetry,
      event,
      telemetryHistory,
      eventHistory,
      stats,
    });
  },
};

