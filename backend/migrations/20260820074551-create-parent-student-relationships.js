"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("parent_students", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },

      parentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "parents",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      studentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "students",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      relationship: {
        type: Sequelize.ENUM("FATHER", "MOTHER", "GUARDIAN"),
        allowNull: false,
      },

      isPrimary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addConstraint("parent_students", {
      fields: ["parentId", "studentId"],
      type: "unique",
      name: "unique_parent_student",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("parent_students");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_parent_students_relationship";'
    );
  },
};