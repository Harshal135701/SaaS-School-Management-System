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
const monthlyRoyaltyRoutes = require("./routes/monthlyRoyaltyRoutes");
const contractRoutes = require("./routes/contractRoutes");
const systemSettingsRoutes = require("./routes/systemSettingsRoutes");
const planRoutes = require("./routes/planRoutes");
const franchiseAuthRoutes = require("./routes/franchiseAuthRoutes");
const franchiseTestRoutes = require("./routes/franchiseTestRoutes");
const franchiseDashboardRoutes = require("./routes/franchiseDashboardRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const homeworkRoutes = require("./routes/homeworkRoutes");
const feeRoutes = require("./routes/feeRoutes");
const examinationRoutes = require("./routes/examinationRoutes");
const bookRoutes = require("./routes/bookRoutes");
const bookIssueRoutes = require("./routes/bookIssueRoutes");

// using all apis for calling

app.use("/api/auth", authRoutes);
app.use("/api/system-admin", systemAdminRoutes);
app.use("/api/system-admin/royalties", royaltyRoutes);
app.use("/api/royalties/monthly", monthlyRoyaltyRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/system-settings", systemSettingsRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/franchise/auth", franchiseAuthRoutes);
app.use("/api/franchise/test", franchiseTestRoutes);
app.use("/api/franchise/dashboard", franchiseDashboardRoutes);
app.use("/api/franchise/students", studentRoutes);
app.use("/api/franchise/teachers", teacherRoutes);
app.use("/api/franchise/attendance", attendanceRoutes);
app.use("/api/franchise/homework", homeworkRoutes);
app.use("/api/franchise/fees", feeRoutes);
app.use("/api/franchise/examinations", examinationRoutes);
app.use("/api/franchise/books", bookRoutes);
app.use("/api/franchise/book-issues", bookIssueRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "School Management System API is running",
  });
});

module.exports = app;