const express = require("express");
const router = express.Router();

const {
  createSalaryProfile,
  getSalaryProfiles,
} = require("../controllers/salaryProfileController");

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseProtect);

router.post("/", createSalaryProfile);
router.get("/", getSalaryProfiles);

module.exports = router;