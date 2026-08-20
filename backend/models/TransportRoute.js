const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const TransportRoute = sequelize.define(
  "TransportRoute",
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
    vehicleId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    routeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startPoint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endPoint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stops: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    departureTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    arrivalTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
      allowNull: false,
    },
  },
  {
    tableName: "transport_routes",
    timestamps: true,
  }
);

module.exports = TransportRoute;