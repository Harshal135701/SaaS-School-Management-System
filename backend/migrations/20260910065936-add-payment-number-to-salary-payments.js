"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("salary_payments", "paymentNumber", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addConstraint("salary_payments", {
      fields: ["paymentNumber"],
      type: "unique",
      name: "unique_salary_payment_number",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      "salary_payments",
      "unique_salary_payment_number"
    );

    await queryInterface.removeColumn(
      "salary_payments",
      "paymentNumber"
    );
  },
};