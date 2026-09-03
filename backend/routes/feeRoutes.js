const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createFee,
  getFees,
  getFeeById,
  updateFee,
  deleteFee,
} = require("../controllers/feeController");

const financeAccess = allowRoles(
  "PRINCIPAL",
  "ACCOUNTANT",
  "FRANCHISE_ADMIN"
);

router.post("/", teacherOrFranchiseProtect, financeAccess, createFee);
router.get("/", teacherOrFranchiseProtect, financeAccess, getFees);
router.get("/:id", teacherOrFranchiseProtect, financeAccess, getFeeById);
router.put("/:id", teacherOrFranchiseProtect, financeAccess, updateFee);
router.delete("/:id", teacherOrFranchiseProtect, financeAccess, deleteFee);

module.exports = router;