const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Examination = sequelize.define(
  "Examination",
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

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    examDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    totalMarks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    passingMarks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "UPCOMING",
        "ONGOING",
        "COMPLETED"
      ),
      defaultValue: "UPCOMING",
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "examinations",
    timestamps: true,
  }
);

module.exports = Examination;