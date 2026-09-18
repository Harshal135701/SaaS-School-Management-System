"use strict";

const { Op } = require("sequelize");
const {
  sequelize,
  SchoolExpense,
  ExpenseCategory,
  Vendor,
} = require("../models");

const PAYMENT_METHODS = [
  "CASH",
  "UPI",
  "CARD",
  "BANK_TRANSFER",
  "CHEQUE",
  "OTHER",
];

const STATUSES = ["PENDING", "APPROVED", "REJECTED", "PAID"];

const REFERENCE_REQUIRED_METHODS = [
  "UPI",
  "BANK_TRANSFER",
  "CHEQUE",
];

const getFranchiseId = (req) => req.user?.franchiseId;

const getUserId = (req) => req.user?.id;

const validateAmount = (amount) => {
  if (
    amount === undefined ||
    amount === null ||
    amount === "" ||
    Number.isNaN(Number(amount)) ||
    Number(amount) <= 0
  ) {
    return false;
  }

  const decimalPart = String(amount).split(".")[1];

  if (decimalPart && decimalPart.length > 2) {
    return false;
  }

  return true;
};

const validateDate = (date) => {
  if (!date) return false;

  const parsed = new Date(date);

  return !Number.isNaN(parsed.getTime());
};

const validatePaymentDetails = ({
  paymentMethod,
  referenceNumber,
  paymentDate,
}) => {
  if (!paymentMethod) {
    return "Payment method is required";
  }

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return "Invalid payment method";
  }

  if (!paymentDate) {
    return "Payment date is required";
  }

  if (!validateDate(paymentDate)) {
    return "Invalid payment date";
  }

  if (
    REFERENCE_REQUIRED_METHODS.includes(paymentMethod) &&
    (!referenceNumber || !String(referenceNumber).trim())
  ) {
    return `Reference number is required for ${paymentMethod}`;
  }

  return null;
};

// Generate payment number safely inside transaction
const generatePaymentNumber = async (franchiseId, transaction) => {
  await sequelize.query(
    "SELECT pg_advisory_xact_lock(hashtext(:franchiseId))",
    {
      replacements: { franchiseId },
      transaction,
    }
  );

  const year = new Date().getFullYear();

  const lastExpense = await SchoolExpense.findOne({
    where: {
      franchiseId,
      paymentNumber: {
        [Op.like]: `EXP-${year}-%`,
      },
    },
    order: [["paymentNumber", "DESC"]],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  let nextNumber = 1;

  if (lastExpense?.paymentNumber) {
    const match = lastExpense.paymentNumber.match(/(\d+)$/);

    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `EXP-${year}-${String(nextNumber).padStart(3, "0")}`;
};

// Verify category belongs to franchise
const getValidCategory = async (
  franchiseId,
  categoryId,
  transaction = undefined
) => {
  return ExpenseCategory.findOne({
    where: {
      id: categoryId,
      franchiseId,
      isActive: true,
    },
    transaction,
  });
};

// Verify vendor belongs to franchise
const getValidVendor = async (
  franchiseId,
  vendorId,
  transaction = undefined
) => {
  if (!vendorId) return null;

  return Vendor.findOne({
    where: {
      id: vendorId,
      franchiseId,
      status: "ACTIVE",
    },
    transaction,
  });
};

// Create Expense
exports.createExpense = async (req, res) => {
  try {
    const franchiseId = getFranchiseId(req);
    const createdBy = getUserId(req);

    if (!franchiseId || !createdBy) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      categoryId,
      vendorId,
      description,
      amount,
      expenseDate,
      remarks,
    } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Expense description is required",
      });
    }

    if (description.trim().length < 2 || description.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: "Description must be between 2 and 255 characters",
      });
    }

    if (!validateAmount(amount)) {
      return res.status(400).json({
        success: false,
        message:
          "Amount must be greater than zero and contain maximum 2 decimal places",
      });
    }

    if (!expenseDate || !validateDate(expenseDate)) {
      return res.status(400).json({
        success: false,
        message: "Valid expense date is required",
      });
    }

    const category = await getValidCategory(franchiseId, categoryId);

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Active expense category not found",
      });
    }

    const vendor = await getValidVendor(franchiseId, vendorId);

    if (vendorId && !vendor) {
      return res.status(400).json({
        success: false,
        message: "Active vendor not found",
      });
    }

    const expense = await SchoolExpense.create({
      franchiseId,
      categoryId,
      vendorId: vendor ? vendor.id : null,
      description: description.trim(),
      amount,
      expenseDate,
      status: "PENDING",
      remarks: remarks?.trim() || null,
      createdBy,
    });

    const createdExpense = await SchoolExpense.findOne({
      where: {
        id: expense.id,
        franchiseId,
      },
      include: [
        {
          model: ExpenseCategory,
          as: "category",
          attributes: ["id", "name", "description", "isActive"],
        },
        {
          model: Vendor,
          as: "vendor",
          attributes: [
            "id",
            "name",
            "contact",
            "email",
            "address",
            "status",
          ],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: createdExpense,
    });
  } catch (error) {
    console.error("Create school expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create expense",
    });
  }
};

