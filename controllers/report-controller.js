import { reportStore } from "../models/reportstore.js";

export const reportController = {
  async create(req, res) {
    const stationId = req.params.id;
    const { code, temp, windSpeed, windDirection, pressure } = req.body;
    await reportStore.addReport({
      stationId,
      code: Number(code),
      temp: Number(temp),
      windSpeed: Number(windSpeed),
      windDirection,
      pressure: Number(pressure),
    });
    res.redirect(`/stations/${stationId}`);
  },
};
