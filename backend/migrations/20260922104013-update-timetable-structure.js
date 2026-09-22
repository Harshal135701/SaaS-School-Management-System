"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns
    await queryInterface.addColumn("timetables", "schoolPeriodId", {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.addColumn("timetables", "classId", {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.addColumn("timetables", "sectionId", {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.addColumn("timetables", "subjectId", {
      type: Sequelize.UUID,
      allowNull: true,
    });

    // Old data cannot be automatically mapped safely.
    // Delete existing timetable rows before making new fields mandatory.
    await queryInterface.bulkDelete("timetables", null, {});

    // Make new columns mandatory
    await queryInterface.changeColumn("timetables", "schoolPeriodId", {
      type: Sequelize.UUID,
      allowNull: false,
    });

    await queryInterface.changeColumn("timetables", "classId", {
      type: Sequelize.UUID,
      allowNull: false,
    });

    await queryInterface.changeColumn("timetables", "sectionId", {
      type: Sequelize.UUID,
      allowNull: false,
    });

    await queryInterface.changeColumn("timetables", "subjectId", {
      type: Sequelize.UUID,
      allowNull: false,
    });

    // Remove old columns
    await queryInterface.removeColumn("timetables", "startTime");
    await queryInterface.removeColumn("timetables", "endTime");
    await queryInterface.removeColumn("timetables", "subject");
    await queryInterface.removeColumn("timetables", "className");
    await queryInterface.removeColumn("timetables", "section");

    // Unique class/section/period
    await queryInterface.addIndex("timetables", {
      unique: true,
      fields: [
        "franchiseId",
        "day",
        "schoolPeriodId",
        "classId",
        "sectionId",
      ],
      name: "unique_class_section_period",
    });

    // Unique teacher/period
    await queryInterface.addIndex("timetables", {
      unique: true,
      fields: [
        "franchiseId",
        "day",
        "schoolPeriodId",
        "teacherId",
      ],
      name: "unique_teacher_period",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "timetables",
      "unique_class_section_period"
    );

    await queryInterface.removeIndex(
      "timetables",
      "unique_teacher_period"
    );

    await queryInterface.addColumn("timetables", "startTime", {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await queryInterface.addColumn("timetables", "endTime", {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await queryInterface.addColumn("timetables", "subject", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("timetables", "className", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("timetables", "section", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.removeColumn("timetables", "schoolPeriodId");
    await queryInterface.removeColumn("timetables", "classId");
    await queryInterface.removeColumn("timetables", "sectionId");
    await queryInterface.removeColumn("timetables", "subjectId");
  },
};