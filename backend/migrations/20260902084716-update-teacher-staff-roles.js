"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add staffType column
    await queryInterface.addColumn("teachers", "staffType", {
      type: Sequelize.ENUM("TEACHING", "NON_TEACHING"),
      allowNull: false,
      defaultValue: "TEACHING",
    });

    // Update role ENUM
    await queryInterface.changeColumn("teachers", "role", {
      type: Sequelize.ENUM(
        "TEACHER",
        "HOD",
        "PRINCIPAL",
        "ACCOUNTANT",
        "DATA_ENTRY",
        "SUPPORT"
      ),
      allowNull: false,
      defaultValue: "TEACHER",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("teachers", "staffType");

    await queryInterface.changeColumn("teachers", "role", {
      type: Sequelize.ENUM("TEACHER", "HOD"),
      allowNull: false,
      defaultValue: "TEACHER",
    });
  },
};