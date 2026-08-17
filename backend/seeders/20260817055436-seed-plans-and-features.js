"use strict";

const crypto = require("crypto");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const plans = [
      {
        id: "10000000-0000-4000-8000-000000000001",
        name: "BASIC",
        description: "Basic school management features",
        price: 0,
        billingCycle: "MONTHLY",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "10000000-0000-4000-8000-000000000002",
        name: "PRO",
        description: "Professional school management features",
        price: 0,
        billingCycle: "MONTHLY",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "10000000-0000-4000-8000-000000000003",
        name: "ENTERPRISE",
        description: "Complete enterprise school management features",
        price: 0,
        billingCycle: "MONTHLY",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const featureData = [
      ["Student", "STUDENT"],
      ["Teacher", "TEACHER"],
      ["Attendance", "ATTENDANCE"],
      ["Homework", "HOMEWORK"],
      ["Fees", "FEES"],
      ["Examination", "EXAMINATION"],
      ["Library", "LIBRARY"],
      ["Timetable", "TIMETABLE"],
      ["Transport", "TRANSPORT"],
      ["Chat", "CHAT"],
      ["Advanced Reports", "ADVANCED_REPORTS"],
      ["Custom Features", "CUSTOM_FEATURES"],
    ];

    const features = featureData.map(([name, code]) => ({
      id: crypto.randomUUID(),
      name,
      code,
      description: `${name} module`,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("plans", plans);
    await queryInterface.bulkInsert("features", features);

    const planFeatures = [];

    const addFeatures = (plan, selectedFeatures) => {
      selectedFeatures.forEach((feature) => {
        planFeatures.push({
          id: crypto.randomUUID(),
          planId: plan.id,
          featureId: feature.id,
          createdAt: now,
          updatedAt: now,
        });
      });
    };

    addFeatures(plans[0], features.slice(0, 4));
    addFeatures(plans[1], features.slice(0, 8));
    addFeatures(plans[2], features);

    await queryInterface.bulkInsert("plan_features", planFeatures);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("plan_features", null, {});
    await queryInterface.bulkDelete("features", null, {});
    await queryInterface.bulkDelete("plans", null, {});
  },
};