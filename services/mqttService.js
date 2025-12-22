import mqtt from "mqtt";
import { storeTelemetry, storeEvent } from "./iotStore.js";
import { pushTelemetryToThingSpeak } from "./thingspeakService.js";

const BROKER_URL = "mqtt://test.mosquitto.org:1883";

const TELEMETRY_TOPIC = "weathertop/edge/+/telemetry";
const EVENT_TOPIC = "weathertop/edge/+/event";

const iotState = {
  lastTelemetryByStation: {},
  lastEventByStation: {},
};

let client;

export function startMqtt() {
  console.log("[MQTT] Connecting to broker:", BROKER_URL);

  client = mqtt.connect(BROKER_URL, {
    reconnectPeriod: 2000, // auto reconnect every 2s
  });

  client.on("connect", () => {
    console.log("[MQTT] Connected");

    client.subscribe([TELEMETRY_TOPIC, EVENT_TOPIC], (err) => {
      if (err) {
        console.log("[MQTT] Subscribe error:", err.message);
      } else {
        console.log("[MQTT] Subscribed to telemetry + event topics");
      }
    });
  });

  client.on("message", (topic, messageBuffer) => {
    try {
      const payload = JSON.parse(messageBuffer.toString());
      const stationId = payload.stationId || topic.split("/")[2];

      if (topic.includes("/telemetry")) {
        iotState.lastTelemetryByStation[stationId] = payload;

        // Persist telemetry
        storeTelemetry(payload);

        // Push to ThingSpeak (cloud) - throttled inside the service
        pushTelemetryToThingSpeak(payload);

        console.log("[MQTT][TELEMETRY]", stationId, payload);
      }

      if (topic.includes("/event")) {
        iotState.lastEventByStation[stationId] = payload;

        // Persist event
        storeEvent(payload);

        console.log("[MQTT][EVENT]", stationId, payload);
      }
    } catch (err) {
      console.log("[MQTT] Invalid JSON message");
    }
  });

  client.on("reconnect", () => {
    console.log("[MQTT] Reconnecting...");
  });

  client.on("error", (err) => {
    console.log("[MQTT] Error:", err.message);
  });
}

export function getIotState() {
  return iotState;
}

