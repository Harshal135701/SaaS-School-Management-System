const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const MonthlySalary = sequelize.define(
  "MonthlySalary",
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

    salaryProfileId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    salaryMonth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    basicSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    allowances: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },

    deductions: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },

    advanceDeduction: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },

    netSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("PENDING", "PAID"),
      defaultValue: "PENDING",
      allowNull: false,
    },
  },
  {
    tableName: "monthly_salaries",
    timestamps: true,
  }
);

module.exports = MonthlySalary;