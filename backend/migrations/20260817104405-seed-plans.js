"use strict";

const { randomUUID } = require("crypto");

module.exports = {
  async up(queryInterface, Sequelize) {
    const [existingPlans] = await queryInterface.sequelize.query(
      `SELECT name FROM plans`
    );

    const existingNames = existingPlans.map((plan) => plan.name);

    const now = new Date();

    const plans = [
      {
        id: randomUUID(),
        name: "BASIC",
        description: "Basic school management features",
        price: 3000,
        billingCycle: "MONTHLY",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        name: "PRO",
        description: "Advanced school management features",
        price: 5000,
        billingCycle: "MONTHLY",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        name: "ENTERPRISE",
        description: "Complete school management features",
        price: 10000,
        billingCycle: "MONTHLY",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const newPlans = plans.filter(
      (plan) => !existingNames.includes(plan.name)
    );

    if (newPlans.length > 0) {
      await queryInterface.bulkInsert("plans", newPlans);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("plans", {
      name: ["BASIC", "PRO", "ENTERPRISE"],
    });
  },
};