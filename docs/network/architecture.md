# IoT Architecture (WeatherTop-IoT)

## High-level overview
This project extends WeatherTop with an IoT pipeline. A simulated edge node generates sensor telemetry and events.
Messages are transported using MQTT (publish/subscribe). The WeatherTop backend subscribes to topics, stores
messages to CSV for history, and renders a web dashboard for live + recent data.

## Components
- **Edge Node (Python)**: simulates sensors, applies local rules (threshold), publishes telemetry/events via MQTT.
- **MQTT Broker (Mosquitto)**: routes messages by topic; decouples producer (edge) from consumers (backend).
- **Backend (Node/Express)**: subscribes to MQTT topics, persists messages to CSV, serves web UI.
- **Storage (CSV)**: stores telemetry/events for history tables and summary analytics.
- **Web UI (Handlebars/Bulma)**: shows latest telemetry/event plus recent history and derived metrics.

## Data flow diagram (logical)
[Edge Node: Python]
| MQTT publish (telemetry + event)
v
[MQTT Broker: test.mosquitto.org]
| MQTT subscribe (weathertop/edge/+/telemetry, .../event)
v
[WeatherTop Backend: Node/Express]
|-> storeTelemetry() -> data/telemetry.csv
|-> storeEvent() -> data/events.csv
v
[IoT Dashboard: /iot-view]

latest values (in-memory state)

recent history (CSV read)

derived metrics (min/avg/max)


## Topics and message types
- `weathertop/edge/<stationId>/telemetry` (continuous readings)
- `weathertop/edge/<stationId>/event` (threshold-triggered discrete events)

This separation is a standard IoT event-driven design: telemetry supports monitoring/trends, and events support alerts.

