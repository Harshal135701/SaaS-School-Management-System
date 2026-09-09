const {
  Payment,
  Installment,
  StudentFee,
  Student,
  FeeCategory,
} = require("../models");

const createPayment = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            studentId,
            installmentId,
            amount,
            paymentMethod,
            receiptNumber,
            receivedBy,
            remarks,
        } = req.body;

        if (
            !studentId ||
            !installmentId ||
            !amount ||
            !paymentMethod ||
            !receiptNumber ||
            !receivedBy
        ) {
            await transaction.rollback();

            return res.status(400).json({
                success: false,
                message: "Required payment fields are missing",
            });
        }

        const franchiseId = req.user.franchiseId;

        // Lock reference generation for this franchise
        await sequelize.query(
            `SELECT pg_advisory_xact_lock(hashtext(:franchiseId))`,
            {
                replacements: { franchiseId },
                transaction,
            }
        );

        const lastPayment = await Payment.findOne({
            where: { franchiseId },
            order: [["createdAt", "DESC"]],
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        let nextNumber = 1;

        if (lastPayment?.referenceNumber) {
            const match = lastPayment.referenceNumber.match(/\d+$/);

            if (match) {
                nextNumber = Number(match[0]) + 1;
            }
        }

        const referenceNumber = `REF-${String(nextNumber).padStart(3, "0")}`;

        // Validate installment + student
        const installment = await Installment.findOne({
            where: {
                id: installmentId,
                franchiseId,
            },
            include: [
                {
                    model: StudentFee,
                    where: { studentId },
                },
            ],
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!installment) {
            await transaction.rollback();

            return res.status(404).json({
                success: false,
                message: "Invalid installment or student",
            });
        }

        // Calculate remaining amount
        const totalPaid = await Payment.sum("amount", {
            where: { installmentId },
            transaction,
        });

        const remainingAmount =
            Number(installment.amount) - Number(totalPaid || 0);

        if (Number(amount) > remainingAmount) {
            await transaction.rollback();

            return res.status(400).json({
                success: false,
                message: `Payment exceeds remaining amount: ${remainingAmount}`,
            });
        }

        // Create payment
        const payment = await Payment.create(
            {
                franchiseId,
                studentId,
                installmentId,
                amount,
                paymentMethod,
                referenceNumber,
                receiptNumber,
                receivedBy,
                remarks,
            },
            { transaction }
        );

        // Update installment status
        const newTotalPaid =
            Number(totalPaid || 0) + Number(amount);

        if (newTotalPaid >= Number(installment.amount)) {
            installment.status = "PAID";
        } else if (newTotalPaid > 0) {
            installment.status = "PARTIAL";
        }

        await installment.save({ transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: "Payment recorded successfully",
            data: payment,
        });
    } catch (error) {
        await transaction.rollback();

        console.error("Create payment error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to record payment",
        });
    }
};


const getPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: {
        franchiseId: req.user.franchiseId,
      },
      include: [
        {
          model: Student,
          as: "student",
        },
        {
          model: Installment,
          as: "installment",
          include: [
            {
              model: StudentFee,
              as: "studentFee",
              include: [
                {
                  model: FeeCategory,
                  as: "category",
                },
              ],
            },
          ],
        },
      ],
      order: [["paymentDate", "DESC"]],
    });

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
};


// Start transaction → payment operation is treated as one safe unit.
// Advisory lock → locks reference generation for that franchise, so two payments can't get the same number.
// Find last reference → e.g. REF-030.
// Generate next → REF-031.
// Create payment with that reference.
// Commit → save everything.
// If anything fails → rollback, so nothing is partially saved.

// So even if 10 payments arrive at exactly the same time, references remain sequential and unique.