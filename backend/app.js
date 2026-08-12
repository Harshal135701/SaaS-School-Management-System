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

// Here all the apis init

const authRoutes = require("./routes/authRoutes");
const systemAdminRoutes = require("./routes/systemAdminRoutes");
const royaltyRoutes = require("./routes/royaltyRoutes");

// using all apis for calling

app.use("/api/auth", authRoutes);
app.use("/api/system-admin", systemAdminRoutes);
app.use("/api/system-admin/royalties", royaltyRoutes);


// Test route
app.get("/", (req, res) => {
  res.json({
    message: "School Management System API is running",
  });
});

module.exports = app;