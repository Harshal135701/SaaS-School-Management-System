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
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    className: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    section: DataTypes.STRING,
    room: DataTypes.STRING,
  },
  {
    tableName: "timetables",
    timestamps: true,
  }
);

module.exports = Timetable;