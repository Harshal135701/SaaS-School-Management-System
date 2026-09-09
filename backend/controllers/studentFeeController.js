const {
  StudentFee,
  Student,
  FeeCategory,
  Installment,
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

module.exports = { createStudentFee, getStudentFees };