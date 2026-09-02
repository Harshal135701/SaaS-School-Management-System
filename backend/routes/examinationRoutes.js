const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createExamination,
  getExaminations,
  updateExamination,
  getExaminationById,
  deleteExamination,
} = require("../controllers/examinationController");

const teachingAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "FRANCHISE_ADMIN"
);

router.post("/", teacherOrFranchiseProtect, teachingAccess, createExamination);
router.get("/", teacherOrFranchiseProtect, teachingAccess, getExaminations);
router.get("/:id", teacherOrFranchiseProtect, teachingAccess, getExaminationById);
router.put("/:id", teacherOrFranchiseProtect, teachingAccess, updateExamination);
router.delete("/:id", teacherOrFranchiseProtect, teachingAccess, deleteExamination);

module.exports = router;