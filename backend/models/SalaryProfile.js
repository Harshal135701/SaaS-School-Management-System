const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SalaryProfile = sequelize.define(
  "SalaryProfile",
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

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    tableName: "salary_profiles",
    timestamps: true,
  }
);

module.exports = SalaryProfile;