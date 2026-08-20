const express = require("express");
const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

const {
  createTimetable,
  getTimetables,
  getTimetableById,
  updateTimetable,
  deleteTimetable,
} = require("../controllers/timetableController");

router.post("/", franchiseProtect, createTimetable);
router.get("/", franchiseProtect, getTimetables);
router.get("/:id", franchiseProtect, getTimetableById);
router.put("/:id", franchiseProtect, updateTimetable);
router.delete("/:id", franchiseProtect, deleteTimetable);

module.exports = router;