// Get All Expenses
exports.getExpenses = async (req, res) => {
  try {
    const franchiseId = getFranchiseId(req);

    if (!franchiseId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { status, categoryId, vendorId, fromDate, toDate } = req.query;

    const where = {
      franchiseId,
    };

    if (status) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid expense status",
        });
      }

      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (fromDate || toDate) {
      where.expenseDate = {};

      if (fromDate) {
        if (!validateDate(fromDate)) {
          return res.status(400).json({
            success: false,
            message: "Invalid fromDate",
          });
        }

        where.expenseDate[Op.gte] = fromDate;
      }

      if (toDate) {
        if (!validateDate(toDate)) {
          return res.status(400).json({
            success: false,
            message: "Invalid toDate",
          });
        }

        where.expenseDate[Op.lte] = toDate;
      }
    }

    const expenses = await SchoolExpense.findAll({
      where,
      include: [
        {
          model: ExpenseCategory,
          as: "category",
          attributes: ["id", "name", "description", "isActive"],
        },
        {
          model: Vendor,
          as: "vendor",
          attributes: [
            "id",
            "name",
            "contact",
            "email",
            "address",
            "status",
          ],
        },
      ],
      order: [
        ["expenseDate", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error("Get school expenses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
    });
  }
};

// Get Expense By ID
exports.getExpenseById = async (req, res) => {
  try {
    const franchiseId = getFranchiseId(req);
    const { id } = req.params;

    const expense = await SchoolExpense.findOne({
      where: {
        id,
        franchiseId,
      },
      include: [
        {
          model: ExpenseCategory,
          as: "category",
          attributes: ["id", "name", "description", "isActive"],
        },
        {
          model: Vendor,
          as: "vendor",
          attributes: [
            "id",
            "name",
            "contact",
            "email",
            "address",
            "status",
          ],
        },
      ],
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("Get school expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expense",
    });
  }
};

// Update Expense
exports.updateExpense = async (req, res) => {
  try {
    const franchiseId = getFranchiseId(req);
    const { id } = req.params;

    const expense = await SchoolExpense.findOne({
      where: {
        id,
        franchiseId,
      },
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    if (!["PENDING", "REJECTED"].includes(expense.status)) {
      return res.status(409).json({
        success: false,
        message:
          "Only pending or rejected expenses can be edited",
      });
    }

    const {
      categoryId,
      vendorId,
      description,
      amount,
      expenseDate,
      remarks,
    } = req.body;

    if (categoryId !== undefined) {
      const category = await getValidCategory(
        franchiseId,
        categoryId
      );

      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Active expense category not found",
        });
      }

      expense.categoryId = categoryId;
    }

    if (vendorId !== undefined) {
      if (vendorId === null || vendorId === "") {
        expense.vendorId = null;
      } else {
        const vendor = await getValidVendor(
          franchiseId,
          vendorId
        );

        if (!vendor) {
          return res.status(400).json({
            success: false,
            message: "Active vendor not found",
          });
        }

        expense.vendorId = vendor.id;
      }
    }

    if (description !== undefined) {
      if (!description || !description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Expense description cannot be empty",
        });
      }

      if (
        description.trim().length < 2 ||
        description.trim().length > 255
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Description must be between 2 and 255 characters",
        });
      }

      expense.description = description.trim();
    }

    if (amount !== undefined) {
      if (!validateAmount(amount)) {
        return res.status(400).json({
          success: false,
          message:
            "Amount must be greater than zero and contain maximum 2 decimal places",
        });
      }

      expense.amount = amount;
    }

    if (expenseDate !== undefined) {
      if (!validateDate(expenseDate)) {
        return res.status(400).json({
          success: false,
          message: "Invalid expense date",
        });
      }

      expense.expenseDate = expenseDate;
    }

    if (remarks !== undefined) {
      expense.remarks =
        remarks === null ? null : remarks.trim();
    }

    // If rejected expense is edited, send it back to pending.
    if (expense.status === "REJECTED") {
      expense.status = "PENDING";
      expense.approvedBy = null;
      expense.approvedAt = null;
    }

    await expense.save();

    const updatedExpense = await SchoolExpense.findOne({
      where: {
        id: expense.id,
        franchiseId,
      },
      include: [
        {
          model: ExpenseCategory,
          as: "category",
        },
        {
          model: Vendor,
          as: "vendor",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense,
    });
  } catch (error) {
    console.error("Update school expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update expense",
    });
  }
};

