const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const BookIssue = sequelize.define(
  "BookIssue",
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
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    returnDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("ISSUED", "RETURNED", "OVERDUE"),
      defaultValue: "ISSUED",
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "book_issues",
    timestamps: true,
  }
);

module.exports = BookIssue;