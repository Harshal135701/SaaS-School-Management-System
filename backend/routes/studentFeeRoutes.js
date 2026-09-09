const express = require("express");
const router = express.Router();

const {
    createStudentFee,
    getStudentFees,
    getFeeSummary,
} = require("../controllers/studentFeeController"); 
const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.post("/", createStudentFee);
router.get("/", getStudentFees);
router.get("/summary", getFeeSummary);

module.exports = router;