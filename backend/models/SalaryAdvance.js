const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SalaryAdvance = sequelize.define(
  "SalaryAdvance",
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

    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    remainingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    recoveryType: {
      type: DataTypes.ENUM("FULL", "FIXED", "PERCENTAGE"),
      allowNull: false,
    },

    recoveryValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    startMonth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "COMPLETED", "CANCELLED"),
      defaultValue: "ACTIVE",
      allowNull: false,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "salary_advances",
    timestamps: true,
  }
);

module.exports = SalaryAdvance;