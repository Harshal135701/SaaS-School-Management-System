"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("student_fees", {
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

      feeCategoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "fee_categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      originalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      discountPercent: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
        allowNull: false,
      },

      finalAmount: {
        type: Sequelize.DECIMAL(10, 2),
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
    await queryInterface.dropTable("student_fees");
  },
};