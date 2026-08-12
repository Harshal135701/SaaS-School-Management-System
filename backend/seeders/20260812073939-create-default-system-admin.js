"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    const password = await bcrypt.hash("ChangeMe@123", 12);

    await queryInterface.bulkInsert("system_admins", [
      {
        id: "11111111-1111-4111-8111-111111111111",
        name: "System Admin",
        email: "admin@schoolmanagement.com",
        password,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("system_admins", {
      email: "admin@schoolmanagement.com",
    });
  },
};