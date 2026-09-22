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

const viewAccess = allowRoles(
  "FRANCHISE_ADMIN",
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "DATA_ENTRY"
);

const manageAccess = allowRoles(
  "FRANCHISE_ADMIN",
  "PRINCIPAL",
  "HOD",
  "DATA_ENTRY"
);

router.get("/", franchiseProtect, viewAccess, getSubjects);
router.get("/:id", franchiseProtect, viewAccess, getSubjectById);
router.post("/", franchiseProtect, manageAccess, createSubject);
router.put("/:id", franchiseProtect, manageAccess, updateSubject);
router.delete("/:id", franchiseProtect, manageAccess, deleteSubject);

module.exports = router;