const {
  SalaryPayment,
  MonthlySalary,
  sequelize,
} = require("../models");

const createSalaryPayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      salaryId,
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      remarks,
    } = req.body;

    if (!salaryId || amount == null || !paymentDate || !paymentMethod) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Salary, amount, payment date and payment method are required",
      });
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than 0",
      });
    }

    if (
      !["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"].includes(
        paymentMethod
      )
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid payment date. Use YYYY-MM-DD format",
      });
    }

    if (
      ["UPI", "BANK_TRANSFER", "CHEQUE"].includes(paymentMethod) &&
      !referenceNumber?.trim()
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Reference number is required for this payment method",
      });
    }

    const salary = await MonthlySalary.findOne({
      where: {
        id: salaryId,
        franchiseId: req.user.franchiseId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!salary) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Monthly salary not found",
      });
    }

    if (salary.status === "PAID") {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Salary is already paid",
      });
    }

    if (paymentAmount !== Number(salary.netSalary)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Payment amount must match net salary",
      });
    }

    const existingPayment = await SalaryPayment.findOne({
      where: {
        salaryId,
        franchiseId: req.user.franchiseId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existingPayment) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Payment already exists for this salary",
      });
    }

    const year = new Date().getFullYear();
    const timestamp = Date.now();

    const paymentNumber = `PAY-${year}-${timestamp}`;
    const receiptNumber = `SAL-${year}-${timestamp}`;

    const payment = await SalaryPayment.create(
      {
        franchiseId: req.user.franchiseId,
        salaryId,
        teacherId: salary.teacherId,
        amount: paymentAmount,
        paymentDate,
        paymentMethod,
        referenceNumber: referenceNumber?.trim() || null,
        paymentNumber,
        receiptNumber,
        paidBy: req.user.name || "Franchise Admin",
        remarks: remarks?.trim() || null,
      },
      { transaction }
    );

    await salary.update(
      { status: "PAID" },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Salary payment recorded successfully",
      data: payment,
    });
  } catch (error) {
    await transaction.rollback();

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to record salary payment",
    });
  }
};

const getSalaryPayments = async (req, res) => {
  try {
    const payments = await SalaryPayment.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      include: [
        {
          model: MonthlySalary,
          as: "salary",
        },
      ],
      order: [["paymentDate", "DESC"]],
    });

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch salary payments",
    });
  }
};

module.exports = {
  createSalaryPayment,
  getSalaryPayments,
};

