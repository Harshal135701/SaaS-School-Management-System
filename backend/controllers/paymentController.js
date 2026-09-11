const {
  Payment,
  Installment,
  StudentFee,
  Student,
  sequelize,
  FeeCategory,
} = require("../models");

const createPayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      studentId,
      installmentId,
      amount,
      paymentMethod,
      receiptNumber,
      receivedBy,
      remarks,
    } = req.body;

    // Validate required fields
    if (
      !studentId ||
      !installmentId ||
      !amount ||
      !paymentMethod ||
      !receiptNumber ||
      !receivedBy
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Required payment fields are missing",
      });
    }

    // Validate payment amount
    if (Number(amount) <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than 0",
      });
    }

    const franchiseId = req.user.franchiseId;

    // Lock reference generation for this franchise
    await sequelize.query(
      `SELECT pg_advisory_xact_lock(hashtext(:franchiseId))`,
      {
        replacements: { franchiseId },
        transaction,
      }
    );

    // Find last payment for this franchise
    const lastPayment = await Payment.findOne({
      where: { franchiseId },
      order: [["createdAt", "DESC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    // Generate next reference number
    let nextNumber = 1;

    if (lastPayment?.referenceNumber) {
      const match = lastPayment.referenceNumber.match(/\d+$/);

      if (match) {
        nextNumber = Number(match[0]) + 1;
      }
    }

    const referenceNumber = `REF-${String(nextNumber).padStart(3, "0")}`;

    // Validate installment + student
    const installment = await Installment.findOne({
      where: {
        id: installmentId,
        franchiseId,
      },
      include: [
        {
          model: StudentFee,
          as: "studentFee",
          where: { studentId },
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!installment) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Invalid installment or student",
      });
    }

    // Calculate total already paid
    const totalPaid = await Payment.sum("amount", {
      where: { installmentId },
      transaction,
    });

    // Calculate remaining amount
    const remainingAmount =
      Number(installment.amount) - Number(totalPaid || 0);

    // Prevent overpayment
    if (Number(amount) > remainingAmount) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: `Payment exceeds remaining amount: ${remainingAmount}`,
      });
    }

    // Create payment
    const payment = await Payment.create(
      {
        franchiseId,
        studentId,
        installmentId,
        amount,
        paymentMethod,
        referenceNumber,
        receiptNumber,
        receivedBy,
        remarks,
      },
      { transaction }
    );

    // Calculate new total paid
    const newTotalPaid =
      Number(totalPaid || 0) + Number(amount);

    // Update installment status
    if (newTotalPaid >= Number(installment.amount)) {
      installment.status = "PAID";
    } else if (newTotalPaid > 0) {
      installment.status = "PARTIAL";
    }

    await installment.save({ transaction });

    // Commit transaction
    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Create payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to record payment",
    });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      include: [
        {
          model: Student,
          as: "student",
        },
        {
          model: Installment,
          as: "installment",
          include: [
            {
              model: StudentFee,
              as: "studentFee",
              include: [
                {
                  model: FeeCategory,
                  as: "category",
                },
              ],
            },
          ],
        },
      ],
      order: [["paymentDate", "DESC"]],
    });

    return res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error("Get payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};

const deletePayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Find payment belonging to current franchise
    const payment = await Payment.findOne({
      where: {
        id,
        franchiseId: req.user.franchiseId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!payment) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Find related installment
    const installment = await Installment.findByPk(
      payment.installmentId,
      {
        transaction,
        lock: transaction.LOCK.UPDATE,
      }
    );

    if (!installment) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Installment not found",
      });
    }

    // Delete payment
    await payment.destroy({ transaction });

    // Recalculate total paid
    const totalPaid = await Payment.sum("amount", {
      where: {
        installmentId: payment.installmentId,
      },
      transaction,
    });

    const paid = Number(totalPaid || 0);

    // Recalculate installment status
    if (paid === 0) {
      installment.status = "PENDING";
    } else if (paid >= Number(installment.amount)) {
      installment.status = "PAID";
    } else {
      installment.status = "PARTIAL";
    }

    await installment.save({ transaction });

    // Commit transaction
    await transaction.commit();

    return res.json({
      success: true,
      message: "Payment deleted and installment status updated",
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Delete payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete payment",
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
  deletePayment,
};

