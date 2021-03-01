const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const uuid = require("node-uuid");

const HttpError = require("./model/http-error");
const config = require("./utils/config");
const LOG = require("./utils/logger");

/* Routes */
const employeeRouter = require("./routes/employee-route");
const temperatureRouter = require("./routes/temperature-route");
const historyRouter = require("./routes/history-route");

/* App Setting */
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/static"));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH"
  );
  next();
});

/* Connect To DB */
LOG.info("⌛connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    LOG.info("✅connected to MongoDB");
  })
  .catch(error => {
    LOG.error("❌error connecting to MongoDB:", error.message);
  });
mongoose.set("useCreateIndex", true);

/* Morgan Logging */
morgan.token("id", function getId(req) {
  return req._id;
});
morgan.token("body", function getBody(req) {
  return JSON.stringify(req.body);
});
morgan.token("date", function () {
  return new Date().toLocaleString("en-CA", {
    timeZone: "America/Vancouver",
  });
});
app.use((req, res, next) => {
  req._id = uuid.v4();
  next();
});

if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan(
      "--> [:date[web]] :id :remote-addr :remote-user :method :url :body content-length::req[content-length]",
      {
        immediate: true,
      }
    )
  );
  app.use(
    morgan(
      "<-- [:date[web]] :id status::status response-time::response-time[digits]ms content-length::res[content-length]",
      {
        immediate: false,
      }
    )
  );
}

/* Health Check */
app.get("/version", (req, res) => {
  res.status(200).json({ version: config.VERSION });
});

/* Static Image Folder */
// TBD

/* APIs */
app.use("/api/employee", employeeRouter);
app.use("/api/temperature", temperatureRouter);
app.use("/api/history", historyRouter);

/* Error Handling */
app.use((req, res, next) => {
  return next(new HttpError("Could not find this route", 404));
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

module.exports = app;
