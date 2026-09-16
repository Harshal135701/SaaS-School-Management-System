
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "watchman_expenses",
      "paymentNumber",
      {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      }
    );

    await queryInterface.addColumn(
      "watchman_expenses",
      "receiptNumber",
      {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      }
    );

    await queryInterface.addColumn(
      "watchman_expenses",
      "referenceNumber",
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      "watchman_expenses",
      "referenceNumber"
    );

    await queryInterface.removeColumn(
      "watchman_expenses",
      "receiptNumber"
    );

    await queryInterface.removeColumn(
      "watchman_expenses",
      "paymentNumber"
    );
  },
};

