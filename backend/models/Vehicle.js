const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Vehicle = sequelize.define(
  "Vehicle",
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
    vehicleNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vehicleType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    driverName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    driverPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
      allowNull: false,
    },
  },
  {
    tableName: "vehicles",
    timestamps: true,
  }
);

module.exports = Vehicle;