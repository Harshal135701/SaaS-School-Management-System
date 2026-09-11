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

    const studentFee = await StudentFee.findOne({
      where: {
        id: studentFeeId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!studentFee) {
      return res.status(404).json({
        success: false,
        message: "Student fee not found",
      });
    }

    const existingInstallments = await Installment.findAll({
      where: {
        studentFeeId,
        franchiseId: req.user.franchiseId,
      },
      attributes: ["amount"],
    });

    const existingTotal = existingInstallments.reduce(
      (sum, installment) => sum + Number(installment.amount || 0),
      0
    );

    const newAmount = Number(amount);
    const finalAmount = Number(studentFee.finalAmount);

    if (existingTotal + newAmount > finalAmount) {
      return res.status(400).json({
        success: false,
        message: `Installment amount exceeds remaining fee. Remaining amount: ₹${Math.max(
          finalAmount - existingTotal,
          0
        )}`,
      });
    }

    const installment = await Installment.create({
      franchiseId: req.user.franchiseId,
      studentFeeId,
      installmentNumber,
      amount: newAmount,
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

    if (amount !== undefined) {
      const studentFee = await StudentFee.findOne({
        where: {
          id: installment.studentFeeId,
          franchiseId: req.user.franchiseId,
        },
      });

      if (!studentFee) {
        return res.status(404).json({
          success: false,
          message: "Student fee not found",
        });
      }

      const otherInstallments = await Installment.findAll({
        where: {
          studentFeeId: installment.studentFeeId,
          franchiseId: req.user.franchiseId,
        },
        attributes: ["id", "amount"],
      });

      const otherTotal = otherInstallments.reduce(
        (sum, item) =>
          item.id === installment.id
            ? sum
            : sum + Number(item.amount || 0),
        0
      );

      const newAmount = Number(amount);
      const finalAmount = Number(studentFee.finalAmount);

      if (otherTotal + newAmount > finalAmount) {
        return res.status(400).json({
          success: false,
          message: `Installment amount exceeds remaining fee. Remaining amount: ₹${Math.max(
            finalAmount - otherTotal,
            0
          )}`,
        });
      }

      installment.amount = newAmount;
    }

    if (dueDate !== undefined) {
      installment.dueDate = dueDate;
    }

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