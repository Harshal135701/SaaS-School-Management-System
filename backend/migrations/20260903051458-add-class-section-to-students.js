"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("students", "classId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "classes",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("students", "sectionId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "sections",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("students", "sectionId");
    await queryInterface.removeColumn("students", "classId");
  },
};