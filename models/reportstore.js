// models/reportstore.js
import { v4 as uuid } from "uuid";
import { initStore } from "../utils/store-utils.js";

const db = initStore("reports");

async function ensure() {
  await db.read();
  db.data ||= { reports: [] };
}

export const reportStore = {
  async addReport({ stationId, code, temp, windSpeed, windDirection, pressure, createdAt }) {
    await ensure();
    const rep = {
      _id: uuid(),
      stationId,
      code: Number(code),
      temp: Number(temp),
      windSpeed: Number(windSpeed),
      windDirection: windDirection || "N",
      pressure: Number(pressure),
      createdAt: createdAt || new Date().toISOString(),
    };
    db.data.reports.push(rep);
    await db.write();
    return rep;
  },

  async listByStation(stationId) {
    await ensure();
    return db.data.reports.filter((r) => r.stationId === stationId);
  },

  async latestForStation(stationId) {
    const list = await this.listByStation(stationId);
    return list.length ? list[list.length - 1] : null;
  },

  async deleteById(reportId) {
    await ensure();
    const idx = db.data.reports.findIndex((r) => r._id === reportId);
    if (idx >= 0) {
      db.data.reports.splice(idx, 1);
      await db.write();
    }
  },

  async cascadeDeleteForStation(stationId) {
    await ensure();
    db.data.reports = db.data.reports.filter((r) => r.stationId !== stationId);
    await db.write();
  },

  async getStationReports(stationId) {
    return this.listByStation(stationId);
  },
};
