const express = require("express");

const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

const {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher
} = require("../controllers/teacherController");

router.get("/", franchiseProtect, getTeachers);
router.get("/:id", franchiseProtect, getTeacherById);
router.post("/", franchiseProtect, createTeacher);
router.put("/:id", franchiseProtect, updateTeacher);
router.delete("/:id", franchiseProtect, deleteTeacher);

module.exports = router;