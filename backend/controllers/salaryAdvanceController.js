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
      amount == null ||
      !recoveryType ||
      recoveryValue == null ||
      !startMonth
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const advanceAmount = Number(amount);
    const recovery = Number(recoveryValue);

    if (!Number.isFinite(advanceAmount) || advanceAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Advance amount must be greater than 0",
      });
    }

    if (!Number.isFinite(recovery) || recovery <= 0) {
      return res.status(400).json({
        success: false,
        message: "Recovery value must be greater than 0",
      });
    }

    if (!["FULL", "FIXED", "PERCENTAGE"].includes(recoveryType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recovery type",
      });
    }

    if (recoveryType === "PERCENTAGE" && recovery > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage recovery cannot exceed 100",
      });
    }

    if (
      recoveryType === "FIXED" &&
      recovery > advanceAmount
    ) {
      return res.status(400).json({
        success: false,
        message: "Fixed recovery cannot exceed advance amount",
      });
    }

    if (recoveryType === "FULL" && recovery !== 1) {
      return res.status(400).json({
        success: false,
        message: "FULL recovery must use recoveryValue 1",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(startMonth)) {
      return res.status(400).json({
        success: false,
        message: "Invalid start month. Use YYYY-MM-DD format",
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

    if (teacher.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Cannot create salary advance for an inactive teacher",
      });
    }

    const advance = await SalaryAdvance.create({
      franchiseId: req.user.franchiseId,
      teacherId,
      amount: advanceAmount,
      remainingAmount: advanceAmount,
      recoveryType,
      recoveryValue: recovery,
      startMonth,
      remarks: remarks?.trim() || null,
    });

    return res.status(201).json({
      success: true,
      message: "Salary advance created successfully",
      data: advance,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
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