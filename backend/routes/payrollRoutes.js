const express = require("express");
const router = express.Router();

const {
  getPayrollDashboard,
} = require("../controllers/payrollController");

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.get("/dashboard", getPayrollDashboard);

module.exports = router;