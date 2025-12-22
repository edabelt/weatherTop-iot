# Networking Concepts in WeatherTop-IoT

This document explains the networking principles and protocols used in the
WeatherTop-IoT system, linking practical implementation to core concepts from
Computer Systems and Networks.

---

## Network Layers and Protocols

### Application Layer
- **MQTT** is used for communication between the edge node and the backend.
- **HTTP** is used for web access to the IoT dashboard and for cloud services
  such as ThingSpeak (optional extension).

Application data is encoded using **JSON**, which is human-readable and suitable
for lightweight messaging.

---

### Transport Layer
- MQTT runs over **TCP**, providing reliable, ordered delivery of messages.
- TCP ensures that telemetry and event messages are not lost in transit, which
  is important for monitoring and alerting systems.

---

### Network Layer (IP)
- All communication occurs over **IP networks**.
- The MQTT broker (`test.mosquitto.org`) is addressed via DNS and resolved to an IP
  address before TCP connections are established.
- Each component (edge node, broker, backend server) is identified by an IP
  address at the network layer.

---

### Link Layer
- On a local network, frames are delivered using Ethernet or Wi-Fi.
- **ARP (Address Resolution Protocol)** is used to resolve IP addresses to MAC
  addresses when devices communicate on the same LAN.
- Switches forward frames based on MAC addresses, allowing efficient local
  delivery.

---

## Encapsulation

The system demonstrates encapsulation across multiple layers:

1. Sensor data is structured as **JSON** (application layer).
2. JSON payloads are encapsulated inside **MQTT messages**.
3. MQTT messages are carried inside **TCP segments**.
4. TCP segments are encapsulated within **IP packets**.
5. IP packets are transmitted as **Ethernet or Wi-Fi frames** on the link layer.

Each layer adds its own headers without needing to understand the internal
structure of the payload from higher layers.

---

## Event-Driven Architecture

The IoT system follows an event-driven design:

- **Telemetry messages** are sent continuously at fixed intervals.
- **Event messages** are generated only when local conditions are met (e.g.
  temperature exceeds a threshold).

This separation reduces network traffic and allows the backend to react
immediately to important conditions without processing all telemetry as alerts.

---

## Packet Tracer Mapping (Conceptual)

Although the system runs on real networks, it can be mapped to a Packet Tracer
topology as follows:

- Edge Node → End Device (PC / IoT device)
- MQTT Broker → Server
- WeatherTop Backend → Server
- Network → Switch + Router

In Packet Tracer:
- Devices obtain IP addresses on the same subnet.
- ARP resolves MAC addresses for local delivery.
- Switches forward frames between devices.
- The router enables communication beyond the local network.

This mapping demonstrates how application-level IoT communication depends on
lower-level networking infrastructure.

---

## Summary

The WeatherTop-IoT system integrates multiple networking concepts:
- Application protocols (MQTT, HTTP)
- Reliable transport (TCP)
- IP addressing and routing
- Link-layer delivery using switches and ARP
- Encapsulation across layers
- Event-driven communication patterns

Together, these elements demonstrate a practical and well-structured IoT
networked system.

