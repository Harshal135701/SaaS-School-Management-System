const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Fee = sequelize.define(
  "Fee",
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

    title: {
      type: DataTypes.STRING,
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
      type: DataTypes.ENUM("PENDING", "PAID", "OVERDUE"),
      defaultValue: "PENDING",
      allowNull: false,
    },

    paymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "fees",
    timestamps: true,
  }
);

module.exports = Fee;