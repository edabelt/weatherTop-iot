import express from "express";
import { accountsController } from "./controllers/accounts-controller.js";
import { aboutController } from "./controllers/about-controller.js";
import { stationDashboardController } from "./controllers/station-dashboard-controller.js";
import { stationController } from "./controllers/station-controller.js";
import { overviewController } from "./controllers/overview-controller.js";
import { reportController } from "./controllers/report-controller.js";
import { getIotState } from "./services/mqttService.js";
import { iotController } from "./controllers/iot-controller.js";

export const router = express.Router();

// --------------------------------------------------
// Authentication middleware
// --------------------------------------------------
async function requireAuth(req, res, next) {
  const user = await accountsController.getLoggedInUser(req);
  if (!user) return res.redirect("/login");
  res.locals.user = user;
  next();
}

// --------------------------------------------------
// Public routes
// --------------------------------------------------
router.get("/", (req, res) => res.redirect("/dashboard"));

router.get("/login", accountsController.login);
router.post("/authenticate", accountsController.authenticate);
router.get("/signup", accountsController.signup);
router.post("/register", accountsController.register);
router.get("/logout", accountsController.logout);

router.get("/about", aboutController.index);

// --------------------------------------------------
// User settings
// --------------------------------------------------
router.get("/settings", requireAuth, accountsController.settings);
router.post("/settings", requireAuth, accountsController.updateSettings);

// --------------------------------------------------
// Dashboard & stations
// --------------------------------------------------
router.get("/dashboard", requireAuth, stationDashboardController.index);
router.post(
  "/dashboard/addstation",
  requireAuth,
  stationDashboardController.addStation
);
router.post(
  "/dashboard/stations/:id/delete",
  requireAuth,
  stationDashboardController.deleteStation
);

// --------------------------------------------------
// Station detail & reports
// --------------------------------------------------
router.get("/stations/:id", requireAuth, stationController.show);
router.post(
  "/stations/:id/reports",
  requireAuth,
  reportController.create
);
router.post(
  "/stations/:id/owm",
  requireAuth,
  stationController.autoRead
);

router.get(
  "/stations/:id/overview",
  requireAuth,
  overviewController.overview
);

// --------------------------------------------------
// IoT endpoints
// --------------------------------------------------

// Raw JSON ( slicing the MQTT state for debugging / API )
router.get("/iot", requireAuth, (req, res) => {
  res.json(getIotState());
});

// Frontend IoT dashboard ( Handlebars )
router.get("/iot-view", requireAuth, iotController.index);

