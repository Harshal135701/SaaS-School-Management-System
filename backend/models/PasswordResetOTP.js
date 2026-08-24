const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PasswordResetOTP = sequelize.define(
  "PasswordResetOTP",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    otpHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    isUsed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    resetTokenHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    resetTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "password_reset_otps",
    timestamps: true,
  }
);

module.exports = PasswordResetOTP;