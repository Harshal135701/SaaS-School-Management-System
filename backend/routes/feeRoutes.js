const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const parentProtect = require("../middleware/parentAuthMiddleware");
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

// ====================
// PARENT - VIEW ONLY
// ====================

router.get(
  "/parent/student/:studentId",
  parentProtect,
  getFees
);

// ====================
// STAFF - VIEW
// ====================

router.get(
  "/",
  teacherOrFranchiseProtect,
  financeAccess,
  getFees
);

router.get(
  "/:id",
  teacherOrFranchiseProtect,
  financeAccess,
  getFeeById
);

// ====================
// STAFF - CREATE
// ====================

router.post(
  "/",
  teacherOrFranchiseProtect,
  financeAccess,
  createFee
);

// ====================
// STAFF - UPDATE
// ====================

router.put(
  "/:id",
  teacherOrFranchiseProtect,
  financeAccess,
  updateFee
);

// ====================
// STAFF - DELETE
// ====================

router.delete(
  "/:id",
  teacherOrFranchiseProtect,
  financeAccess,
  deleteFee
);

module.exports = router;