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

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },


  },
  {
    tableName: "teacher_assignments",
    timestamps: true,


    indexes: [
      {
        fields: ["franchiseId"],
      },
      {
        fields: ["teacherId"],
      },
      {
        fields: ["classId"],
      },
      {
        fields: ["sectionId"],
      },
      {
        fields: ["subjectId"],
      },
      {
        fields: ["status"],
      },
    ],


  }
);

module.exports = TeacherAssignment;
