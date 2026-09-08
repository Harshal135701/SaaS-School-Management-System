const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Installment = sequelize.define(
  "Installment",
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

    studentFeeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    installmentNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("PENDING", "PARTIAL", "PAID", "OVERDUE"),
      defaultValue: "PENDING",
      allowNull: false,
    },
  },
  {
    tableName: "installments",
    timestamps: true,
  }
);

module.exports = Installment;