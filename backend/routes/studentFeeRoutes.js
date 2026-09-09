const express = require("express");
const router = express.Router();

const { createStudentFee,getStudentFees } = require("../controllers/studentFeeController");
const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.post("/", createStudentFee);
router.get("/", getStudentFees);

module.exports = router;