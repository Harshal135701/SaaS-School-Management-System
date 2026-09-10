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

const updateInstallment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, dueDate } = req.body;

    const installment = await Installment.findOne({
      where: {
        id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!installment) {
      return res.status(404).json({
        success: false,
        message: "Installment not found",
      });
    }

    if (amount !== undefined) installment.amount = amount;
    if (dueDate !== undefined) installment.dueDate = dueDate;

    await installment.save();

    res.json({
      success: true,
      message: "Installment updated successfully",
      data: installment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update installment",
    });
  }
};

const deleteInstallment = async (req, res) => {
  try {
    const { id } = req.params;

    const installment = await Installment.findOne({
      where: {
        id,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!installment) {
      return res.status(404).json({
        success: false,
        message: "Installment not found",
      });
    }

    await installment.destroy();

    res.json({
      success: true,
      message: "Installment deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete installment",
    });
  }
};

module.exports = { createInstallment,getInstallments,updateInstallment,
deleteInstallment, };