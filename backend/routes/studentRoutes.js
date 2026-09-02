const express = require("express");

const router = express.Router();

// const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");


router.get("/", teacherOrFranchiseProtect, getStudents);
router.get("/:id", teacherOrFranchiseProtect, getStudentById);

router.post("/", teacherOrFranchiseProtect, createStudent);

router.put("/:id", teacherOrFranchiseProtect, updateStudent);

router.delete("/:id", teacherOrFranchiseProtect, deleteStudent);

module.exports = router;