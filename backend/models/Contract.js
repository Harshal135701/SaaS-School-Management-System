const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Franchise = require("./Franchise");

const Contract = sequelize.define(
  "Contract",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    franchiseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "franchises",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    agreementNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    agreementType: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "EXPIRED", "RENEWED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },

    documentUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "contracts",
    timestamps: true,
  }
);

Franchise.hasMany(Contract, {
  foreignKey: "franchiseId",
  as: "contracts",
});

Contract.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

module.exports = Contract;