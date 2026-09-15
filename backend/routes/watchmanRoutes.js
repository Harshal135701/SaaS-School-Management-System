
const express = require("express");

const router = express.Router();

const {
  createWatchman,
  getWatchmen,
  updateWatchman,
  toggleWatchmanStatus,
} = require("../controllers/watchmanController");

const {
  createWatchmanExpense,
  getWatchmanExpenses,
  getWatchmanExpenseById,
  updateWatchmanExpense,
  markWatchmanExpensePaid,
  deleteWatchmanExpense,
  getWatchmanExpenseSummary,
} = require("../controllers/watchmanExpenseController");

const franchiseProtect = require("../middleware/franchiseAuthMiddleware");

// All watchman and watchman-expense endpoints require franchise authentication
router.use(franchiseProtect);

// =====================================================
// WATCHMAN MANAGEMENT
// =====================================================

router.post("/", createWatchman);

router.get("/", getWatchmen);

router.put("/:id", updateWatchman);

router.patch("/:id/status", toggleWatchmanStatus);

// =====================================================
// WATCHMAN EXPENSE MANAGEMENT
// =====================================================

router.post("/expenses", createWatchmanExpense);

router.get("/expenses", getWatchmanExpenses);

router.get("/expenses/summary", getWatchmanExpenseSummary);

router.get("/expenses/:id", getWatchmanExpenseById);

router.put("/expenses/:id", updateWatchmanExpense);

router.patch("/expenses/:id/pay", markWatchmanExpensePaid);

router.delete("/expenses/:id", deleteWatchmanExpense);

module.exports = router;

