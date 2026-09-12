const {
  Payment,
  Installment,
  StudentFee,
  Student,
  FeeCategory,
  sequelize,
} = require("../models");

const PDFDocument = require("pdfkit");


const isValidAmount = (value) => {
  const num = Number(value);
  return (
    Number.isFinite(num) &&
    num > 0 &&
    Number.isInteger(num * 100)
  );
};

const isValidDate = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

// CREATE PAYMENT
const createPayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      studentId,
      installmentId,
      amount,
      paymentMethod,
      receiptNumber,
      remarks,
      paymentDate,
    } = req.body;

    const franchiseId = req.user.franchiseId;
    const receivedBy = req.user.id;

    if (
      !studentId ||
      !installmentId ||
      amount === undefined ||
      !paymentMethod ||
      !receiptNumber
    ) {
      await transaction.rollback();

      return res.status(400).json({
        message:
          "studentId, installmentId, amount, paymentMethod and receiptNumber are required",
      });
    }

    const cleanReceiptNumber = String(receiptNumber).trim();

    if (!cleanReceiptNumber) {
      await transaction.rollback();

      return res.status(400).json({
        message: "receiptNumber cannot be empty",
      });
    }

    if (!isValidAmount(amount)) {
      await transaction.rollback();

      return res.status(400).json({
        message:
          "amount must be a valid positive amount with max 2 decimals",
      });
    }

    if (paymentDate && !isValidDate(paymentDate)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "Invalid paymentDate",
      });
    }

    const validMethods = [
      "CASH",
      "UPI",
      "CARD",
      "BANK_TRANSFER",
      "CHEQUE",
      "OTHER",
    ];

    if (!validMethods.includes(paymentMethod)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // Lock payment numbering for this franchise
    await sequelize.query(
      "SELECT pg_advisory_xact_lock(hashtext(:franchiseId))",
      {
        replacements: { franchiseId },
        transaction,
      }
    );

    // Get installment and verify student + franchise
    const installment = await Installment.findOne({
      where: {
        id: installmentId,
        franchiseId,
      },
      include: [
        {
          model: StudentFee,
          as: "studentFee",
          where: {
            studentId,
            franchiseId,
          },
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!installment) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Installment not found for this student",
      });
    }

    const student = await Student.findOne({
      where: {
        id: studentId,
        franchiseId,
      },
      transaction,
    });

    if (!student) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Student not found in this franchise",
      });
    }

    // Calculate already paid amount
    const existingPayments = await Payment.sum("amount", {
      where: {
        installmentId,
        franchiseId,
      },
      transaction,
    });

    const alreadyPaid = Number(existingPayments || 0);
    const installmentAmount = Number(installment.amount);
    const paymentAmount = Number(amount);

    const remaining = Number(
      (installmentAmount - alreadyPaid).toFixed(2)
    );

    if (paymentAmount > remaining) {
      await transaction.rollback();

      return res.status(400).json({
        message: `Payment exceeds remaining installment amount (${remaining.toFixed(
          2
        )})`,
      });
    }

    // Generate franchise-wise sequential reference number
    const lastPayment = await Payment.findOne({
      where: { franchiseId },
      order: [["createdAt", "DESC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    let nextNumber = 1;

    if (lastPayment?.referenceNumber) {
      const match =
        lastPayment.referenceNumber.match(/(\d+)$/);

      if (match) {
        nextNumber = Number(match[1]) + 1;
      }
    }

    const referenceNumber = `REF-${String(nextNumber).padStart(
      3,
      "0"
    )}`;

    // Create payment
    const payment = await Payment.create(
      {
        franchiseId,
        studentId,
        installmentId,
        amount: paymentAmount.toFixed(2),
        paymentDate: paymentDate || new Date(),
        paymentMethod,
        referenceNumber,
        receiptNumber: cleanReceiptNumber,
        receivedBy,
        remarks,
      },
      { transaction }
    );

    // Update installment status
    const totalPaid = Number(
      (alreadyPaid + paymentAmount).toFixed(2)
    );

    let status = "PARTIAL";

    if (totalPaid >= installmentAmount) {
      status = "PAID";
    }

    await installment.update(
      { status },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      message: "Payment recorded successfully",
      data: payment,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Create payment error:", error);

    return res.status(500).json({
      message: "Failed to record payment",
      error: error.message,
    });
  }
};

// GET ALL PAYMENTS
const getPayments = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;

    const payments = await Payment.findAll({
      where: { franchiseId },

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

    return res.status(200).json({
      message: "Payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Get payments error:", error);

    return res.status(500).json({
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

// GET PAYMENT RECEIPT
const getPaymentReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;

    const payment = await Payment.findOne({
      where: {
        id,
        franchiseId,
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
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    const installment = payment.installment;
    const studentFee = installment?.studentFee;

    return res.status(200).json({
      message: "Payment receipt details fetched successfully",

      data: {
        receiptNumber: payment.receiptNumber,
        referenceNumber: payment.referenceNumber,

        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,

        amount: Number(payment.amount),

        student: payment.student
          ? {
            id: payment.student.id,
            name:
              payment.student.name ||
              payment.student.fullName ||
              null,
          }
          : null,

        fee: studentFee
          ? {
            id: studentFee.id,
            category:
              studentFee.category?.name || null,
            originalAmount: Number(
              studentFee.originalAmount
            ),
            discountPercent: Number(
              studentFee.discountPercent
            ),
            finalAmount: Number(
              studentFee.finalAmount
            ),
          }
          : null,

        installment: installment
          ? {
            id: installment.id,
            installmentNumber:
              installment.installmentNumber,
            amount: Number(installment.amount),
            dueDate: installment.dueDate,
            status: installment.status,
          }
          : null,

        remarks: payment.remarks || null,
        receivedBy: payment.receivedBy,
      },
    });
  } catch (error) {
    console.error("Get payment receipt error:", error);

    return res.status(500).json({
      message: "Failed to fetch payment receipt",
      error: error.message,
    });
  }
};


const generatePaymentReceiptPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;

    const payment = await Payment.findOne({
      where: { id, franchiseId },
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
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    const student = payment.student;
    const installment = payment.installment;
    const studentFee = installment?.studentFee;

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename="receipt-${payment.receiptNumber}.pdf"`
    );

    doc.pipe(res);

    // Header
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("FEE PAYMENT RECEIPT", {
        align: "center",
      });

    doc.moveDown();

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Receipt No: ${payment.receiptNumber}`)
      .text(`Reference No: ${payment.referenceNumber}`)
      .text(
        `Payment Date: ${new Date(
          payment.paymentDate
        ).toLocaleDateString("en-IN")}`
      );

    doc.moveDown();

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Student Details");

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(
        `Student: ${student?.name ||
        student?.fullName ||
        "N/A"
        }`
      )
      .text(`Student ID: ${student?.id || "N/A"}`);

    doc.moveDown();

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Fee Details");

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(
        `Category: ${studentFee?.category?.name ||
        "Other"
        }`
      )
      .text(
        `Installment: ${installment?.installmentNumber || "N/A"
        }`
      )
      .text(
        `Installment Amount: ₹${Number(
          installment?.amount || 0
        ).toFixed(2)}`
      )
      .text(
        `Paid Amount: ₹${Number(
          payment.amount || 0
        ).toFixed(2)}`
      )
      .text(
        `Payment Method: ${payment.paymentMethod}`
      );

    doc.moveDown();

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(
        `Amount Received: ₹${Number(
          payment.amount
        ).toFixed(2)}`,
        {
          align: "right",
        }
      );

    doc.moveDown();

    if (payment.remarks) {
      doc
        .fontSize(11)
        .font("Helvetica")
        .text(`Remarks: ${payment.remarks}`);
    }

    doc.moveDown(3);

    doc
      .fontSize(10)
      .text(
        "This is a computer-generated payment receipt.",
        {
          align: "center",
        }
      );

    doc.end();
  } catch (error) {
    console.error(
      "Generate receipt PDF error:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        message:
          "Failed to generate payment receipt",
      });
    }
  }
};

// DELETE PAYMENT
// Payments must not be physically deleted.
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;

    const payment = await Payment.findOne({
      where: {
        id,
        franchiseId,
      },
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    return res.status(400).json({
      message:
        "Payments cannot be deleted. Use a payment reversal/void process instead.",
    });
  } catch (error) {
    console.error("Delete payment error:", error);

    return res.status(500).json({
      message: "Failed to process payment deletion",
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentReceipt,
  deletePayment,
  generatePaymentReceiptPDF,
};







