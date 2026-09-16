const {
  WatchmanExpense,
  Watchman,
  sequelize,
} = require("../models");

const { Op } = require("sequelize");

const PAYMENT_METHODS = [
  "CASH",
  "UPI",
  "CARD",
  "BANK_TRANSFER",
  "CHEQUE",
  "OTHER",
];

const isValidAmount = (value) => {
  const num = Number(value);

  return (
    Number.isFinite(num) &&
    num > 0 &&
    Number.isInteger(num * 100)
  );
};

const isValidDate = (value) => {
  if (!value) return false;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  return !Number.isNaN(date.getTime());
};

const isValidDateRange = (start, end) => {
  return new Date(`${start}T00:00:00`) <=
    new Date(`${end}T00:00:00`);
};

const generatePaymentNumber = async (franchiseId, transaction) => {
  const year = new Date().getFullYear();

  const lastExpense = await WatchmanExpense.findOne({
    where: {
      franchiseId,
      paymentNumber: {
        [Op.ne]: null,
      },
    },
    order: [["createdAt", "DESC"]],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  let nextNumber = 1;

  if (lastExpense?.paymentNumber) {
    const match = lastExpense.paymentNumber.match(/(\d+)$/);

    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  return `WEP-${year}-${String(nextNumber).padStart(3, "0")}`;
};

/**
 * CREATE WATCHMAN EXPENSE
 */
const createWatchmanExpense = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      watchmanId,
      periodStart,
      periodEnd,
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      receiptNumber,
      status,
      remarks,
    } = req.body;

    const franchiseId = req.user.franchiseId;

    if (
      !watchmanId ||
      !periodStart ||
      !periodEnd ||
      amount === undefined
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "watchmanId, periodStart, periodEnd and amount are required",
      });
    }

    if (!isValidAmount(amount)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Amount must be a valid positive amount with maximum 2 decimals",
      });
    }

    if (!isValidDate(periodStart) || !isValidDate(periodEnd)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "periodStart and periodEnd must use YYYY-MM-DD format",
      });
    }

    if (!isValidDateRange(periodStart, periodEnd)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "periodEnd cannot be before periodStart",
      });
    }

    if (paymentDate && !isValidDate(paymentDate)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid paymentDate. Use YYYY-MM-DD format",
      });
    }

    if (
      paymentMethod &&
      !PAYMENT_METHODS.includes(paymentMethod)
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    if (
      status &&
      !["PENDING", "PAID"].includes(status)
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid expense status",
      });
    }

    if (
      ["UPI", "BANK_TRANSFER", "CHEQUE"].includes(paymentMethod) &&
      !referenceNumber?.trim()
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Reference number is required for UPI, bank transfer and cheque payments",
      });
    }

    // Lock franchise-level expense numbering / period validation
    await sequelize.query(
      "SELECT pg_advisory_xact_lock(hashtext(:franchiseId))",
      {
        replacements: { franchiseId },
        transaction,
      }
    );

    // Verify watchman belongs to this franchise
    const watchman = await Watchman.findOne({
      where: {
        id: watchmanId,
        franchiseId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!watchman) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Watchman not found in this franchise",
      });
    }

    // Prevent overlapping expense periods for same watchman
    const overlappingExpense = await WatchmanExpense.findOne({
      where: {
        franchiseId,
        watchmanId,
        periodStart: {
          [Op.lte]: periodEnd,
        },
        periodEnd: {
          [Op.gte]: periodStart,
        },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (overlappingExpense) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "An expense already exists for this watchman for the selected period",
      });
    }

    const cleanReferenceNumber =
      referenceNumber?.trim() || null;

    const cleanReceiptNumber =
      receiptNumber?.trim() || null;

    const expenseStatus = status || "PENDING";

    // If created directly as PAID, payment details are mandatory
    if (expenseStatus === "PAID") {
      if (!paymentDate || !paymentMethod) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            "Payment date and payment method are required for a paid expense",
        });
      }
    }

    let paymentNumber = null;

    if (expenseStatus === "PAID") {
      paymentNumber = await generatePaymentNumber(
        franchiseId,
        transaction
      );
    }

    const expense = await WatchmanExpense.create(
      {
        franchiseId,
        watchmanId,
        periodStart,
        periodEnd,
        amount: Number(amount).toFixed(2),
        paymentDate: paymentDate || null,
        paymentMethod: paymentMethod || null,
        paymentNumber,
        receiptNumber: cleanReceiptNumber,
        referenceNumber: cleanReferenceNumber,
        status: expenseStatus,
        paidBy:
          expenseStatus === "PAID"
            ? req.user.name || "Franchise Admin"
            : null,
        remarks: remarks?.trim() || null,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Watchman expense created successfully",
      data: expense,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Create watchman expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create watchman expense",
    });
  }
};

