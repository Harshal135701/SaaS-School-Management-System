"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Vendor extends Model {
    static associate(models) {
      Vendor.belongsTo(models.Franchise, {
        foreignKey: "franchiseId",
        as: "franchise",
      });

      Vendor.hasMany(models.SchoolExpense, {
        foreignKey: "vendorId",
        as: "expenses",
      });
    }
  }

  Vendor.init(
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

      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Vendor name is required",
          },
          len: {
            args: [2, 150],
            msg: "Vendor name must be between 2 and 150 characters",
          },
        },
      },

      contact: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: {
            msg: "Invalid vendor email address",
          },
        },
      },

      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        allowNull: false,
        defaultValue: "ACTIVE",
      },
    },
    {
      sequelize,
      modelName: "Vendor",
      tableName: "vendors",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["franchiseId", "name"],
          name: "vendors_franchise_name_unique",
        },
      ],
    }
  );

  return Vendor;
};