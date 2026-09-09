const express = require("express");
const router = express.Router();

const {
  createPayment,
  getPayments,
} = require("../controllers/paymentController");
const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.post("/", createPayment);
router.get("/", getPayments);

module.exports = router;