"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            "teacher_assignments",
            "status",
            {
                type: Sequelize.ENUM("ACTIVE", "INACTIVE"),
                allowNull: false,
                defaultValue: "ACTIVE",
            }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn(
            "teacher_assignments",
            "status"
        );

        // PostgreSQL requires removing the ENUM type separately
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_teacher_assignments_status";'
        );
    },
};