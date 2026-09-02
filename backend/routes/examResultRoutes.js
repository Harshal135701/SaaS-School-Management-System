const express = require("express");
const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");

const {
  createExamResult,
  getExamResults,
  getResultsByExamination,
  updateExamResult,
  deleteExamResult,
} = require("../controllers/examResultController");

router.post("/", teacherOrFranchiseProtect, createExamResult);

router.get("/", teacherOrFranchiseProtect, getExamResults);

router.get(
  "/examination/:examinationId",
  teacherOrFranchiseProtect,
  getResultsByExamination
);

router.put("/:id", teacherOrFranchiseProtect, updateExamResult);

router.delete("/:id", teacherOrFranchiseProtect, deleteExamResult);

module.exports = router;