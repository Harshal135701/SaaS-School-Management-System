const { Payment, sequelize } = require("../models");

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

    // Lock payment reference generation for this franchise
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

module.exports = { createPayment };


// Start transaction → payment operation is treated as one safe unit.
// Advisory lock → locks reference generation for that franchise, so two payments can't get the same number.
// Find last reference → e.g. REF-030.
// Generate next → REF-031.
// Create payment with that reference.
// Commit → save everything.
// If anything fails → rollback, so nothing is partially saved.

// So even if 10 payments arrive at exactly the same time, references remain sequential and unique.