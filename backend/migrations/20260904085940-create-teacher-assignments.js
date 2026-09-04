"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("teacher_assignments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      franchiseId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      teacherId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      classId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      sectionId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      subjectId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("teacher_assignments");
  },
};