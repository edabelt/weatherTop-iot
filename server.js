import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { engine } from "express-handlebars";
import { router } from "./routes.js";
import { beaufort } from "./utils/wind.js";
import { startMqtt } from "./services/mqttService.js";

const hbsHelpers = {
  // Existing helpers
  f: (c) => (c == null || c === "" ? "" : (((Number(c) * 9) / 5) + 32).toFixed(1)),
  bft: (ms) => beaufort(ms),
  fmtWind: (v) => (v == null || v === "" ? "—" : Number(v).toFixed(2)),
  fmtPressure: (v) => (v == null || v === "" ? "—" : Math.round(Number(v)).toString()),
  sel: (a, b) => (String(a) === String(b) ? "selected" : ""),
  json: (x) => JSON.stringify(x ?? null),

  // ✅ NEW: needed for navbar active state
  eq: (a, b) => a === b,
};

const app = express();

if (!process.env.OWM_API_KEY) {
  console.warn("OWM_API_KEY is not set");
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(fileUpload());

app.engine(".hbs", engine({ extname: ".hbs", helpers: hbsHelpers }));
app.set("view engine", ".hbs");
app.set("views", "./views");

app.use("/", router);

// Start MQTT subscriber
startMqtt();

const listener = app.listen(process.env.PORT || 4000, () => {
  console.log(`WeatherTop started on http://localhost:${listener.address().port}`);
});

