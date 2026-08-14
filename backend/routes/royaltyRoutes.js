const express = require("express");
const router = express.Router();

const {
  createRoyaltyConfiguration,
  getRoyaltyConfigurations,
  getRoyaltyConfigurationsByFranchise,
  updateRoyaltyConfiguration,
} = require("../controllers/royaltyConfigurationController");

const protect = require("../middleware/authMiddleware");

router.post("/configurations", protect, createRoyaltyConfiguration);

router.get("/configurations", protect, getRoyaltyConfigurations);

router.get(
  "/configurations/franchise/:franchiseId",
  protect,
  getRoyaltyConfigurationsByFranchise
);

router.put(
  "/configurations/:id",
  protect,
  updateRoyaltyConfiguration
);

module.exports = router;