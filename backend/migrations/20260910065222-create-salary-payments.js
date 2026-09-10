"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("salary_payments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      paymentNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
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

      salaryId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "monthly_salaries",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      teacherId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "teachers",
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
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      paymentMethod: {
        type: Sequelize.ENUM(
          "CASH",
          "UPI",
          "BANK_TRANSFER",
          "CHEQUE",
          "OTHER"
        ),
        allowNull: false,
      },

      referenceNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      receiptNumber: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable("salary_payments");
  },
};