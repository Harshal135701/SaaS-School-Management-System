const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const parentProtect = require("../middleware/parentAuthMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createAttendance,
  getAttendance,
  getStudentAttendance,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

// ====================
// STAFF - VIEW
// ====================

router.get(
  "/",
  teacherOrFranchiseProtect,
  allowRoles("PRINCIPAL", "HOD", "TEACHER", "FRANCHISE_ADMIN"),
  getAttendance
);

// ====================
// PARENT - VIEW ONLY
// ====================

router.get(
  "/parent/student/:studentId",
  parentProtect,
  getStudentAttendance
);

// ====================
// STAFF - VIEW STUDENT
// ====================

router.get(
  "/student/:studentId",
  teacherOrFranchiseProtect,
  allowRoles("PRINCIPAL", "HOD", "TEACHER", "FRANCHISE_ADMIN"),
  getStudentAttendance
);

// ====================
// STAFF - CREATE
// ====================

router.post(
  "/",
  teacherOrFranchiseProtect,
  allowRoles("PRINCIPAL", "HOD", "TEACHER", "FRANCHISE_ADMIN"),
  createAttendance
);

// ====================
// STAFF - UPDATE
// ====================

router.put(
  "/:id",
  teacherOrFranchiseProtect,
  allowRoles("PRINCIPAL", "HOD", "TEACHER", "FRANCHISE_ADMIN"),
  updateAttendance
);

// ====================
// STAFF - DELETE
// ====================

router.delete(
  "/:id",
  teacherOrFranchiseProtect,
  allowRoles("PRINCIPAL", "HOD", "TEACHER", "FRANCHISE_ADMIN"),
  deleteAttendance
);

module.exports = router;