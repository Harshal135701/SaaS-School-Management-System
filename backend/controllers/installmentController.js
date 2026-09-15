const {
  Installment,
  StudentFee,
  Payment,
  Student,
  FeeCategory,
  sequelize,
} = require("../models");

const isValidAmount = (value) => {
  const num = Number(value);
  return (
    Number.isFinite(num) &&
    num > 0 &&
    Number.isInteger(num * 100)
  );
};

const isValidInstallmentNumber = (value) => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
};

const isValidDate = (value) => {
  if (!value) return false;

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
};

// CREATE
const createInstallment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      studentFeeId,
      installmentNumber,
      amount,
      dueDate,
    } = req.body;

    const franchiseId = req.user.franchiseId;

    if (
      !studentFeeId ||
      installmentNumber === undefined ||
      amount === undefined ||
      !dueDate
    ) {
      await transaction.rollback();

      return res.status(400).json({
        message:
          "studentFeeId, installmentNumber, amount and dueDate are required",
      });
    }

    if (!isValidInstallmentNumber(installmentNumber)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "installmentNumber must be a positive integer",
      });
    }

    if (!isValidAmount(amount)) {
      await transaction.rollback();

      return res.status(400).json({
        message:
          "amount must be a valid positive amount with max 2 decimals",
      });
    }

    if (!isValidDate(dueDate)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "Invalid dueDate",
      });
    }

    const studentFee = await StudentFee.findOne({
      where: {
        id: studentFeeId,
        franchiseId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!studentFee) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Student fee not found in this franchise",
      });
    }

    const existingInstallment = await Installment.findOne({
      where: {
        studentFeeId,
        installmentNumber,
        franchiseId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existingInstallment) {
      await transaction.rollback();

      return res.status(409).json({
        message: "This installment number already exists for this fee",
      });
    }

    const existingInstallments = await Installment.findAll({
      where: {
        studentFeeId,
        franchiseId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const existingTotal = existingInstallments.reduce(
      (sum, installment) => sum + Number(installment.amount),
      0
    );

    const newAmount = Number(amount);
    const finalAmount = Number(studentFee.finalAmount);

    if (existingTotal + newAmount > finalAmount + 0.001) {
      await transaction.rollback();

      return res.status(400).json({
        message: `Installment total cannot exceed fee payable amount (${finalAmount.toFixed(
          2
        )})`,
      });
    }

    const installment = await Installment.create(
      {
        franchiseId,
        studentFeeId,
        installmentNumber: Number(installmentNumber),
        amount: newAmount.toFixed(2),
        dueDate,
        status: "PENDING",
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      message: "Installment created successfully",
      data: installment,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Create installment error:", error);

    return res.status(500).json({
      message: "Failed to create installment",
      error: error.message,
    });
  }
};

// GET
const getInstallments = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;

    const installments = await Installment.findAll({
      where: { franchiseId },

      include: [
        {
          model: StudentFee,
          as: "studentFee",
          include: [
            {
              model: Student,
              as: "student",
            },
            {
              model: FeeCategory,
              as: "category",
            },
          ],
        },
        {
          model: Payment,
          as: "payments",
        },
      ],

      order: [
        ["dueDate", "ASC"],
        ["installmentNumber", "ASC"],
      ],
    });

    // Automatically mark unpaid overdue installments
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const installment of installments) {
      if (installment.status === "PAID") {
        continue;
      }

      const dueDate = new Date(installment.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        if (installment.status !== "OVERDUE") {
          await installment.update({
            status: "OVERDUE",
          });
        }
      }
    }

    return res.status(200).json({
      message: "Installments fetched successfully",
      data: installments,
    });
  } catch (error) {
    console.error("Get installments error:", error);

    return res.status(500).json({
      message: "Failed to fetch installments",
      error: error.message,
    });
  }
};

// UPDATE
const updateInstallment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { amount, dueDate } = req.body;
    const franchiseId = req.user.franchiseId;

    const installment = await Installment.findOne({
      where: {
        id,
        franchiseId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!installment) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Installment not found",
      });
    }

    if (amount !== undefined && !isValidAmount(amount)) {
      await transaction.rollback();

      return res.status(400).json({
        message:
          "amount must be a valid positive amount with max 2 decimals",
      });
    }

    if (dueDate !== undefined && !isValidDate(dueDate)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "Invalid dueDate",
      });
    }

    const studentFee = await StudentFee.findOne({
      where: {
        id: installment.studentFeeId,
        franchiseId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!studentFee) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Related student fee not found",
      });
    }

    const paidResult = await Payment.sum("amount", {
      where: {
        installmentId: installment.id,
        franchiseId,
      },
      transaction,
    });

    const totalPaid = Number(paidResult || 0);

    const newAmount =
      amount !== undefined
        ? Number(amount)
        : Number(installment.amount);

    if (newAmount < totalPaid) {
      await transaction.rollback();

      return res.status(400).json({
        message: `Installment amount cannot be less than already paid amount (${totalPaid.toFixed(
          2
        )})`,
      });
    }

    const otherInstallments = await Installment.findAll({
      where: {
        studentFeeId: installment.studentFeeId,
        franchiseId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const otherTotal = otherInstallments.reduce((sum, item) => {
      if (item.id === installment.id) return sum;

      return sum + Number(item.amount);
    }, 0);

    if (
      otherTotal + newAmount >
      Number(studentFee.finalAmount) + 0.001
    ) {
      await transaction.rollback();

      return res.status(400).json({
        message: `Installment total cannot exceed fee payable amount (${Number(
          studentFee.finalAmount
        ).toFixed(2)})`,
      });
    }

    const updateData = {};

    if (amount !== undefined) {
      updateData.amount = newAmount.toFixed(2);
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate;
    }

    await installment.update(updateData, {
      transaction,
    });

    await transaction.commit();

    return res.status(200).json({
      message: "Installment updated successfully",
      data: installment,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Update installment error:", error);

    return res.status(500).json({
      message: "Failed to update installment",
      error: error.message,
    });
  }
};

// DELETE
const deleteInstallment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;

    const installment = await Installment.findOne({
      where: {
        id,
        franchiseId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!installment) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Installment not found",
      });
    }

    const paymentCount = await Payment.count({
      where: {
        installmentId: installment.id,
        franchiseId,
      },
      transaction,
    });

    if (paymentCount > 0) {
      await transaction.rollback();

      return res.status(400).json({
        message:
          "Cannot delete an installment that has payment history.",
      });
    }

    await installment.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({
      message: "Installment deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Delete installment error:", error);

    return res.status(500).json({
      message: "Failed to delete installment",
      error: error.message,
    });
  }
};

module.exports = {
  createInstallment,
  getInstallments,
  updateInstallment,
  deleteInstallment,
};

