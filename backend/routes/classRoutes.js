const express = require("express");
const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
} = require("../controllers/classController");

const academicAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "DATA_ENTRY",
  "FRANCHISE_ADMIN"
);

router.get("/", teacherOrFranchiseProtect, academicAccess, getClasses);
router.get("/:id", teacherOrFranchiseProtect, academicAccess, getClassById);
router.post("/", teacherOrFranchiseProtect, academicAccess, createClass);
router.put("/:id", teacherOrFranchiseProtect, academicAccess, updateClass);
router.delete("/:id", teacherOrFranchiseProtect, academicAccess, deleteClass);

module.exports = router;