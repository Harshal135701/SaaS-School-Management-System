const express = require("express");
const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");
const requireFeature = require("../middleware/featureMiddleware");

router.get(
  "/student",
  franchiseProtect,
  requireFeature("STUDENT"),
  (req, res) => {
    res.json({
      success: true,
      message: "Student feature is accessible",
    });
  }
);

router.get(
  "/transport",
  franchiseProtect,
  requireFeature("TRANSPORT"),
  (req, res) => {
    res.json({
      success: true,
      message: "Transport feature is accessible",
    });
  }
);

module.exports = router;