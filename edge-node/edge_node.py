import time
import json
import random
from datetime import datetime
import paho.mqtt.client as mqtt

print("EDGE NODE STARTED")

# -------------------------------
# Configuration
# -------------------------------
BROKER_ADDRESS = "test.mosquitto.org"
BROKER_PORT = 1883

STATION_ID = "home-1"

TELEMETRY_TOPIC = f"weathertop/edge/{STATION_ID}/telemetry"
EVENT_TOPIC = f"weathertop/edge/{STATION_ID}/event"

PUBLISH_INTERVAL = 5  # seconds
TEMP_THRESHOLD = 30.0

# -------------------------------
# Sensor simulation
# -------------------------------
def simulate_sensors():
    """
    Simulates environmental sensor readings.
    """
    return {
        "temperature": round(random.uniform(20.0, 35.0), 1),
        "humidity": random.randint(40, 80),
        "pressure": random.randint(990, 1030),
        "windSpeed": round(random.uniform(0.0, 10.0), 1)
    }

# -------------------------------
# MQTT callbacks
# -------------------------------
def on_connect(client, userdata, flags, rc):
    print(f"[MQTT] Connected with result code {rc}")

# -------------------------------
# Main
# -------------------------------
def main():
    print("[EDGE NODE] Connecting to MQTT broker...")
    client = mqtt.Client()
    client.on_connect = on_connect

    client.connect(BROKER_ADDRESS, BROKER_PORT, 60)
    client.loop_start()

    while True:
        sensor_data = simulate_sensors()
        timestamp = datetime.utcnow().isoformat() + "Z"

        telemetry_payload = {
            "stationId": STATION_ID,
            "timestamp": timestamp,
            **sensor_data
        }

        client.publish(TELEMETRY_TOPIC, json.dumps(telemetry_payload))
        print(f"[TELEMETRY] {telemetry_payload}")

        if sensor_data["temperature"] >= TEMP_THRESHOLD:
            event_payload = {
                "stationId": STATION_ID,
                "timestamp": timestamp,
                "type": "TEMP_HIGH",
                "message": "Temperature exceeded threshold",
                "value": sensor_data["temperature"],
                "threshold": TEMP_THRESHOLD
            }

            client.publish(EVENT_TOPIC, json.dumps(event_payload))
            print(f"[EVENT] {event_payload}")

        time.sleep(PUBLISH_INTERVAL)

if __name__ == "__main__":
    main()
