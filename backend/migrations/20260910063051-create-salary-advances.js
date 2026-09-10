"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("salary_advances", {
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

      remainingAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      recoveryType: {
        type: Sequelize.ENUM("FULL", "FIXED", "PERCENTAGE"),
        allowNull: false,
      },

      recoveryValue: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      startMonth: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("ACTIVE", "COMPLETED", "CANCELLED"),
        allowNull: false,
        defaultValue: "ACTIVE",
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
    await queryInterface.dropTable("salary_advances");
  },
};