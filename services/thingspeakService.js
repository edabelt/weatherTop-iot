// services/thingspeakService.js
// Pushes telemetry to ThingSpeak using the public REST update endpoint.
// Throttled to ~16s because ThingSpeak rate-limits updates on free tier.

const THINGSPEAK_CHANNEL_ID = process.env.THINGSPEAK_CHANNEL_ID;
const THINGSPEAK_WRITE_KEY = process.env.THINGSPEAK_WRITE_KEY;

const UPDATE_URL = "https://api.thingspeak.com/update.json";
const MIN_INTERVAL_MS = 16000;

let lastSentAt = 0;

function canSendNow() {
  const now = Date.now();
  if (now - lastSentAt < MIN_INTERVAL_MS) return false;
  lastSentAt = now;
  return true;
}

export async function pushTelemetryToThingSpeak(telemetry) {
  // If not configured, do nothing (keeps app working even without .env keys)
  if (!THINGSPEAK_CHANNEL_ID || !THINGSPEAK_WRITE_KEY) return;

  // Throttle updates to respect ThingSpeak limits
  if (!canSendNow()) return;

  const params = new URLSearchParams({
    api_key: THINGSPEAK_WRITE_KEY,
    // Map your payload fields -> ThingSpeak field1..field4
    field1: String(telemetry.temperature ?? ""),
    field2: String(telemetry.humidity ?? ""),
    field3: String(telemetry.pressure ?? ""),
    field4: String(telemetry.windSpeed ?? ""),
  });

  try {
    const res = await fetch(`${UPDATE_URL}?${params.toString()}`);
    const data = await res.json();
    console.log("[THINGSPEAK] pushed entry:", data);
  } catch (err) {
    console.log("[THINGSPEAK] error:", err.message);
  }
}

