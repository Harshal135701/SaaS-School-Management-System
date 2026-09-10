const { SalaryAdvance, Teacher } = require("../models");

const createSalaryAdvance = async (req, res) => {
  try {
    const {
      teacherId,
      amount,
      recoveryType,
      recoveryValue,
      startMonth,
      remarks,
    } = req.body;

    if (
      !teacherId ||
      !amount ||
      !recoveryType ||
      !recoveryValue ||
      !startMonth
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const teacher = await Teacher.findOne({
      where: {
        id: teacherId,
        franchiseId: req.user.franchiseId,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const advance = await SalaryAdvance.create({
      franchiseId: req.user.franchiseId,
      teacherId,
      amount,
      remainingAmount: amount,
      recoveryType,
      recoveryValue,
      startMonth,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: "Salary advance created successfully",
      data: advance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create salary advance",
    });
  }
};

const getSalaryAdvances = async (req, res) => {
  try {
    const advances = await SalaryAdvance.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      include: [
        {
          model: Teacher,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: advances,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch salary advances",
    });
  }
};


module.exports = {
  createSalaryAdvance,
  getSalaryAdvances
};