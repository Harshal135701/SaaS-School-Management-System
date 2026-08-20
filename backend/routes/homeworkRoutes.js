const express = require("express");

const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

const {
  createHomework,
  getHomeworks,
  getHomeworkById,
  updateHomework,
  deleteHomework,
} = require("../controllers/homeworkController");

router.post("/", franchiseProtect, createHomework);
router.get("/", franchiseProtect, getHomeworks);
router.get("/:id", franchiseProtect, getHomeworkById);
router.put("/:id", franchiseProtect, updateHomework);
router.delete("/:id", franchiseProtect, deleteHomework);

module.exports = router;