# WeatherTop

WeatherTop is a web-based weather station application that allows users to create and manage weather stations, view live weather data from OpenWeather, submit manual reports, and visualise trends through charts and maps.

This project has been extended with an **Internet of Things (IoT) pipeline** as part of the Computer Systems and Networks module.

---

## Base Application Features

* Add stations by **city name** or **latitude/longitude**
* View **live weather conditions** from OpenWeather
* Dashboard with weather summaries
* Station pages with saved reports
* Overview page with map and forecast
* Responsive UI built with Bulma

---

## Tech Stack (Base Application)

* Node.js
* Express
* Express-Handlebars
* Bulma CSS
* Leaflet (maps)
* Axios (HTTP requests)
* LowDB (JSON storage)
* OpenWeather APIs

---

# WeatherTop-IoT Extension

The WeatherTop-IoT extension adds an IoT data pipeline to the application. A simulated edge device generates environmental telemetry and events, which are transmitted using **MQTT**, processed by a **Node.js backend**, stored locally, and displayed in a web dashboard.

This extension demonstrates core concepts from **Computer Systems and Networks**, including network protocols, encapsulation, transport layers, and event-driven architecture.

---

## System Overview

The IoT system consists of the following components:

* **Edge Node (Python)**
  Simulates a Raspberry Pi with environmental sensors. Generates telemetry at regular intervals and produces event messages when a temperature threshold is exceeded.

* **MQTT Broker (Mosquitto)**
  Routes messages using a publish/subscribe model, decoupling producers and consumers.

* **WeatherTop Backend (Node.js / Express)**
  Subscribes to MQTT topics, maintains live IoT state, persists messages to CSV files, and serves the IoT dashboard.

* **Web UI (Handlebars / Bulma)**
  Displays live telemetry, recent events, historical data, and derived analytics.

---

## Technologies Used (IoT)

* Python 3
* Node.js (ES Modules)
* Express.js
* MQTT (Mosquitto broker)
* Handlebars (HBS)
* Bulma CSS
* CSV-based persistence

---

## How to Run the Project

### Step 1 – Install backend dependencies

From the project root directory:

```bash
npm install
```

---

### Step 2 – Start the WeatherTop backend

```bash
npm start
```

The application will start at:

```
http://localhost:4000
```

Log in using an existing account or create a new one.

---

### Step 3 – Start the IoT edge node (separate terminal)

Open a **new terminal window**, then run:

```bash
cd edge-node
pip3 install -r requirements.txt
python3 edge_node.py
```

The terminal will display telemetry and event messages being published via MQTT.

---

## Viewing IoT Data

Once both the backend and the edge node are running:

* Navigate to **IoT** from the application menu
  **or**
* Open directly in a browser:

```
http://localhost:4000/iot-view
```

---

## IoT Dashboard Features

The IoT dashboard provides:

* **Live Telemetry** – latest sensor readings received via MQTT
* **Event Notifications** – threshold-based alerts (e.g. high temperature)
* **Telemetry History** – last 20 telemetry samples
* **Event History** – last 10 recorded events
* **Derived Analytics** – minimum, maximum, and average temperature, plus average humidity, wind speed, and pressure

The dashboard automatically refreshes to simulate a live monitoring system.

---

## Data Persistence

IoT data is stored locally using CSV files:

* `data/telemetry.csv` – continuous telemetry readings
* `data/events.csv` – discrete event messages

These files are used to populate history tables and compute analytics.

---

## MQTT Topics

The following MQTT topic structure is used:

* `weathertop/edge/<stationId>/telemetry`
* `weathertop/edge/<stationId>/event`

Telemetry and event messages are separated to support an event-driven IoT design.

---

## Networking Concepts Demonstrated

* Application-layer protocols: MQTT and HTTP
* Transport layer: TCP
* Network layer: IP addressing and routing
* Link layer: ARP and switching
* Encapsulation across network layers
* Publish/subscribe communication model
* Event-driven architecture

Detailed explanations are provided in:

```
docs/network/architecture.md
docs/network/networking-notes.md
```

---

## Demo Instructions

1. Start the backend (`npm start`)
2. Start the edge node (`python3 edge_node.py`)
3. Open `/iot-view`
4. Observe live telemetry updates
5. Wait for temperature to exceed the threshold to trigger an event
6. Show historical tables and summary analytics

---

### Cloud Extension (Future Work)

In a future iteration, the WeatherTop-IoT system could forward
telemetry data to a cloud IoT platform such as ThingSpeak.
This would enable long-term storage, cloud-based analytics,
and public dashboards.

This functionality was not implemented in the current prototype
in order to focus on core networking concepts, MQTT messaging,
and local processing.

## Notes

The edge node simulates a Raspberry Pi in order to focus on networking concepts and system architecture rather than physical hardware constraints.

