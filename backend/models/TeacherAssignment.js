const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const TeacherAssignment = sequelize.define(
  "TeacherAssignment",
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
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sectionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: "teacher_assignments",
    timestamps: true,
  }
);

module.exports = TeacherAssignment;