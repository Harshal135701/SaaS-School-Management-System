"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("teachers", "panNumber", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn("teachers", "aadhaarNumber", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("teachers", "panNumber");
    await queryInterface.removeColumn("teachers", "aadhaarNumber");
  },
};