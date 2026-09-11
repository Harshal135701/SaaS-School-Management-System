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

    if (!salaryId || !amount || !paymentDate || !paymentMethod) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Salary, amount, payment date and payment method are required",
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

    if (Number(amount) !== Number(salary.netSalary)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Payment amount must match net salary",
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
        amount,
        paymentDate,
        paymentMethod,
        referenceNumber,
        paymentNumber,
        receiptNumber,
        paidBy: req.user.name || "Franchise Admin",
        remarks,
      },
      { transaction }
    );

    await salary.update(
      {
        status: "PAID",
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Salary payment recorded successfully",
      data: payment,
    });
  } catch (error) {
    await transaction.rollback();

    console.error(error);

    res.status(500).json({
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

