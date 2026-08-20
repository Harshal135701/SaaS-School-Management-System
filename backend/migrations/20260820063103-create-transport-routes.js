"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("transport_routes", {
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

      vehicleId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "vehicles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      routeName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      startPoint: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      endPoint: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      stops: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      departureTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      arrivalTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("ACTIVE", "INACTIVE"),
        defaultValue: "ACTIVE",
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
    await queryInterface.dropTable("transport_routes");
  },
};