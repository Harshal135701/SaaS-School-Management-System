const express = require("express");
const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createExamResult,
  getExamResults,
  getResultsByExamination,
  updateExamResult,
  deleteExamResult,
} = require("../controllers/examResultController");

const teachingAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "FRANCHISE_ADMIN"
);

router.post("/", teacherOrFranchiseProtect, teachingAccess, createExamResult);

router.get("/", teacherOrFranchiseProtect, teachingAccess, getExamResults);

router.get(
  "/examination/:examinationId",
  teacherOrFranchiseProtect,
  teachingAccess,
  getResultsByExamination
);

router.put("/:id", teacherOrFranchiseProtect, teachingAccess, updateExamResult);

router.delete("/:id", teacherOrFranchiseProtect, teachingAccess, deleteExamResult);

module.exports = router;