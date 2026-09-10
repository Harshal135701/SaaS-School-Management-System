"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("monthly_salaries", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      franchiseId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "franchises",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      teacherId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "teachers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      salaryProfileId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "salary_profiles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      salaryMonth: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      basicSalary: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      allowances: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
      },

      deductions: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
      },

      advanceDeduction: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
      },

      netSalary: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("PENDING", "PAID"),
        defaultValue: "PENDING",
        allowNull: false,
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

    await queryInterface.addConstraint("monthly_salaries", {
      fields: ["franchiseId", "teacherId", "salaryMonth"],
      type: "unique",
      name: "unique_teacher_monthly_salary",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("monthly_salaries");
  },
};