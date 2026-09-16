const {
  MonthlySalary,
  SalaryProfile,
  SalaryAdvance,
  Teacher,
  sequelize,
} = require("../models");

const generateMonthlySalary = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { teacherId, salaryMonth } = req.body;

    if (!teacherId || !salaryMonth) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Teacher and salary month are required",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(salaryMonth)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid salary month. Use YYYY-MM-DD format",
      });
    }

    const teacher = await Teacher.findOne({
      where: {
        id: teacherId,
        franchiseId: req.user.franchiseId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!teacher) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    if (teacher.status !== "ACTIVE") {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Cannot generate salary for an inactive teacher",
      });
    }

    const profile = await SalaryProfile.findOne({
      where: {
        teacherId,
        franchiseId: req.user.franchiseId,
        isActive: true,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!profile) {
      await transaction.rollback();

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
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existingSalary) {
      await transaction.rollback();

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
        startMonth: {
          [require("sequelize").Op.lte]: salaryMonth,
        },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
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
          (Number(profile.basicSalary) *
            Number(advance.recoveryValue)) /
            100,
          Number(advance.remainingAmount)
        );
      }

      advanceDeduction += recovery;

      const newRemainingAmount =
        Number(advance.remainingAmount) - recovery;

      await advance.update(
        {
          remainingAmount: newRemainingAmount,
          status:
            newRemainingAmount <= 0
              ? "COMPLETED"
              : "ACTIVE",
        },
        { transaction }
      );
    }

    const basicSalary = Number(profile.basicSalary);
    const allowances = Number(profile.allowances);
    const deductions = Number(profile.deductions);

    const grossSalary = basicSalary + allowances;

    const netSalary =
      grossSalary -
      deductions -
      advanceDeduction;

    if (netSalary < 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Salary cannot be negative after deductions",
      });
    }

    const salary = await MonthlySalary.create(
      {
        franchiseId: req.user.franchiseId,
        teacherId,
        salaryProfileId: profile.id,
        salaryMonth,
        basicSalary,
        allowances,
        deductions,
        advanceDeduction,
        netSalary,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Monthly salary generated successfully",
      data: salary,
    });
  } catch (error) {
    await transaction.rollback();

    console.error(error);

    return res.status(500).json({
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

