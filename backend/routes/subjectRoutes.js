const express = require("express");
const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");

const academicAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "DATA_ENTRY",
  "FRANCHISE_ADMIN"
);

router.get("/", franchiseProtect, academicAccess, getSubjects);
router.get("/:id", franchiseProtect, academicAccess, getSubjectById);
router.post("/", franchiseProtect, academicAccess, createSubject);
router.put("/:id", franchiseProtect, academicAccess, updateSubject);
router.delete("/:id", franchiseProtect, academicAccess, deleteSubject);

module.exports = router;