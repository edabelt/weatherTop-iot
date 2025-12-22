# Messaging and Communication Protocols

## Overview
This project extends the WeatherTop web application with a simulated IoT edge device.
Its purpose is to demonstrate core computer networking concepts such as encapsulation,
transport protocols, lightweight messaging, and event-driven architecture.

The edge device is simulated using a Python process that replicates the behaviour
of a Raspberry Pi, allowing the project to focus on networking design rather than
physical hardware constraints.

## System Components
- Simulated Edge Node (Python)
- MQTT Broker
- WeatherTop Backend (Node.js)
- Cloud Services (ThingSpeak, Blynk)

## MQTT Topics
- weathertop/edge/<stationId>/telemetry
- weathertop/edge/<stationId>/event

## Message Schemas
The following JSON document contains example payloads for both message types used
in the system.

```json
{
  "telemetryExample": {
    "stationId": "home-1",
    "timestamp": "2025-12-19T11:30:00Z",
    "temperature": 26.8,
    "humidity": 65,
    "pressure": 1011,
    "windSpeed": 5.4
  },
  "eventExample": {
    "stationId": "home-1",
    "timestamp": "2025-12-19T11:31:10Z",
    "type": "TEMP_HIGH",
    "message": "Temperature exceeded threshold",
    "value": 30.2,
    "threshold": 30
  }
}
```

## Protocol Rationale

The system uses MQTT as the primary communication protocol between the simulated
edge node and backend services. MQTT is a lightweight publish/subscribe protocol
designed for low-bandwidth, high-latency, and unreliable networks, making it well
suited for IoT environments and event-driven architectures. Its decoupled messaging
model allows sensors, services, and applications to communicate without direct
dependencies.

Telemetry data is published continuously to support monitoring, trend analysis,
and comparison with external weather data sources. Event messages are generated
only when predefined conditions or thresholds are met, enabling efficient alerting
and notification mechanisms.

HTTP is used for REST-based communication with cloud platforms such as ThingSpeak,
where long-term historical data storage, analysis, and visualisation are required.
The combination of MQTT for real-time messaging and HTTP for cloud integration
reflects a common and effective IoT architectural pattern that spans multiple
network layers.
