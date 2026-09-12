"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove existing global unique constraints
    await queryInterface.removeConstraint(
      "payments",
      "payments_referenceNumber_key"
    ).catch(() => {});

    await queryInterface.removeConstraint(
      "payments",
      "payments_receiptNumber_key"
    ).catch(() => {});

    // Reference number must be unique within each franchise
    await queryInterface.addIndex(
      "payments",
      ["franchiseId", "referenceNumber"],
      {
        unique: true,
        name: "payments_franchise_reference_unique",
      }
    );

    // Receipt number must be unique within each franchise
    await queryInterface.addIndex(
      "payments",
      ["franchiseId", "receiptNumber"],
      {
        unique: true,
        name: "payments_franchise_receipt_unique",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "payments",
      "payments_franchise_reference_unique"
    );

    await queryInterface.removeIndex(
      "payments",
      "payments_franchise_receipt_unique"
    );

    await queryInterface.addConstraint("payments", {
      fields: ["referenceNumber"],
      type: "unique",
      name: "payments_referenceNumber_key",
    });

    await queryInterface.addConstraint("payments", {
      fields: ["receiptNumber"],
      type: "unique",
      name: "payments_receiptNumber_key",
    });
  },
};