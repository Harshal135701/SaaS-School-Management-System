const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");

const {
  createHomework,
  getHomeworks,
  getHomeworkById,
  updateHomework,
  deleteHomework,
} = require("../controllers/homeworkController");

router.post("/", teacherOrFranchiseProtect, createHomework);
router.get("/", teacherOrFranchiseProtect, getHomeworks);
router.get("/:id", teacherOrFranchiseProtect, getHomeworkById);
router.put("/:id", teacherOrFranchiseProtect, updateHomework);
router.delete("/:id", teacherOrFranchiseProtect, deleteHomework);

module.exports = router;