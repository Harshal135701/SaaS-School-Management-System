const {
  Student,
  StudentFee,
  FeeCategory,
  Installment,
  Payment,
} = require("../models");

const getFinancialDashboard = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;

    const students = await Student.findAll({
      where: { franchiseId },
      attributes: ["id", "name"],
      include: [
        {
          model: StudentFee,
          as: "studentFees",
          attributes: ["id", "originalAmount", "finalAmount"],
          include: [
            {
              model: FeeCategory,
              as: "category",
              attributes: ["id", "name"],
            },
            {
              model: Installment,
              as: "installments",
              attributes: [
                "id",
                "installmentNumber",
                "amount",
                "dueDate",
                "status",
              ],
              include: [
                {
                  model: Payment,
                  as: "payments",
                  attributes: ["amount", "paymentDate"],
                },
              ],
            },
          ],
        },
      ],
      order: [["name", "ASC"]],
    });

    let totalExpectedRevenue = 0;
    let totalCollected = 0;

    const studentWise = students.map((student) => {
      let totalFee = 0;
      let paid = 0;

      const pendingInstallments = [];
      const feeBreakdown = [];

      student.studentFees?.forEach((fee) => {
        const finalAmount = Number(fee.finalAmount || 0);

        totalFee += finalAmount;

        const installments =
          fee.installments?.map((installment) => {
            const installmentAmount = Number(
              installment.amount || 0
            );

            const installmentPaid =
              installment.payments?.reduce(
                (sum, payment) =>
                  sum + Number(payment.amount || 0),
                0
              ) || 0;

            paid += installmentPaid;

            if (installmentPaid < installmentAmount) {
              pendingInstallments.push(installment);
            }

            return {
              installmentId: installment.id,
              installmentNumber: installment.installmentNumber,
              amount: installmentAmount,
              paid: installmentPaid,
              pending: Math.max(
                installmentAmount - installmentPaid,
                0
              ),
              dueDate: installment.dueDate,
              status: installment.status,
            };
          }) || [];

        feeBreakdown.push({
          feeId: fee.id,
          category: fee.category?.name || "Other",
          originalAmount: Number(fee.originalAmount || 0),
          finalAmount,
          discountPercent:
            Number(fee.originalAmount || 0) > 0
              ? Number(
                  (
                    ((Number(fee.originalAmount) - finalAmount) /
                      Number(fee.originalAmount)) *
                    100
                  ).toFixed(2)
                )
              : 0,
          installments,
        });
      });

      totalExpectedRevenue += totalFee;
      totalCollected += paid;

      pendingInstallments.sort(
        (a, b) =>
          new Date(a.dueDate) - new Date(b.dueDate)
      );

      return {
        studentId: student.id,
        studentName: student.name,
        totalFee,
        paid,
        pending: Math.max(totalFee - paid, 0),
        nextDueDate:
          pendingInstallments.length > 0
            ? pendingInstallments[0].dueDate
            : null,
        feeBreakdown,
      };
    });

    const pending = Math.max(
      totalExpectedRevenue - totalCollected,
      0
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalExpectedRevenue,
          totalCollected,
          pending,
          netRevenue: totalCollected,
        },
        students: studentWise,
      },
    });
  } catch (error) {
    console.error(
      "Financial dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch financial dashboard",
    });
  }
};

module.exports = {
  getFinancialDashboard,
};





