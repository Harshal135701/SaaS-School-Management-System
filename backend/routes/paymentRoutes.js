const express = require("express");
const router = express.Router();

const { createPayment } = require("../controllers/paymentController");
const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.post("/", createPayment);

module.exports = router;