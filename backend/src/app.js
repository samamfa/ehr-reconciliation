const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authMiddleware = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");
const reconcileRoutes = require("./routes/reconcile");
const validateRoutes = require("./routes/validate");

const app = express();

app.use(helmet()); // security headers
app.use(cors()); // allow cross-origin requests
app.use(express.json()); // parse incoming JSON request bodies

// health check (no auth needed)
app.get("/health", (req, res) => res.json({ status: "ok" }));

// auth applied to all api routes
app.use("/api", authMiddleware);
app.use("/api/reconcile", reconcileRoutes);
app.use("/api/validate", validateRoutes);

// global error handler
app.use(errorHandler);

module.exports = app;
