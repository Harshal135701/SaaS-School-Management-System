"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("book_issues", {
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

      bookId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "books",
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

      issueDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      dueDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      returnDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM("ISSUED", "RETURNED", "OVERDUE"),
        defaultValue: "ISSUED",
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
    await queryInterface.dropTable("book_issues");
  },
};