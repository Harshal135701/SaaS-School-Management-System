const express = require("express");
const router = express.Router();

const {
  createSalaryPayment,
  getSalaryPayments,
} = require("../controllers/salaryPaymentController");

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.post("/", createSalaryPayment);
router.get("/", getSalaryPayments);

module.exports = router;