"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("vendors", {
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
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      contact: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },

      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM("ACTIVE", "INACTIVE"),
        allowNull: false,
        defaultValue: "ACTIVE",
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

    // Vendor names must be unique within a franchise.
    await queryInterface.addIndex(
      "vendors",
      ["franchiseId", "name"],
      {
        unique: true,
        name: "vendors_franchise_name_unique",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "vendors",
      "vendors_franchise_name_unique"
    );

    await queryInterface.dropTable("vendors");

    // PostgreSQL ENUM cleanup
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_vendors_status";'
    );
  },
};