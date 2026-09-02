const express = require("express");

const router = express.Router();

const teacherOrFranchiseProtect = require("../middleware/teacherOrFranchiseProtect");

const {
  createAttendance,
  getAttendance,
  getStudentAttendance,
  updateAttendance,
  deleteAttendance
} = require("../controllers/attendanceController");

router.post("/", teacherOrFranchiseProtect, createAttendance);


router.get("/", teacherOrFranchiseProtect, getAttendance);
router.get("/student/:studentId",teacherOrFranchiseProtect,getStudentAttendance);


router.put("/:id", teacherOrFranchiseProtect, updateAttendance);

router.delete("/:id", teacherOrFranchiseProtect, deleteAttendance);


module.exports = router;