const express = require("express");

const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

const {
  createAttendance,
  getAttendance,
  getStudentAttendance,
  updateAttendance,
  deleteAttendance
} = require("../controllers/attendanceController");

router.post("/", franchiseProtect, createAttendance);


router.get("/", franchiseProtect, getAttendance);
router.get("/student/:studentId",franchiseProtect,getStudentAttendance);


router.put("/:id", franchiseProtect, updateAttendance);

router.delete("/:id", franchiseProtect, deleteAttendance);


module.exports = router;