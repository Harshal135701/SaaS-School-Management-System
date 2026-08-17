const express = require("express");
const router = express.Router();

const { getPlans,getPlanById } = require("../controllers/planController");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, getPlans);
router.get("/:id", protect, getPlanById);

module.exports = router;