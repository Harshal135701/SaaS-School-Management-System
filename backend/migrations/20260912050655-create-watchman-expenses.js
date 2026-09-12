"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("watchman_expenses", {
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

      watchmanId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "watchmen",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      periodStart: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      periodEnd: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      amount: {
        type: Sequelize.DECIMAL(12, 2),
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

      referenceNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      receiptNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM("PENDING", "PAID"),
        allowNull: false,
        defaultValue: "PENDING",
      },

      paidBy: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      remarks: {
        type: Sequelize.TEXT,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("watchman_expenses");
  },
};

