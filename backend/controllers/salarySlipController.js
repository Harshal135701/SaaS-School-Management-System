const {
  MonthlySalary,
  SalaryPayment,
  Teacher,
} = require("../models");

const getSalarySlip = async (req, res) => {
  try {
    const { salaryId } = req.params;

    const salary = await MonthlySalary.findOne({
      where: {
        id: salaryId,
        franchiseId: req.user.franchiseId,
      },
      include: [
        {
          model: Teacher,
          as: "teacher",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: SalaryPayment,
          as: "payment",
        },
      ],
    });

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found",
      });
    }

    res.json({
      success: true,
      data: salary,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to generate salary slip",
    });
  }
};

module.exports = {
  getSalarySlip,
};