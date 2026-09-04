const express = require("express");
const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/teacherAssignmentController");

router.post(
  "/",
  franchiseProtect,
  allowRoles("FRANCHISE_ADMIN", "PRINCIPAL"),
  createAssignment
);

router.get(
  "/",
  franchiseProtect,
  allowRoles("FRANCHISE_ADMIN", "PRINCIPAL", "HOD", "TEACHER"),
  getAssignments
);

router.put(
  "/:id",
  franchiseProtect,
  allowRoles("FRANCHISE_ADMIN", "PRINCIPAL"),
  updateAssignment
);

router.delete(
  "/:id",
  franchiseProtect,
  allowRoles("FRANCHISE_ADMIN", "PRINCIPAL"),
  deleteAssignment
);

module.exports = router;