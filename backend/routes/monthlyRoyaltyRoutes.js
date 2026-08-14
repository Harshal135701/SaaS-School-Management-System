const express = require("express");
const router = express.Router();

const {
  createMonthlyRoyalty,getMonthlyRoyalties,updateMonthlyRoyaltyStatus,getRoyaltyReport
} = require("../controllers/monthlyRoyaltyController");

const protect = require("../middleware/authMiddleware");

router.get("/", protect, getMonthlyRoyalties);
router.get("/report", protect, getRoyaltyReport);

router.post("/", protect, createMonthlyRoyalty);

router.put( "/:id/status", protect,updateMonthlyRoyaltyStatus);

module.exports = router;