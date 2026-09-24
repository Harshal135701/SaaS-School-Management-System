const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const TeacherSettings = sequelize.define(
  "TeacherSettings",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "UTC",
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "USD",
    },
    dateFormat: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "YYYY-MM-DD",
    },
    themeMode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "system",
    },
    reducedMotion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    highContrast: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    screenReaderFriendly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "teacher_settings",
    timestamps: true,
  }
);

module.exports = TeacherSettings;
