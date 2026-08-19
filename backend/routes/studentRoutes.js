const express = require("express");

const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");


router.get("/", franchiseProtect, getStudents);
router.get("/:id", franchiseProtect, getStudentById);

router.post("/", franchiseProtect, createStudent);

router.put("/:id", franchiseProtect, updateStudent);

router.delete("/:id", franchiseProtect, deleteStudent);

module.exports = router;