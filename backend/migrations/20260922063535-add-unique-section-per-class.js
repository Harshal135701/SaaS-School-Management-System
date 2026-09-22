"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("sections", {
      fields: ["franchiseId", "classId", "name"],
      type: "unique",
      name: "unique_franchise_class_section_name",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "sections",
      "unique_franchise_class_section_name"
    );
  },
};

