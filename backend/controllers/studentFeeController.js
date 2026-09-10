const {
  StudentFee,
  Student,
  FeeCategory,
  Installment,
  Payment,
} = require("../models");

const createStudentFee = async (req, res) => {
  try {
    const {
      studentId,
      feeCategoryId,
      originalAmount,
      discountPercent = 0,
      remarks,
    } = req.body;

    if (!studentId || !feeCategoryId || !originalAmount) {
      return res.status(400).json({
        success: false,
        message: "studentId, feeCategoryId and originalAmount are required",
      });
    }

    if (discountPercent < 0 || discountPercent > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount must be between 0 and 100",
      });
    }

    const finalAmount =
      Number(originalAmount) -
      (Number(originalAmount) * Number(discountPercent)) / 100;

    const studentFee = await StudentFee.create({
      franchiseId: req.user.franchiseId,
      studentId,
      feeCategoryId,
      originalAmount,
      discountPercent,
      finalAmount,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: "Fee assigned successfully",
      data: studentFee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to assign fee",
    });
  }
};

const getStudentFees = async (req, res) => {
  try {
    const fees = await StudentFee.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
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

    res.json({
      success: true,
      data: fees,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student fees",
    });
  }
};

const getFeeSummary = async (req, res) => {
  try {
    const fees = await StudentFee.findAll({
      where: {
        franchiseId: req.user.franchiseId,
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
    });

    let totalFee = 0;
    let discount = 0;
    let payable = 0;
    let paid = 0;

    fees.forEach((fee) => {
      totalFee += Number(fee.originalAmount);
      discount +=
        Number(fee.originalAmount) -
        Number(fee.finalAmount);
      payable += Number(fee.finalAmount);

      fee.installments?.forEach((installment) => {
        installment.payments?.forEach((payment) => {
          paid += Number(payment.amount);
        });
      });
    });

    res.json({
      success: true,
      data: {
        totalFee,
        discount,
        payable,
        paid,
        pending: payable - paid,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch fee summary",
    });
  }
};

const updateStudentFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { originalAmount, discountPercent, remarks } = req.body;

    const fee = await StudentFee.findOne({
      where: {
        id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Student fee not found",
      });
    }

    const amount =
      originalAmount !== undefined
        ? Number(originalAmount)
        : Number(fee.originalAmount);

    const discount =
      discountPercent !== undefined
        ? Number(discountPercent)
        : Number(fee.discountPercent);

    if (discount < 0 || discount > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount must be between 0 and 100",
      });
    }

    fee.originalAmount = amount;
    fee.discountPercent = discount;
    fee.finalAmount = amount - (amount * discount) / 100;

    if (remarks !== undefined) fee.remarks = remarks;

    await fee.save();

    res.json({
      success: true,
      message: "Student fee updated successfully",
      data: fee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update student fee",
    });
  }
};

const deleteStudentFee = async (req, res) => {
  try {
    const { id } = req.params;

    const fee = await StudentFee.findOne({
      where: {
        id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Student fee not found",
      });
    }

    await fee.destroy();

    res.json({
      success: true,
      message: "Student fee deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete student fee",
    });
  }
};

module.exports = {
  createStudentFee, getStudentFees, getFeeSummary, updateStudentFee,
  deleteStudentFee,
};