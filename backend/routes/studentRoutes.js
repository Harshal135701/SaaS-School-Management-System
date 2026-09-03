const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
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

router.get("/", teacherOrFranchiseProtect, studentAccess, getStudents);
router.get("/:id", teacherOrFranchiseProtect, studentAccess, getStudentById);

router.post("/", teacherOrFranchiseProtect, studentAccess, createStudent);

router.put("/:id", teacherOrFranchiseProtect, studentAccess, updateStudent);

router.delete("/:id", teacherOrFranchiseProtect, studentAccess, deleteStudent);

module.exports = router;