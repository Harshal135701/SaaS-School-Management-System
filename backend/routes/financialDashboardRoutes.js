const express = require("express");
const router = express.Router();

const {
  getFinancialDashboard,
} = require("../controllers/financialDashboardController");

const  franchiseProtect  = require("../middleware/franchiseAuthMiddleware");

router.get("/", franchiseProtect, getFinancialDashboard);

module.exports = router;