"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payments", {
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
        onDelete: "RESTRICT",
      },

      studentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "students",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      installmentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "installments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      paymentDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
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
        allowNull: false,
      },

      referenceNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      receiptNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      receivedBy: {
        type: Sequelize.UUID,
        allowNull: false,
      },

      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("payments");
  },
};  