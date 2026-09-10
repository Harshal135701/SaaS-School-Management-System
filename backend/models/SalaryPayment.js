const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SalaryPayment = sequelize.define(
  "SalaryPayment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    paymentNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    
    franchiseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    salaryId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    paymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    paymentMethod: {
      type: DataTypes.ENUM(
        "CASH",
        "UPI",
        "BANK_TRANSFER",
        "CHEQUE",
        "OTHER"
      ),
      allowNull: false,
    },

    referenceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    receiptNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    paidBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "salary_payments",
    timestamps: true,
  }
);

module.exports = SalaryPayment;