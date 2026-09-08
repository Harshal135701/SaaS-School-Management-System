const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StudentFee = sequelize.define(
  "StudentFee",
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

    feeCategoryId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    originalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    discountPercent: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      allowNull: false,
    },

    finalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "student_fees",
    timestamps: true,
  }
);

module.exports = StudentFee;