/**
 * GET ALL WATCHMAN EXPENSES
 */
const getWatchmanExpenses = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;

    const expenses = await WatchmanExpense.findAll({
      where: {
        franchiseId,
      },

      include: [
        {
          model: Watchman,
          as: "watchman",
          attributes: [
            "id",
            "name",
            "phone",
            "paymentType",
            "rate",
            "isActive",
          ],
        },
      ],

      order: [
        ["periodStart", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error("Get watchman expenses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch watchman expenses",
    });
  }
};

/**
 * GET SINGLE WATCHMAN EXPENSE
 */
const getWatchmanExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;

    const expense = await WatchmanExpense.findOne({
      where: {
        id,
        franchiseId,
      },

      include: [
        {
          model: Watchman,
          as: "watchman",
          attributes: [
            "id",
            "name",
            "phone",
            "joiningDate",
            "paymentType",
            "rate",
            "isActive",
          ],
        },
      ],
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Watchman expense not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("Get watchman expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch watchman expense",
    });
  }
};

/**
 * UPDATE PENDING WATCHMAN EXPENSE
 */
const updateWatchmanExpense = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;

    const {
      watchmanId,
      periodStart,
      periodEnd,
      amount,
      remarks,
    } = req.body;

    const expense = await WatchmanExpense.findOne({
      where: {
        id,
        franchiseId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!expense) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Watchman expense not found",
      });
    }

    // Paid financial records should not be edited.
    if (expense.status === "PAID") {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Paid watchman expenses cannot be edited. Use a reversal/adjustment process instead.",
      });
    }

    const finalWatchmanId =
      watchmanId || expense.watchmanId;

    const finalPeriodStart =
      periodStart || expense.periodStart;

    const finalPeriodEnd =
      periodEnd || expense.periodEnd;

    const finalAmount =
      amount !== undefined
        ? amount
        : expense.amount;

    if (!isValidAmount(finalAmount)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Amount must be a valid positive amount with maximum 2 decimals",
      });
    }

    if (
      !isValidDate(finalPeriodStart) ||
      !isValidDate(finalPeriodEnd)
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid expense period",
      });
    }

    if (
      !isValidDateRange(
        finalPeriodStart,
        finalPeriodEnd
      )
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "periodEnd cannot be before periodStart",
      });
    }

    const watchman = await Watchman.findOne({
      where: {
        id: finalWatchmanId,
        franchiseId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!watchman) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Watchman not found in this franchise",
      });
    }

    // Check overlapping periods excluding current expense
    const overlappingExpense =
      await WatchmanExpense.findOne({
        where: {
          franchiseId,
          watchmanId: finalWatchmanId,
          id: {
            [Op.ne]: id,
          },
          periodStart: {
            [Op.lte]: finalPeriodEnd,
          },
          periodEnd: {
            [Op.gte]: finalPeriodStart,
          },
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

    if (overlappingExpense) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Another expense already exists for this watchman for the selected period",
      });
    }

    await expense.update(
      {
        watchmanId: finalWatchmanId,
        periodStart: finalPeriodStart,
        periodEnd: finalPeriodEnd,
        amount: Number(finalAmount).toFixed(2),
        remarks:
          remarks !== undefined
            ? remarks?.trim() || null
            : expense.remarks,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Watchman expense updated successfully",
      data: expense,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Update watchman expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update watchman expense",
    });
  }
};

