const express = require("express");
const router = express.Router();

const {
  createPayment,
  getPayments,
  deletePayment,
} = require("../controllers/paymentController");

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.get("/", getPayments);

router.post("/", createPayment);

router.delete("/:id", deletePayment);


module.exports = router;
