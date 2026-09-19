"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "password_reset_otps",
      "userType",
      {
        type: Sequelize.ENUM(
          "SYSTEM_ADMIN",
          "FRANCHISE_ADMIN",
          "TEACHER",
          "PARENT"
        ),
        allowNull: false,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "password_reset_otps",
      "userType"
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_password_reset_otps_userType";'
    );
  },
};