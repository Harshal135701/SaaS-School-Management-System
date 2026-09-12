
"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex(
      "installments",
      ["studentFeeId", "installmentNumber"],
      {
        unique: true,
        name: "installments_fee_installment_number_unique",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "installments",
      "installments_fee_installment_number_unique"
    );
  },
};

