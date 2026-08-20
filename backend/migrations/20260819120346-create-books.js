"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("books", {
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

      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      author: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      isbn: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      category: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      availableQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      status: {
        type: Sequelize.ENUM("AVAILABLE", "UNAVAILABLE"),
        defaultValue: "AVAILABLE",
        allowNull: false,
      },

      description: {
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
    await queryInterface.dropTable("books");
  },
};