const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const parentProtect = require("../middleware/parentAuthMiddleware");
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

// Parent - view only
router.get(
  "/parent/student/:studentId",
  parentProtect,
  getTimetables
);

// Staff - view
router.get(
  "/",
  teacherOrFranchiseProtect,
  teachingAccess,
  getTimetables
);

router.get(
  "/:id",
  teacherOrFranchiseProtect,
  teachingAccess,
  getTimetableById
);

// Staff - create/update/delete
router.post(
  "/",
  teacherOrFranchiseProtect,
  teachingAccess,
  createTimetable
);

router.put(
  "/:id",
  teacherOrFranchiseProtect,
  teachingAccess,
  updateTimetable
);

router.delete(
  "/:id",
  teacherOrFranchiseProtect,
  teachingAccess,
  deleteTimetable
);

module.exports = router;