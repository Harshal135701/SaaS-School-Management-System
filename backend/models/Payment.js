const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    franchiseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    installmentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    paymentMethod: {
      type: DataTypes.ENUM(
        "CASH",
        "UPI",
        "CARD",
        "BANK_TRANSFER",
        "CHEQUE",
        "OTHER"
      ),
      allowNull: false,
    },

    referenceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    receiptNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    receivedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

module.exports = Payment;