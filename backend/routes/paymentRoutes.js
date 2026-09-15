
const express = require("express");

const router = express.Router();

const {
  createPayment,
  getPayments,
  getPaymentReceipt,
  deletePayment,
  generatePaymentReceiptPDF,
} = require("../controllers/paymentController");

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.get("/", getPayments);

router.post("/", createPayment);

router.get("/:id/receipt", getPaymentReceipt);

router.get("/:id/receipt/pdf", generatePaymentReceiptPDF);

router.delete("/:id", deletePayment);

module.exports = router;

