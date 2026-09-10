const express = require("express");
const router = express.Router();

const {
  generateMonthlySalary,
  getMonthlySalaries,
} = require("../controllers/monthlySalaryController");

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.post("/generate", generateMonthlySalary);
router.get("/", getMonthlySalaries);

module.exports = router;