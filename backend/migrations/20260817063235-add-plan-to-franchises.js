"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("franchises", "planId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "plans",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("franchises", "planId");
  },
};