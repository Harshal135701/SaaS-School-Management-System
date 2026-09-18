"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("expense_categories", {
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

      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // Category names must be unique within a franchise.
    await queryInterface.addIndex(
      "expense_categories",
      ["franchiseId", "name"],
      {
        unique: true,
        name: "expense_categories_franchise_name_unique",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "expense_categories",
      "expense_categories_franchise_name_unique"
    );

    await queryInterface.dropTable("expense_categories");
  },
};