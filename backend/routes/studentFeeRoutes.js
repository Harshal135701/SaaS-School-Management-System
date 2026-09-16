const express = require("express");

const router = express.Router();

const {
  createStudentFee,
  getStudentFees,
  getFeeSummary,
  getStudentsFeeSummary,
  getStudentFeeDetails,
  updateStudentFee,
  deleteStudentFee,
} = require("../controllers/studentFeeController");

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.get("/", getStudentFees);

router.get("/summary", getFeeSummary);

router.get("/students", getStudentsFeeSummary);

router.get("/students/:studentId", getStudentFeeDetails);

router.post("/", createStudentFee);

router.put("/:id", updateStudentFee);

router.delete("/:id", deleteStudentFee);

module.exports = router;