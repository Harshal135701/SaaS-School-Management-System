const express = require("express");
const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  createTimetable,
  getTimetables,
  getTimetableById,
  updateTimetable,
  deleteTimetable,
} = require("../controllers/timetableController");

const teachingAccess = allowRoles(
  "PRINCIPAL",
  "HOD",
  "TEACHER",
  "FRANCHISE_ADMIN"
);

router.post("/", teacherOrFranchiseProtect, teachingAccess, createTimetable);
router.get("/", teacherOrFranchiseProtect, teachingAccess, getTimetables);
router.get("/:id", teacherOrFranchiseProtect, teachingAccess, getTimetableById);
router.put("/:id", teacherOrFranchiseProtect, teachingAccess, updateTimetable);
router.delete("/:id", teacherOrFranchiseProtect, teachingAccess, deleteTimetable);

module.exports = router;