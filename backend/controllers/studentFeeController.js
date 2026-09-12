const {
  StudentFee,
  Student,
  FeeCategory,
  Installment,
  Payment,
  sequelize,
} = require("../models");

const isValidAmount = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 && Number.isInteger(num * 100);
};

const isValidDiscount = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 && num <= 100;
};

// CREATE STUDENT FEE
const createStudentFee = async (req, res) => {
  try {
    const {
      studentId,
      feeCategoryId,
      originalAmount,
      discountPercent = 0,
      remarks,
    } = req.body;

    const franchiseId = req.user.franchiseId;

    if (!studentId || !feeCategoryId || originalAmount === undefined) {
      return res.status(400).json({
        message: "studentId, feeCategoryId and originalAmount are required",
      });
    }

    if (!isValidAmount(originalAmount)) {
      return res.status(400).json({
        message: "originalAmount must be a valid positive amount with max 2 decimals",
      });
    }

    if (!isValidDiscount(discountPercent)) {
      return res.status(400).json({
        message: "discountPercent must be between 0 and 100",
      });
    }

    const student = await Student.findOne({
      where: {
        id: studentId,
        franchiseId,
      },
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found in this franchise",
      });
    }

    const category = await FeeCategory.findOne({
      where: {
        id: feeCategoryId,
        franchiseId,
        isActive: true,
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Fee category not found in this franchise",
      });
    }

    const original = Number(originalAmount);
    const discount = Number(discountPercent);

    const finalAmount = Number(
      (original - (original * discount) / 100).toFixed(2)
    );

    const studentFee = await StudentFee.create({
      franchiseId,
      studentId,
      feeCategoryId,
      originalAmount: original.toFixed(2),
      discountPercent: discount.toFixed(2),
      finalAmount: finalAmount.toFixed(2),
      remarks,
    });

    return res.status(201).json({
      message: "Student fee created successfully",
      data: studentFee,
    });
  } catch (error) {
    console.error("Create student fee error:", error);

    return res.status(500).json({
      message: "Failed to create student fee",
      error: error.message,
    });
  }
};

// GET STUDENT FEES
const getStudentFees = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;

    const fees = await StudentFee.findAll({
      where: { franchiseId },
      include: [
        {
          model: Student,
          as: "student",
        },
        {
          model: FeeCategory,
          as: "category",
        },
        {
          model: Installment,
          as: "installments",
          include: [
            {
              model: Payment,
              as: "payments",
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Student fees fetched successfully",
      data: fees,
    });
  } catch (error) {
    console.error("Get student fees error:", error);

    return res.status(500).json({
      message: "Failed to fetch student fees",
      error: error.message,
    });
  }
};

// GET FEE SUMMARY
const getFeeSummary = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;

    const fees = await StudentFee.findAll({
      where: { franchiseId },
      include: [
        {
          model: Installment,
          as: "installments",
          include: [
            {
              model: Payment,
              as: "payments",
            },
          ],
        },
      ],
    });

    let totalOriginal = 0;
    let totalDiscount = 0;
    let totalPayable = 0;
    let totalPaid = 0;

    fees.forEach((fee) => {
      const original = Number(fee.originalAmount);
      const finalAmount = Number(fee.finalAmount);

      totalOriginal += original;
      totalDiscount += original - finalAmount;
      totalPayable += finalAmount;

      fee.installments?.forEach((installment) => {
        installment.payments?.forEach((payment) => {
          totalPaid += Number(payment.amount);
        });
      });
    });

    totalOriginal = Number(totalOriginal.toFixed(2));
    totalDiscount = Number(totalDiscount.toFixed(2));
    totalPayable = Number(totalPayable.toFixed(2));
    totalPaid = Number(totalPaid.toFixed(2));

    return res.status(200).json({
      message: "Fee summary fetched successfully",
      data: {
        totalOriginal,
        totalDiscount,
        totalPayable,
        totalPaid,
        totalPending: Number(
          Math.max(totalPayable - totalPaid, 0).toFixed(2)
        ),
      },
    });
  } catch (error) {
    console.error("Get fee summary error:", error);

    return res.status(500).json({
      message: "Failed to fetch fee summary",
      error: error.message,
    });
  }
};

// UPDATE STUDENT FEE

const updateStudentFee = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { originalAmount, discountPercent = 0, remarks } = req.body;
    const franchiseId = req.user.franchiseId;

    const studentFee = await StudentFee.findOne({
      where: { id, franchiseId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!studentFee) {
      await transaction.rollback();
      return res.status(404).json({ message: "Student fee not found" });
    }

    if (originalAmount !== undefined && !isValidAmount(originalAmount)) {
      await transaction.rollback();
      return res.status(400).json({
        message:
          "originalAmount must be a valid positive amount with max 2 decimals",
      });
    }

    if (!isValidDiscount(discountPercent)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "discountPercent must be between 0 and 100",
      });
    }

    const original =
      originalAmount !== undefined
        ? Number(originalAmount)
        : Number(studentFee.originalAmount);

    const discount = Number(discountPercent);

    const finalAmount = Number(
      (original - (original * discount) / 100).toFixed(2)
    );

    // Check existing installments
    const installments = await Installment.findAll({
      where: {
        studentFeeId: studentFee.id,
        franchiseId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const installmentTotal = Number(
      installments
        .reduce((sum, item) => sum + Number(item.amount), 0)
        .toFixed(2)
    );

    if (finalAmount < installmentTotal) {
      await transaction.rollback();

      return res.status(400).json({
        message: `Cannot reduce fee below existing installment total (${installmentTotal.toFixed(
          2
        )})`,
      });
    }

    // Check already-paid amount
    const paidResult = await Payment.sum("amount", {
      where: { franchiseId },
      include: [
        {
          model: Installment,
          as: "installment",
          where: { studentFeeId: studentFee.id },
          required: true,
        },
      ],
      transaction,
    });

    const totalPaid = Number(paidResult || 0);

    if (finalAmount < totalPaid) {
      await transaction.rollback();

      return res.status(400).json({
        message: `Cannot reduce fee below already paid amount (${totalPaid.toFixed(
          2
        )})`,
      });
    }

    await studentFee.update(
      {
        originalAmount: original.toFixed(2),
        discountPercent: discount.toFixed(2),
        finalAmount: finalAmount.toFixed(2),
        remarks,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      message: "Student fee updated successfully",
      data: studentFee,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Update student fee error:", error);

    return res.status(500).json({
      message: "Failed to update student fee",
      error: error.message,
    });
  }
};



// DELETE STUDENT FEE
const deleteStudentFee = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;

    const studentFee = await StudentFee.findOne({
      where: {
        id,
        franchiseId,
      },
      include: [
        {
          model: Installment,
          as: "installments",
          include: [
            {
              model: Payment,
              as: "payments",
            },
          ],
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!studentFee) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Student fee not found",
      });
    }

    const hasPayments = studentFee.installments?.some(
      (installment) => installment.payments?.length > 0
    );

    if (hasPayments) {
      await transaction.rollback();

      return res.status(400).json({
        message:
          "Cannot delete a fee that has payment history. Void/reversal should be used instead.",
      });
    }

    await studentFee.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({
      message: "Student fee deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Delete student fee error:", error);

    return res.status(500).json({
      message: "Failed to delete student fee",
      error: error.message,
    });
  }
};

module.exports = {
  createStudentFee,
  getStudentFees,
  getFeeSummary,
  updateStudentFee,
  deleteStudentFee,
};