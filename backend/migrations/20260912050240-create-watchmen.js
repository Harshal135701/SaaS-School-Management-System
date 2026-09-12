"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("watchmen", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      franchiseId: {
        type: Sequelize.UUID,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      joiningDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      paymentType: {
        type: Sequelize.ENUM(
          "DAILY",
          "WEEKLY",
          "FORTNIGHTLY",
          "MONTHLY",
          "CUSTOM"
        ),
        allowNull: false,
      },

      rate: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      isActive: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable("watchmen");
  },
};

