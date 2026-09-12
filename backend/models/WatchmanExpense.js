const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const WatchmanExpense = sequelize.define(
    "WatchmanExpense",
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

      watchmanId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      periodStart: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      periodEnd: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      paymentDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
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
        allowNull: true,
      },

      paymentNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      receiptNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      referenceNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      referenceNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      receiptNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("PENDING", "PAID"),
        defaultValue: "PENDING",
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
      tableName: "watchman_expenses",
      timestamps: true,
    }
  );

  return WatchmanExpense;
};









