"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SchoolExpense extends Model {
    static associate(models) {
      SchoolExpense.belongsTo(models.Franchise, {
        foreignKey: "franchiseId",
        as: "franchise",
      });

      SchoolExpense.belongsTo(models.ExpenseCategory, {
        foreignKey: "categoryId",
        as: "category",
      });

      SchoolExpense.belongsTo(models.Vendor, {
        foreignKey: "vendorId",
        as: "vendor",
      });
    }
  }

  SchoolExpense.init(
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

      categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      vendorId: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      description: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Expense description is required",
          },
          len: {
            args: [2, 255],
            msg: "Description must be between 2 and 255 characters",
          },
        },
      },

      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          isDecimal: {
            msg: "Amount must be a valid decimal number",
          },
          min: {
            args: [0.01],
            msg: "Amount must be greater than zero",
          },
        },
      },

      expenseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      paymentDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      paymentMethod: {
        type: DataTypes.ENUM(
          "CASH",
          "UPI",
          "CARD",
          "BANK_TRANSFER",
          "CHEQUE",
          "OTHER"
        ),
        allowNull: true,
      },

      paymentNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      referenceNumber: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      receiptNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      invoiceNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(
          "PENDING",
          "APPROVED",
          "REJECTED",
          "PAID"
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },

      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      approvedBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      paidBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "SchoolExpense",
      tableName: "school_expenses",
      timestamps: true,

      indexes: [
        {
          unique: true,
          fields: ["franchiseId", "paymentNumber"],
          name: "school_expenses_franchise_payment_unique",
        },
        {
          fields: ["franchiseId", "categoryId"],
          name: "school_expenses_franchise_category_idx",
        },
        {
          fields: ["franchiseId", "vendorId"],
          name: "school_expenses_franchise_vendor_idx",
        },
        {
          fields: ["franchiseId", "expenseDate"],
          name: "school_expenses_franchise_date_idx",
        },
        {
          fields: ["franchiseId", "status"],
          name: "school_expenses_franchise_status_idx",
        },
      ],
    }
  );

  return SchoolExpense;
};