import fs from "fs";
import path from "path";

const DATA_DIR = "data";
const TELEMETRY_FILE = path.join(DATA_DIR, "telemetry.csv");
const EVENTS_FILE = path.join(DATA_DIR, "events.csv");

function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(TELEMETRY_FILE)) fs.writeFileSync(TELEMETRY_FILE, "");
  if (!fs.existsSync(EVENTS_FILE)) fs.writeFileSync(EVENTS_FILE, "");
}

function safeLines(filePath) {
  ensureFiles();
  const raw = fs.readFileSync(filePath, "utf-8");
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function lastN(lines, n) {
  return lines.slice(Math.max(0, lines.length - n));
}

function parseTelemetryLine(line) {
  // Format:
  // stationId,timestamp,temperature,humidity,pressure,windSpeed
  const parts = line.split(",");
  if (parts.length < 6) return null;

  const [stationId, timestamp, temperature, humidity, pressure, windSpeed] = parts;

  return {
    stationId,
    timestamp,
    temperature,
    humidity,
    pressure,
    windSpeed,
  };
}

function parseEventLine(line) {
  // Format:
  // stationId,timestamp,type,"message",value,threshold
  // Message may contain commas and is quoted -> parse carefully.
  // We’ll do a simple CSV-safe parse for this known format.

  const firstComma = line.indexOf(",");
  if (firstComma === -1) return null;
  const stationId = line.slice(0, firstComma);
  const rest1 = line.slice(firstComma + 1);

  const secondComma = rest1.indexOf(",");
  if (secondComma === -1) return null;
  const timestamp = rest1.slice(0, secondComma);
  const rest2 = rest1.slice(secondComma + 1);

  const thirdComma = rest2.indexOf(",");
  if (thirdComma === -1) return null;
  const type = rest2.slice(0, thirdComma);
  let rest3 = rest2.slice(thirdComma + 1);

  // message is usually quoted: "Temperature exceeded threshold"
  let message = "";
  if (rest3.startsWith(`"`)) {
    const closingQuote = rest3.indexOf(`"`, 1);
    if (closingQuote === -1) return null;
    message = rest3.slice(1, closingQuote);

    // remove: "<message>", then comma
    rest3 = rest3.slice(closingQuote + 1);
    if (rest3.startsWith(",")) rest3 = rest3.slice(1);
  } else {
    // fallback: message until next comma
    const msgComma = rest3.indexOf(",");
    if (msgComma === -1) return null;
    message = rest3.slice(0, msgComma);
    rest3 = rest3.slice(msgComma + 1);
  }

  const parts = rest3.split(",");
  if (parts.length < 2) return null;

  const [value, threshold] = parts;

  return {
    stationId,
    timestamp,
    type,
    message,
    value,
    threshold,
  };
}

export function storeTelemetry(payload) {
  ensureFiles();

  const stationId = payload.stationId ?? "";
  const timestamp = payload.timestamp ?? "";
  const temperature = payload.temperature ?? "";
  const humidity = payload.humidity ?? "";
  const pressure = payload.pressure ?? "";
  const windSpeed = payload.windSpeed ?? "";

  const line = `${stationId},${timestamp},${temperature},${humidity},${pressure},${windSpeed}\n`;
  fs.appendFileSync(TELEMETRY_FILE, line, "utf-8");
}

export function storeEvent(payload) {
  ensureFiles();

  const stationId = payload.stationId ?? "";
  const timestamp = payload.timestamp ?? "";
  const type = payload.type ?? "";
  const message = (payload.message ?? "").replace(/"/g, '""'); // escape quotes
  const value = payload.value ?? "";
  const threshold = payload.threshold ?? "";

  const line = `${stationId},${timestamp},${type},"${message}",${value},${threshold}\n`;
  fs.appendFileSync(EVENTS_FILE, line, "utf-8");
}

export function getRecentTelemetry(n = 20) {
  const lines = safeLines(TELEMETRY_FILE);
  return lastN(lines, n)
    .map(parseTelemetryLine)
    .filter((x) => x != null);
}

export function getRecentEvents(n = 10) {
  const lines = safeLines(EVENTS_FILE);
  return lastN(lines, n)
    .map(parseEventLine)
    .filter((x) => x != null);
}

