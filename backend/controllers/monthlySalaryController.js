const {
  MonthlySalary,
  SalaryProfile,
  SalaryAdvance,
  Teacher,
} = require("../models");

const generateMonthlySalary = async (req, res) => {
  try {
    const { teacherId, salaryMonth } = req.body;

    if (!teacherId || !salaryMonth) {
      return res.status(400).json({
        success: false,
        message: "Teacher and salary month are required",
      });
    }

    const profile = await SalaryProfile.findOne({
      where: {
        teacherId,
        franchiseId: req.user.franchiseId,
        isActive: true,
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Active salary profile not found",
      });
    }

    const existingSalary = await MonthlySalary.findOne({
      where: {
        teacherId,
        franchiseId: req.user.franchiseId,
        salaryMonth,
      },
    });

    if (existingSalary) {
      return res.status(400).json({
        success: false,
        message: "Salary already generated for this month",
      });
    }

    const advances = await SalaryAdvance.findAll({
      where: {
        teacherId,
        franchiseId: req.user.franchiseId,
        status: "ACTIVE",
      },
    });

    let advanceDeduction = 0;

    for (const advance of advances) {
      let recovery = 0;

      if (advance.recoveryType === "FULL") {
        recovery = Number(advance.remainingAmount);
      } else if (advance.recoveryType === "FIXED") {
        recovery = Math.min(
          Number(advance.recoveryValue),
          Number(advance.remainingAmount)
        );
      } else if (advance.recoveryType === "PERCENTAGE") {
        recovery = Math.min(
          (Number(profile.basicSalary) * Number(advance.recoveryValue)) / 100,
          Number(advance.remainingAmount)
        );
      }

      advanceDeduction += recovery;

      const newRemainingAmount =
        Number(advance.remainingAmount) - recovery;

      await advance.update({
        remainingAmount: newRemainingAmount,
        status: newRemainingAmount === 0 ? "COMPLETED" : "ACTIVE",
      });
    }

    const basicSalary = Number(profile.basicSalary);
    const allowances = Number(profile.allowances);
    const deductions = Number(profile.deductions);

    const netSalary =
      basicSalary + allowances - deductions - advanceDeduction;

    const salary = await MonthlySalary.create({
      franchiseId: req.user.franchiseId,
      teacherId,
      salaryProfileId: profile.id,
      salaryMonth,
      basicSalary,
      allowances,
      deductions,
      advanceDeduction,
      netSalary,
    });

    res.status(201).json({
      success: true,
      message: "Monthly salary generated successfully",
      data: salary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate monthly salary",
    });
  }
};

const getMonthlySalaries = async (req, res) => {
  try {
    const salaries = await MonthlySalary.findAll({
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
      order: [["salaryMonth", "DESC"]],
    });

    res.json({
      success: true,
      data: salaries,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch monthly salaries",
    });
  }
};

module.exports = {
  generateMonthlySalary,
  getMonthlySalaries,
};