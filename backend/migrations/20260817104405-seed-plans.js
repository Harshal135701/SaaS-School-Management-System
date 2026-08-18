"use strict";

const { randomUUID } = require("crypto");


module.exports = {
  async up(queryInterface, Sequelize) {
    const [existingPlans] = await queryInterface.sequelize.query(
      `SELECT name FROM plans`
    );

    const existingNames = existingPlans.map((plan) => plan.name);

    const plans = [
      {
        name: "BASIC",
        description: "Basic school management features",
        price: 3000,
        billingCycle: "MONTHLY",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "PRO",
        description: "Advanced school management features",
        price: 5000,
        billingCycle: "MONTHLY",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "ENTERPRISE",
        description: "Complete school management features",
        price: 10000,
        billingCycle: "MONTHLY",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const newPlans = plans.filter(
      (plan) => !existingNames.includes(plan.name)
    );

    if (newPlans.length > 0) {
      await queryInterface.bulkInsert("plans", newPlans);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("plans", {
      name: ["BASIC", "PRO", "ENTERPRISE"],
    });
  },
};