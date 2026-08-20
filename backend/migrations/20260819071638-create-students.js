"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("students", {
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

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      dateOfBirth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      gender: {
        type: Sequelize.ENUM("MALE", "FEMALE", "OTHER"),
        allowNull: true,
      },

      address: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    await queryInterface.dropTable("students");
  },
};