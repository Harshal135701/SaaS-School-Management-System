"use strict";

const express = require("express");
const router = express.Router();

const controller = require("../controllers/schoolExpenseController");

const franchiseAuthMiddleware = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseAuthMiddleware);

router.post("/", controller.createExpense);

router.get("/", controller.getExpenses);

router.get("/summary", controller.getExpenseSummary);

router.get("/:id", controller.getExpenseById);

router.put("/:id", controller.updateExpense);

router.patch("/:id/approve", controller.approveExpense);

router.patch("/:id/reject", controller.rejectExpense);

router.patch("/:id/pay", controller.markExpensePaid);

router.delete("/:id", controller.deleteExpense);

module.exports = router;