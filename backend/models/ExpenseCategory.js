"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ExpenseCategory extends Model {
    static associate(models) {
      ExpenseCategory.belongsTo(models.Franchise, {
        foreignKey: "franchiseId",
        as: "franchise",
      });

      ExpenseCategory.hasMany(models.SchoolExpense, {
        foreignKey: "categoryId",
        as: "expenses",
      });
    }
  }

  ExpenseCategory.init(
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
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Category name is required",
          },
          len: {
            args: [2, 100],
            msg: "Category name must be between 2 and 100 characters",
          },
        },
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ExpenseCategory",
      tableName: "expense_categories",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["franchiseId", "name"],
          name: "expense_categories_franchise_name_unique",
        },
      ],
    }
  );

  return ExpenseCategory;
};