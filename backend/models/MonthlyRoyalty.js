const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Franchise = require("./Franchise");

const MonthlyRoyalty = sequelize.define(
  "MonthlyRoyalty",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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

    billingMonth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    baseAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    royaltyType: {
      type: DataTypes.ENUM("FIXED", "PERCENTAGE"),
      allowNull: false,
    },

    royaltyRate: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    royaltyAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("PENDING", "PAID", "OVERDUE"),
      allowNull: false,
      defaultValue: "PENDING",
    },
  },
  {
    tableName: "monthly_royalties",
    timestamps: true,
  }
);

Franchise.hasMany(MonthlyRoyalty, {
  foreignKey: "franchiseId",
  as: "monthlyRoyalties",
});

MonthlyRoyalty.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

module.exports = MonthlyRoyalty;