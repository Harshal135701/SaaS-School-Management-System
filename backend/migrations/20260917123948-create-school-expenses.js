"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("school_expenses", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      franchiseId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "franchises",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "expense_categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      vendorId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "vendors",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      description: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      expenseDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      paymentDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      paymentMethod: {
        type: Sequelize.ENUM(
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
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      referenceNumber: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      receiptNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      invoiceNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM(
          "PENDING",
          "APPROVED",
          "REJECTED",
          "PAID"
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },

      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
      },

      approvedBy: {
        type: Sequelize.UUID,
        allowNull: true,
      },

      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      paidBy: {
        type: Sequelize.UUID,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Payment number is unique within each franchise.
    await queryInterface.addIndex(
      "school_expenses",
      ["franchiseId", "paymentNumber"],
      {
        unique: true,
        name: "school_expenses_franchise_payment_unique",
      }
    );

    await queryInterface.addIndex(
      "school_expenses",
      ["franchiseId", "categoryId"],
      {
        name: "school_expenses_franchise_category_idx",
      }
    );

    await queryInterface.addIndex(
      "school_expenses",
      ["franchiseId", "vendorId"],
      {
        name: "school_expenses_franchise_vendor_idx",
      }
    );

    await queryInterface.addIndex(
      "school_expenses",
      ["franchiseId", "expenseDate"],
      {
        name: "school_expenses_franchise_date_idx",
      }
    );

    await queryInterface.addIndex(
      "school_expenses",
      ["franchiseId", "status"],
      {
        name: "school_expenses_franchise_status_idx",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "school_expenses",
      "school_expenses_franchise_payment_unique"
    );

    await queryInterface.removeIndex(
      "school_expenses",
      "school_expenses_franchise_category_idx"
    );

    await queryInterface.removeIndex(
      "school_expenses",
      "school_expenses_franchise_vendor_idx"
    );

    await queryInterface.removeIndex(
      "school_expenses",
      "school_expenses_franchise_date_idx"
    );

    await queryInterface.removeIndex(
      "school_expenses",
      "school_expenses_franchise_status_idx"
    );

    await queryInterface.dropTable("school_expenses");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_school_expenses_paymentMethod";'
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_school_expenses_status";'
    );
  },
};