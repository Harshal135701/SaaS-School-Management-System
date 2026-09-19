const express = require("express");
const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createSubjectRequirement,
  getSubjectRequirements,
} = require("../controllers/subjectRequirementController");

const adminAccess = allowRoles(
  "FRANCHISE_ADMIN",
  "PRINCIPAL"
);

router.post(
  "/",
  franchiseProtect,
  adminAccess,
  createSubjectRequirement
);

router.get(
  "/",
  franchiseProtect,
  allowRoles("FRANCHISE_ADMIN", "PRINCIPAL", "HOD", "TEACHER"),
  getSubjectRequirements
);

module.exports = router;