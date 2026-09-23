
const express = require("express");

const router = express.Router();

const {
  createPayment,
  getPayments,
  getPaymentReceipt,
  deletePayment,
  generatePaymentReceiptPDF,
} = require("../controllers/paymentController");

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const financeAccess = allowRoles(
  "PRINCIPAL",
  "ACCOUNTANT",
  "FRANCHISE_ADMIN"
);

router.use(teacherOrFranchiseProtect);
router.use(financeAccess);

router.get("/", getPayments);

router.post("/", createPayment);

router.get("/:id/receipt", getPaymentReceipt);

router.get("/:id/receipt/pdf", generatePaymentReceiptPDF);

router.delete("/:id", deletePayment);

module.exports = router;

