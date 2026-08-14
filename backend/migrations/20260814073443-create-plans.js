"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("plans", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.ENUM("BASIC", "PRO", "ENTERPRISE"),
        allowNull: false,
        unique: true,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },

      billingCycle: {
        type: Sequelize.ENUM("MONTHLY", "YEARLY"),
        allowNull: false,
        defaultValue: "MONTHLY",
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
    await queryInterface.dropTable("plans");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_plans_name";'
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_plans_billingCycle";'
    );
  },
};