// Approve Expense
exports.approveExpense = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const franchiseId = getFranchiseId(req);
    const approvedBy = getUserId(req);
    const { id } = req.params;

    if (!franchiseId || !approvedBy) {
      await transaction.rollback();

      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const expense = await SchoolExpense.findOne({
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
        message: "Expense not found",
      });
    }

    if (expense.status !== "PENDING") {
      await transaction.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Only pending expenses can be approved",
      });
    }

    expense.status = "APPROVED";
    expense.approvedBy = approvedBy;
    expense.approvedAt = new Date();

    await expense.save({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Expense approved successfully",
      data: expense,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Approve school expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve expense",
    });
  }
};

// Reject Expense
exports.rejectExpense = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const franchiseId = getFranchiseId(req);
    const { id } = req.params;
    const { remarks } = req.body;

    const expense = await SchoolExpense.findOne({
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
        message: "Expense not found",
      });
    }

    if (expense.status !== "PENDING") {
      await transaction.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Only pending expenses can be rejected",
      });
    }

    if (!remarks || !remarks.trim()) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Rejection remarks are required",
      });
    }

    expense.status = "REJECTED";
    expense.remarks = remarks.trim();

    await expense.save({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Expense rejected successfully",
      data: expense,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Reject school expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject expense",
    });
  }
};

// Mark Expense as Paid
exports.markExpensePaid = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const franchiseId = getFranchiseId(req);
    const paidBy = getUserId(req);
    const { id } = req.params;

    if (!franchiseId || !paidBy) {
      await transaction.rollback();

      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      paymentDate,
      paymentMethod,
      referenceNumber,
      receiptNumber,
    } = req.body;

    const expense = await SchoolExpense.findOne({
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
        message: "Expense not found",
      });
    }

    if (expense.status !== "APPROVED") {
      await transaction.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Only approved expenses can be marked as paid",
      });
    }

    const paymentValidationError = validatePaymentDetails({
      paymentMethod,
      referenceNumber,
      paymentDate,
    });

    if (paymentValidationError) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: paymentValidationError,
      });
    }

    const paymentNumber = await generatePaymentNumber(
      franchiseId,
      transaction
    );

    expense.paymentDate = paymentDate;
    expense.paymentMethod = paymentMethod;
    expense.referenceNumber =
      referenceNumber?.trim() || null;
    expense.receiptNumber =
      receiptNumber?.trim() || null;
    expense.paymentNumber = paymentNumber;
    expense.status = "PAID";
    expense.paidBy = paidBy;

    await expense.save({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Expense marked as paid successfully",
      data: expense,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Mark school expense paid error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark expense as paid",
    });
  }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
  try {
    const franchiseId = getFranchiseId(req);
    const { id } = req.params;

    const expense = await SchoolExpense.findOne({
      where: {
        id,
        franchiseId,
      },
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    if (!["PENDING", "REJECTED"].includes(expense.status)) {
      return res.status(409).json({
        success: false,
        message:
          "Approved or paid expenses cannot be deleted",
      });
    }

    await expense.destroy();

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete school expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete expense",
    });
  }
};

// Expense Summary
exports.getExpenseSummary = async (req, res) => {
  try {
    const franchiseId = getFranchiseId(req);

    const expenses = await SchoolExpense.findAll({
      where: {
        franchiseId,
      },
      attributes: ["amount", "status"],
    });

    let totalExpense = 0;
    let paidExpense = 0;
    let pendingExpense = 0;
    let approvedExpense = 0;
    let rejectedExpense = 0;

    for (const expense of expenses) {
      const amount = Number(expense.amount);

      totalExpense += amount;

      switch (expense.status) {
        case "PAID":
          paidExpense += amount;
          break;

        case "PENDING":
          pendingExpense += amount;
          break;

        case "APPROVED":
          approvedExpense += amount;
          break;

        case "REJECTED":
          rejectedExpense += amount;
          break;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        totalExpense,
        paidExpense,
        pendingExpense,
        approvedExpense,
        rejectedExpense,
      },
    });
  } catch (error) {
    console.error("Get expense summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expense summary",
    });
  }
};