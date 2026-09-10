const express = require("express");
const router = express.Router();

const {
  createSalaryAdvance,
} = require("../controllers/salaryAdvanceController");

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.post("/", createSalaryAdvance);

module.exports = router;