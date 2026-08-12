const express = require("express");
const router = express.Router();

const {
  createRoyaltyConfiguration,
  getRoyaltyConfigurations,
  getRoyaltyConfigurationsByFranchise,
  updateRoyaltyConfiguration,
} = require("../controllers/royaltyConfigurationController");

const protect = require("../middleware/authMiddleware");



router.get("/configurations", protect, getRoyaltyConfigurations);
router.get("/configurations/franchise/:franchiseId",protect, getRoyaltyConfigurationsByFranchise);


router.post("/configurations", protect, createRoyaltyConfiguration);

router.put("/configurations/:id", protect, updateRoyaltyConfiguration);

module.exports = router;