const {
  Installment,
  StudentFee,
  Student,
  FeeCategory,
  Payment,
} = require("../models");

const createInstallment = async (req, res) => {
  try {
    const {
      studentFeeId,
      installmentNumber,
      amount,
      dueDate,
    } = req.body;

    if (!studentFeeId || !installmentNumber || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "All installment fields are required",
      });
    }

    const installment = await Installment.create({
      franchiseId: req.user.franchiseId,
      studentFeeId,
      installmentNumber,
      amount,
      dueDate,
    });

    res.status(201).json({
      success: true,
      message: "Installment created successfully",
      data: installment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create installment",
    });
  }
};

const getInstallments = async (req, res) => {
  try {
    const installments = await Installment.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
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
      order: [["dueDate", "ASC"]],
    });

    res.json({
      success: true,
      data: installments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch installments",
    });
  }
};

module.exports = { createInstallment,getInstallments };