/**
 * MARK WATCHMAN EXPENSE AS PAID
 */
const markWatchmanExpensePaid = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;

    const {
      paymentDate,
      paymentMethod,
      referenceNumber,
      receiptNumber,
      remarks,
    } = req.body;

    if (!paymentDate || !paymentMethod) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Payment date and payment method are required",
      });
    }

    if (!isValidDate(paymentDate)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid payment date. Use YYYY-MM-DD format",
      });
    }

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    if (
      ["UPI", "BANK_TRANSFER", "CHEQUE"].includes(
        paymentMethod
      ) &&
      !referenceNumber?.trim()
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Reference number is required for UPI, bank transfer and cheque payments",
      });
    }

    const expense = await WatchmanExpense.findOne({
      where: {
        id,
        franchiseId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!expense) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Watchman expense not found",
      });
    }

    if (expense.status === "PAID") {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Watchman expense is already paid",
      });
    }

    // Franchise-level sequential payment numbering
    await sequelize.query(
      "SELECT pg_advisory_xact_lock(hashtext(:franchiseId))",
      {
        replacements: { franchiseId },
        transaction,
      }
    );

    const paymentNumber = await generatePaymentNumber(
      franchiseId,
      transaction
    );

    await expense.update(
      {
        paymentDate,
        paymentMethod,
        paymentNumber,
        receiptNumber:
          receiptNumber?.trim() || null,
        referenceNumber:
          referenceNumber?.trim() || null,
        status: "PAID",
        paidBy:
          req.user.name || "Franchise Admin",
        remarks:
          remarks !== undefined
            ? remarks?.trim() || null
            : expense.remarks,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Watchman expense marked as paid successfully",
      data: expense,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Mark watchman expense paid error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark watchman expense as paid",
    });
  }
};

/**
 * DELETE WATCHMAN EXPENSE
 *
 * Only pending expenses can be deleted.
 * Paid financial records must remain for auditability.
 */
const deleteWatchmanExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;

    const expense = await WatchmanExpense.findOne({
      where: {
        id,
        franchiseId,
      },
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Watchman expense not found",
      });
    }

    if (expense.status === "PAID") {
      return res.status(400).json({
        success: false,
        message:
          "Paid watchman expenses cannot be deleted. Use a reversal/adjustment process instead.",
      });
    }

    await expense.destroy();

    return res.status(200).json({
      success: true,
      message: "Pending watchman expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete watchman expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete watchman expense",
    });
  }
};

/**
 * WATCHMAN EXPENSE SUMMARY
 */
const getWatchmanExpenseSummary = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;

    const expenses = await WatchmanExpense.findAll({
      where: {
        franchiseId,
      },
      attributes: [
        "id",
        "amount",
        "status",
      ],
    });

    let totalExpenses = 0;
    let totalPaid = 0;
    let totalPending = 0;

    for (const expense of expenses) {
      const amount = Number(expense.amount || 0);

      totalExpenses += amount;

      if (expense.status === "PAID") {
        totalPaid += amount;
      } else {
        totalPending += amount;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        totalExpenses: Number(
          totalExpenses.toFixed(2)
        ),
        totalPaid: Number(
          totalPaid.toFixed(2)
        ),
        totalPending: Number(
          totalPending.toFixed(2)
        ),
        totalRecords: expenses.length,
      },
    });
  } catch (error) {
    console.error(
      "Get watchman expense summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch watchman expense summary",
    });
  }
};

module.exports = {
  createWatchmanExpense,
  getWatchmanExpenses,
  getWatchmanExpenseById,
  updateWatchmanExpense,
  markWatchmanExpensePaid,
  deleteWatchmanExpense,
  getWatchmanExpenseSummary,
};