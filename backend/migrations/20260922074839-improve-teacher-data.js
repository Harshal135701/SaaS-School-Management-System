"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // PAN remains nullable for existing legacy teacher records.
    await queryInterface.changeColumn("teachers", "panNumber", {
      type: Sequelize.STRING(10),
      allowNull: true,
      unique: true,
    });

    // Aadhaar remains optional.
    await queryInterface.changeColumn("teachers", "aadhaarNumber", {
      type: Sequelize.STRING(12),
      allowNull: true,
    });

    // Subject is now handled through TeacherAssignment.
    const table = await queryInterface.describeTable("teachers");

    if (table.subject) {
      await queryInterface.removeColumn("teachers", "subject");
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("teachers");

    if (!table.subject) {
      await queryInterface.addColumn("teachers", "subject", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    await queryInterface.changeColumn("teachers", "panNumber", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.changeColumn("teachers", "aadhaarNumber", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};