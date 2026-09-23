const express = require("express");
const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
} = require("../controllers/sectionController");

const academicAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "DATA_ENTRY",
  "FRANCHISE_ADMIN"
);

router.get("/", teacherOrFranchiseProtect, academicAccess, getSections);
router.get("/:id", teacherOrFranchiseProtect, academicAccess, getSectionById);
router.post("/", teacherOrFranchiseProtect, academicAccess, createSection);
router.put("/:id", teacherOrFranchiseProtect, academicAccess, updateSection);
router.delete("/:id", teacherOrFranchiseProtect, academicAccess, deleteSection);

module.exports = router;