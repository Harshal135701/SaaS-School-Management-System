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
      allowNull: false,
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

      // Prevent duplicate ACTIVE assignment
      {
        unique: true,
        fields: [
          "franchiseId",
          "teacherId",
          "classId",
          "sectionId",
          "subjectId",
        ],
        where: {
          status: "ACTIVE",
        },
        name: "unique_active_teacher_assignment",
      },
    ],


  }
);

module.exports = TeacherAssignment;
