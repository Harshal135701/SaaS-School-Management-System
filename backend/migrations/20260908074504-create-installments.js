"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("installments", {
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

      studentFeeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "student_fees",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      installmentNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      dueDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("PENDING", "PARTIAL", "PAID", "OVERDUE"),
        defaultValue: "PENDING",
        allowNull: false,
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
    await queryInterface.dropTable("installments");
  },
};