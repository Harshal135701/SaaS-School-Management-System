"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove global unique constraint if it exists
    try {
      await queryInterface.removeConstraint(
        "watchman_expenses",
        "watchman_expenses_paymentNumber_key"
      );
    } catch (error) {
      console.log(
        "Global paymentNumber constraint not found, continuing..."
      );
    }

    // Remove any existing unique index on paymentNumber
    try {
      await queryInterface.removeIndex(
        "watchman_expenses",
        "watchman_expenses_paymentNumber_key"
      );
    } catch (error) {
      console.log(
        "Global paymentNumber index not found, continuing..."
      );
    }

    // Franchise-wise uniqueness
    await queryInterface.addIndex(
      "watchman_expenses",
      ["franchiseId", "paymentNumber"],
      {
        unique: true,
        name: "watchman_expenses_franchise_payment_number_unique",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "watchman_expenses",
      "watchman_expenses_franchise_payment_number_unique"
    );

    await queryInterface.addConstraint(
      "watchman_expenses",
      {
        fields: ["paymentNumber"],
        type: "unique",
        name: "watchman_expenses_paymentNumber_key",
      }
    );
  },
};