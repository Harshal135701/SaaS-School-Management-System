const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createAttendance,
  getAttendance,
  getStudentAttendance,
  updateAttendance,
  deleteAttendance
} = require("../controllers/attendanceController");

router.post(
  "/",
  teacherOrFranchiseProtect,
  allowRoles("PRINCIPAL", "HOD", "TEACHER", "FRANCHISE_ADMIN"),
  createAttendance
);

router.get(
  "/",
  teacherOrFranchiseProtect,
  allowRoles("PRINCIPAL", "HOD", "TEACHER", "FRANCHISE_ADMIN"),
  getAttendance
);

router.get(
  "/student/:studentId",
  teacherOrFranchiseProtect,
  allowRoles("PRINCIPAL", "HOD", "TEACHER", "FRANCHISE_ADMIN"),
  getStudentAttendance
);

router.put(
  "/:id",
  teacherOrFranchiseProtect,
  allowRoles("PRINCIPAL", "HOD", "TEACHER", "FRANCHISE_ADMIN"),
  updateAttendance
);

router.delete(
  "/:id",
  teacherOrFranchiseProtect,
  allowRoles("PRINCIPAL", "HOD", "TEACHER", "FRANCHISE_ADMIN"),
  deleteAttendance
);

module.exports = router;