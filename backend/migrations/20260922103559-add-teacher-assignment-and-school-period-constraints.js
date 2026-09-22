"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Make TeacherAssignment.subjectId mandatory
    await queryInterface.changeColumn("teacher_assignments", "subjectId", {
      type: Sequelize.UUID,
      allowNull: false,
    });

    // 2. Prevent duplicate ACTIVE teacher assignments
    await queryInterface.addIndex("teacher_assignments", {
      unique: true,
      fields: [
        "franchiseId",
        "teacherId",
        "classId",
        "sectionId",
        "subjectId",
      ],
      where: {
        status: "ACTIVE",
      },
      name: "unique_active_teacher_assignment",
    });

    // 3. Prevent duplicate period numbers inside the same franchise
    await queryInterface.addIndex("school_periods", {
      unique: true,
      fields: ["franchiseId", "periodNumber"],
      name: "unique_franchise_period_number",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "teacher_assignments",
      "unique_active_teacher_assignment"
    );

    await queryInterface.removeIndex(
      "school_periods",
      "unique_franchise_period_number"
    );

    await queryInterface.changeColumn(
      "teacher_assignments",
      "subjectId",
      {
        type: Sequelize.UUID,
        allowNull: true,
      }
    );
  },
};