const express = require("express");
const router = express.Router();
const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  getMyTimetable,
  getMyStudents,
  getMyAttendance,
  getMyExaminations,
  getMyHomework,
  getMySalary
} = require("../controllers/teacherMeController");

router.use(teacherOrFranchiseProtect);
router.use(allowRoles("TEACHER", "HOD", "PRINCIPAL", "ACCOUNTANT", "DATA_ENTRY", "SUPPORT"));

router.get("/timetable", getMyTimetable);
router.get("/students", getMyStudents);
router.get("/attendance", getMyAttendance);
router.get("/examinations", getMyExaminations);
router.get("/homework", getMyHomework);

router.get("/salary", getMySalary);

module.exports = router;
