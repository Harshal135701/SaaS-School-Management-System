"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("teachers", "role", {
      type: Sequelize.ENUM("TEACHER", "HOD"),
      allowNull: false,
      defaultValue: "TEACHER",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("teachers", "role");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_teachers_role";'
    );
  },
};