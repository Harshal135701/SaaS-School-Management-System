const { MonthlySalary, SalaryAdvance } = require("../models");

const getPayrollDashboard = async (req, res) => {
  try {
    const salaries = await MonthlySalary.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
    });

    const advances = await SalaryAdvance.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
    });

    const totalPayroll = salaries.reduce(
      (sum, salary) => sum + Number(salary.netSalary),
      0
    );

    const paidPayroll = salaries
      .filter((salary) => salary.status === "PAID")
      .reduce((sum, salary) => sum + Number(salary.netSalary), 0);

    const pendingPayroll = salaries
      .filter((salary) => salary.status === "PENDING")
      .reduce((sum, salary) => sum + Number(salary.netSalary), 0);

    const totalAdvances = advances.reduce(
      (sum, advance) => sum + Number(advance.amount),
      0
    );

    const monthlySummary = {};

    salaries.forEach((salary) => {
      const month = salary.salaryMonth.slice(0, 7);

      monthlySummary[month] =
        (monthlySummary[month] || 0) + Number(salary.netSalary);
    });

    res.json({
      success: true,
      data: {
        totalPayroll,
        paidPayroll,
        pendingPayroll,
        monthlySummary,
        totalAdvances,
        totalSalaries: salaries.length,
        totalAdvancesCount: advances.length,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch payroll dashboard",
    });
  }
};

module.exports = {
  getPayrollDashboard,
};