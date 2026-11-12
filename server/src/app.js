const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const readingRoutes = require("./routes/readingRoutes");
const reportRoutes = require("./routes/reportRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Sweety – Blood Glucose Tracker",
    timestamp: new Date().toISOString(),
  });
});

// Mount application routes
app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/reports", reportRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
