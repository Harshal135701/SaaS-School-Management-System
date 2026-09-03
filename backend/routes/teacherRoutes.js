const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/teacherController");

// View access
const teacherViewAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "FRANCHISE_ADMIN"
);

// Management access
const teacherManageAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "FRANCHISE_ADMIN"
);

// View teachers
router.get(
  "/",
  teacherOrFranchiseProtect,
  teacherViewAccess,
  getTeachers
);

router.get(
  "/:id",
  teacherOrFranchiseProtect,
  teacherViewAccess,
  getTeacherById
);

// Create teacher
router.post(
  "/",
  teacherOrFranchiseProtect,
  teacherManageAccess,
  createTeacher
);

// Update teacher
router.put(
  "/:id",
  teacherOrFranchiseProtect,
  teacherManageAccess,
  updateTeacher
);

// Delete teacher
router.delete(
  "/:id",
  teacherOrFranchiseProtect,
  teacherManageAccess,
  deleteTeacher
);

module.exports = router;