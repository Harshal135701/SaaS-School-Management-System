"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("royalty_configurations", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
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

      royaltyType: {
        type: Sequelize.ENUM("FIXED", "PERCENTAGE"),
        allowNull: false,
      },

      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      effectiveFrom: {
        type: Sequelize.DATEONLY,
        allowNull: false,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("royalty_configurations");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_royalty_configurations_royaltyType";'
    );
  },
};