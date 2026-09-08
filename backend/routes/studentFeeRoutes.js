const express = require("express");
const router = express.Router();

const { createStudentFee } = require("../controllers/studentFeeController");
const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.post("/", createStudentFee);

module.exports = router;