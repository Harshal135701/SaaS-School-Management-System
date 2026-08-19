const express = require("express");

const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

const {
  createExamination,
  getExaminations,
  updateExamination,
  getExaminationById,
  deleteExamination,
} = require("../controllers/examinationController");

router.post("/", franchiseProtect, createExamination);
router.get("/", franchiseProtect, getExaminations);
router.get("/:id", franchiseProtect, getExaminationById);
router.put("/:id", franchiseProtect, updateExamination);
router.delete("/:id", franchiseProtect, deleteExamination);

module.exports = router;