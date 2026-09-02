const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ExamResult = sequelize.define(
  "ExamResult",
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

    examinationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    obtainedMarks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "exam_results",
    timestamps: true,
  }
);

module.exports = ExamResult;