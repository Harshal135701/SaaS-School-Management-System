const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SchoolPeriod = sequelize.define(
  "SchoolPeriod",
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

    periodNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },

    name: {
      type: DataTypes.STRING,
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

    isBreak: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "school_periods",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["franchiseId", "periodNumber"],
        name: "unique_franchise_period_number",
      },
    ],
  }
);

module.exports = SchoolPeriod;