const {
    Teacher,
    MonthlySalary,
    SalaryPayment,
    SalaryAdvance,
} = require("../models");

const getTeacherExpenseDashboard = async (req, res) => {
    try {
        const franchiseId = req.user.franchiseId;
        const { month } = req.query;

        // Validate month format if provided
        if (month && !/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json({
                success: false,
                message: "Month must be in YYYY-MM format",
            });
        }

        const salaryWhere = {
            franchiseId,
        };

        if (month) {
            salaryWhere.salaryMonth = month;
        }

        const teachers = await Teacher.findAll({
            where: { franchiseId },
            attributes: ["id", "name", "email"],
            include: [
                {
                    model: MonthlySalary,
                    as: "monthlySalaries",
                    attributes: [
                        "id",
                        "salaryMonth",
                        "netSalary",
                        "status",
                    ],
                    where: month ? { salaryMonth: month } : undefined,
                    required: false,
                },

                {
                    model: SalaryAdvance,
                    as: "salaryAdvances",
                    attributes: [
                        "id",
                        "amount",
                        "remainingAmount",
                        "status",
                    ],
                    where: month ? { startMonth: month } : undefined,
                    required: false,
                },
            ],
            order: [["name", "ASC"]],
        });

        const payments = await SalaryPayment.findAll({
            where: { franchiseId },
            attributes: ["teacherId", "amount"],
            include: month
                ? [
                    {
                        model: MonthlySalary,
                        as: "salary",
                        attributes: [],
                        where: { salaryMonth: month },
                        required: true,
                    },
                ]
                : [],
        });

        const paymentMap = {};

        payments.forEach((payment) => {
            paymentMap[payment.teacherId] =
                (paymentMap[payment.teacherId] || 0) +
                Number(payment.amount || 0);
        });

        let totalSalaryExpense = 0;
        let totalPaid = 0;
        let totalPending = 0;
        let totalAdvances = 0;

        const teacherWise = teachers.map((teacher) => {
            const salaries = teacher.monthlySalaries || [];

            const salary = salaries.reduce(
                (sum, item) => sum + Number(item.netSalary || 0),
                0
            );

            const paid = paymentMap[teacher.id] || 0;
            const pending = Math.max(salary - paid, 0);

            const advances = (teacher.salaryAdvances || []).reduce(
                (sum, advance) =>
                    sum + Number(advance.amount || 0),
                0
            );

            totalSalaryExpense += salary;
            totalPaid += paid;
            totalPending += pending;
            totalAdvances += advances;

            return {
                teacherId: teacher.id,
                teacherName: teacher.name,
                totalSalary: salary,
                paid,
                pending,
                totalAdvances: advances,
            };
        });

        res.json({
            success: true,
            data: {
                summary: {
                    totalSalaryExpense,
                    totalPaid,
                    totalPending,
                    totalAdvances,
                },
                teachers: teacherWise,
            },
        });
    } catch (error) {
        console.error("Teacher expense dashboard error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch teacher expense dashboard",
        });
    }
};

module.exports = {
    getTeacherExpenseDashboard,
};












