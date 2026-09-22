"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const [constraints] = await queryInterface.sequelize.query(`       SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'sections'::regclass
      AND confrelid = 'classes'::regclass
      AND contype = 'f';
    `);


    for (const constraint of constraints) {
      await queryInterface.removeConstraint(
        "sections",
        constraint.conname
      );
    }

    await queryInterface.addConstraint("sections", {
      fields: ["classId"],
      type: "foreign key",
      name: "sections_classId_fkey",
      references: {
        table: "classes",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });


  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "sections",
      "sections_classId_fkey"
    );


    await queryInterface.addConstraint("sections", {
      fields: ["classId"],
      type: "foreign key",
      name: "sections_classId_fkey",
      references: {
        table: "classes",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });


  },
};
