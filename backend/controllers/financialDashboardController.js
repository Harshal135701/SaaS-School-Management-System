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
          attributes: [
            "id",
            "originalAmount",
            "discountPercent",
            "finalAmount",
          ],

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
                  attributes: [
                    "amount",
                    "paymentDate",
                    "paymentMethod",
                    "referenceNumber",
                    "receiptNumber",
                  ],
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
    let totalPending = 0;
    let totalOverdue = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const studentWise = students.map((student) => {
      let totalFee = 0;
      let paid = 0;
      let studentPending = 0;
      let studentOverdue = 0;

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

            const installmentPending = Number(
              Math.max(
                installmentAmount - installmentPaid,
                0
              ).toFixed(2)
            );

            paid += installmentPaid;
            studentPending += installmentPending;

            const dueDate = new Date(installment.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            const isOverdue =
              installmentPending > 0 && dueDate < today;

            if (isOverdue) {
              studentOverdue += installmentPending;
              totalOverdue += installmentPending;
            }

            if (installmentPending > 0) {
              pendingInstallments.push({
                installmentId: installment.id,
                installmentNumber:
                  installment.installmentNumber,
                amount: installmentAmount,
                paid: Number(installmentPaid.toFixed(2)),
                pending: installmentPending,
                dueDate: installment.dueDate,
                status: isOverdue
                  ? "OVERDUE"
                  : installment.status,
              });
            }

            return {
              installmentId: installment.id,
              installmentNumber:
                installment.installmentNumber,
              amount: installmentAmount,
              paid: Number(installmentPaid.toFixed(2)),
              pending: installmentPending,
              dueDate: installment.dueDate,
              status: isOverdue
                ? "OVERDUE"
                : installment.status,
            };
          }) || [];

        feeBreakdown.push({
          feeId: fee.id,
          category: fee.category?.name || "Other",

          originalAmount: Number(
            fee.originalAmount || 0
          ),

          discountPercent: Number(
            fee.discountPercent || 0
          ),

          finalAmount,

          installments,
        });
      });

      const studentPaid = Number(paid.toFixed(2));

      totalExpectedRevenue += totalFee;
      totalCollected += studentPaid;
      totalPending += studentPending;

      pendingInstallments.sort(
        (a, b) =>
          new Date(a.dueDate) - new Date(b.dueDate)
      );

      return {
        studentId: student.id,
        studentName: student.name,

        totalFee: Number(totalFee.toFixed(2)),
        paid: studentPaid,

        pending: Number(
          studentPending.toFixed(2)
        ),

        overdue: Number(
          studentOverdue.toFixed(2)
        ),

        nextDueDate:
          pendingInstallments.length > 0
            ? pendingInstallments[0].dueDate
            : null,

        feeBreakdown,

        pendingInstallments,
      };
    });

    totalExpectedRevenue = Number(
      totalExpectedRevenue.toFixed(2)
    );

    totalCollected = Number(
      totalCollected.toFixed(2)
    );

    totalPending = Number(
      totalPending.toFixed(2)
    );

    totalOverdue = Number(
      totalOverdue.toFixed(2)
    );

    return res.status(200).json({
      success: true,

      data: {
        summary: {
          totalExpectedRevenue,
          totalCollected,
          pending: totalPending,
          overdue: totalOverdue,
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

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch financial dashboard",
    });
  }
};

module.exports = {
  getFinancialDashboard,
};

