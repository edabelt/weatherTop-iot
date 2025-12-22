// models/stationstore.js
import { v4 as uuid } from "uuid";
import { initStore } from "../utils/store-utils.js";

// LowDB collection name
const db = initStore("stations");

async function ensure() {
  await db.read();
  db.data ||= { stations: [] };
}

export const stationStore = {
  // --------------------------------------------------
  // Read operations
  // --------------------------------------------------

  async getAllStations() {
    await ensure();
    return db.data.stations;
  },

  async getUserStations(userId) {
    await ensure();
    return db.data.stations.filter((s) => s.userId === userId);
  },

  async getStationById(id) {
    await ensure();
    return db.data.stations.find((s) => s._id === id) || null;
  },

  // --------------------------------------------------
  // Create
  // --------------------------------------------------

  async addStation(station) {
    await ensure();

    const newStation = {
      _id: uuid(),
      name: station.name?.trim() || "Untitled Station",

      // Geographic data (used for OpenWeather)
      lat: station.lat ?? null,
      lng: station.lng ?? null,

      // Ownership
      userId: station.userId ?? null,

      // ✅ IoT integration
      // Must match MQTT stationId (e.g. "home-1")
      iotStationId: station.iotStationId?.trim() || "",
    };

    db.data.stations.push(newStation);
    await db.write();
    return newStation;
  },

  // --------------------------------------------------
  // Update
  // --------------------------------------------------

  async updateStation(id, patch = {}) {
    await ensure();

    const station = db.data.stations.find((s) => s._id === id);
    if (!station) return null;

    if (typeof patch.name === "string") {
      station.name = patch.name.trim() || station.name;
    }

    if (patch.lat != null) {
      station.lat = patch.lat;
    }

    if (patch.lng != null) {
      station.lng = patch.lng;
    }

    // ✅ IoT station mapping
    if (typeof patch.iotStationId === "string") {
      station.iotStationId = patch.iotStationId.trim();
    }

    await db.write();
    return station;
  },

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  async deleteStationById(id) {
    await ensure();

    const index = db.data.stations.findIndex((s) => s._id === id);
    if (index >= 0) {
      db.data.stations.splice(index, 1);
      await db.write();
    }
  },

  async deleteAllStations() {
    await ensure();
    db.data.stations = [];
    await db.write();
  },
};

