"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("monthly_royalties", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      franchiseId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "franchises",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      billingMonth: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      baseAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      royaltyType: {
        type: Sequelize.ENUM("FIXED", "PERCENTAGE"),
        allowNull: false,
      },

      royaltyRate: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      royaltyAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      dueDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("PENDING", "PAID", "OVERDUE"),
        allowNull: false,
        defaultValue: "PENDING",
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

    await queryInterface.addConstraint("monthly_royalties", {
      fields: ["franchiseId", "billingMonth"],
      type: "unique",
      name: "unique_franchise_billing_month",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("monthly_royalties");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_monthly_royalties_royaltyType";'
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_monthly_royalties_status";'
    );
  },
};