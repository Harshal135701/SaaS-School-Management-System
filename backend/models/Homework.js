const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Homework = sequelize.define(
  "Homework",
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

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "COMPLETED"),
      defaultValue: "ACTIVE",
      allowNull: false,
    },
  },
  {
    tableName: "homeworks",
    timestamps: true,
  }
);

module.exports = Homework;