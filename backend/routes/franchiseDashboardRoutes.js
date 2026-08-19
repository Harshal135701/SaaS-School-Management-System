const express = require("express");

const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");
const { getDashboard } = require("../controllers/franchiseDashboardController");

router.get("/", franchiseProtect, getDashboard);

module.exports = router;