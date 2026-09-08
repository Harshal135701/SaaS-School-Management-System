"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("messages", "isEdited", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn("messages", "editedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("messages", "isDeletedForEveryone", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn("messages", "deletedForMeBy", {
      type: Sequelize.ARRAY(Sequelize.UUID),
      defaultValue: [],
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("messages", "deletedForMeBy");
    await queryInterface.removeColumn("messages", "isDeletedForEveryone");
    await queryInterface.removeColumn("messages", "editedAt");
    await queryInterface.removeColumn("messages", "isEdited");
  },
};