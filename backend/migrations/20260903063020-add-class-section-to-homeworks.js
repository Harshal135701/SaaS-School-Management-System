"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("homeworks", "classId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "classes",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("homeworks", "sectionId", {
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
    await queryInterface.removeColumn("homeworks", "sectionId");
    await queryInterface.removeColumn("homeworks", "classId");
  },
};