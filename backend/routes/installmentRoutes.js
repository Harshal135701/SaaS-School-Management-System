const express = require("express");
const router = express.Router();

const { createInstallment } = require("../controllers/installmentController");
const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.post("/", createInstallment);

module.exports = router;