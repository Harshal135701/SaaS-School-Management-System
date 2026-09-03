const express = require("express");
const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");
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

router.get("/", franchiseProtect, academicAccess, getSections);
router.get("/:id", franchiseProtect, academicAccess, getSectionById);
router.post("/", franchiseProtect, academicAccess, createSection);
router.put("/:id", franchiseProtect, academicAccess, updateSection);
router.delete("/:id", franchiseProtect, academicAccess, deleteSection);

module.exports = router;