const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "School Management System API is running",
  });
});

module.exports = app;