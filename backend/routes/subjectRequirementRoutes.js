const express = require("express");
const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
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
  teacherOrFranchiseProtect,
  adminAccess,
  createSubjectRequirement
);

router.get(
  "/",
  teacherOrFranchiseProtect,
  allowRoles("FRANCHISE_ADMIN", "PRINCIPAL", "HOD", "TEACHER"),
  getSubjectRequirements
);

module.exports = router;