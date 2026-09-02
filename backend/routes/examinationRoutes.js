const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");

const {
  createExamination,
  getExaminations,
  updateExamination,
  getExaminationById,
  deleteExamination,
} = require("../controllers/examinationController");

router.post("/", teacherOrFranchiseProtect, createExamination);
router.get("/", teacherOrFranchiseProtect, getExaminations);
router.get("/:id", teacherOrFranchiseProtect, getExaminationById);
router.put("/:id", teacherOrFranchiseProtect, updateExamination);
router.delete("/:id", teacherOrFranchiseProtect, deleteExamination);

module.exports = router;