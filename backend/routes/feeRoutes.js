const express = require("express");

const router = express.Router();

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

const {
  createFee,
  getFees,
  getFeeById,
  updateFee,
  deleteFee,
} = require("../controllers/feeController");

router.post("/", franchiseProtect, createFee);
router.get("/", franchiseProtect, getFees);
router.get("/:id", franchiseProtect, getFeeById);
router.put("/:id", franchiseProtect, updateFee);
router.delete("/:id", franchiseProtect, deleteFee);

module.exports = router;