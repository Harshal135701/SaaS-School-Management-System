const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Timetable = sequelize.define(
  "Timetable",
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

    day: {
      type: DataTypes.ENUM(
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY"
      ),
      allowNull: false,
    },

    schoolPeriodId: {
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

    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    room: {
      type: DataTypes.STRING,
      allowNull: true,
      trim: true,
    },
  },
  {
    tableName: "timetables",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: [
          "franchiseId",
          "day",
          "schoolPeriodId",
          "classId",
          "sectionId",
        ],
        name: "unique_class_section_period",
      },
      {
        unique: true,
        fields: [
          "franchiseId",
          "day",
          "schoolPeriodId",
          "teacherId",
        ],
        name: "unique_teacher_period",
      },
    ],
  }
);

module.exports = Timetable;