const express = require("express");
const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
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

router.get("/", teacherOrFranchiseProtect, viewAccess, getSubjects);
router.get("/:id", teacherOrFranchiseProtect, viewAccess, getSubjectById);
router.post("/", teacherOrFranchiseProtect, manageAccess, createSubject);
router.put("/:id", teacherOrFranchiseProtect, manageAccess, updateSubject);
router.delete("/:id", teacherOrFranchiseProtect, manageAccess, deleteSubject);

module.exports = router;