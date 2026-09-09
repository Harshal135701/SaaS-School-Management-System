const express = require("express");
const router = express.Router();

const {
  createInstallment,
  getInstallments,
} = require("../controllers/installmentController");
const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.post("/", createInstallment);
router.get("/", getInstallments);

module.exports = router;