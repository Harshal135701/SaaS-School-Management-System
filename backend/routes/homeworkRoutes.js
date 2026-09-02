const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createHomework,
  getHomeworks,
  getHomeworkById,
  updateHomework,
  deleteHomework,
} = require("../controllers/homeworkController");

const teachingAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "FRANCHISE_ADMIN"
);

router.post("/", teacherOrFranchiseProtect, teachingAccess, createHomework);

router.get("/", teacherOrFranchiseProtect, teachingAccess, getHomeworks);

router.get("/:id", teacherOrFranchiseProtect, teachingAccess, getHomeworkById);

router.put("/:id", teacherOrFranchiseProtect, teachingAccess, updateHomework);

router.delete("/:id", teacherOrFranchiseProtect, teachingAccess, deleteHomework);

module.exports = router;