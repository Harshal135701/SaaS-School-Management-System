const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const parentProtect = require("../middleware/parentAuthMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const studentAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "DATA_ENTRY",
  "FRANCHISE_ADMIN"
);

// Parent - view own child only
router.get(
  "/parent/:studentId",
  parentProtect,
  getStudentById
);

// Staff - view
router.get(
  "/",
  teacherOrFranchiseProtect,
  studentAccess,
  getStudents
);

router.get(
  "/:id",
  teacherOrFranchiseProtect,
  studentAccess,
  getStudentById
);

// Staff - create/update/delete
router.post(
  "/",
  teacherOrFranchiseProtect,
  studentAccess,
  createStudent
);

router.put(
  "/:id",
  teacherOrFranchiseProtect,
  studentAccess,
  updateStudent
);

router.delete(
  "/:id",
  teacherOrFranchiseProtect,
  studentAccess,
  deleteStudent
);

module.exports = router;