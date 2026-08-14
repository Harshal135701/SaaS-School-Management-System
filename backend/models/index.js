const { sequelize } = require("../config/database");

const Franchise = require("./Franchise");
const FranchiseAdmin = require("./FranchiseAdmin");
const SystemAdmin = require("./SystemAdmin");
const RoyaltyConfiguration = require("./RoyaltyConfiguration");
const MonthlyRoyalty = require("./MonthlyRoyalty");
const Contract = require("./Contract");
const Plan = require("./plan");
const Feature = require("./Feature");

// Plan ↔ Feature
Plan.belongsToMany(Feature, {
  through: "plan_features",
  foreignKey: "planId",
  otherKey: "featureId",
  as: "features",
});

Feature.belongsToMany(Plan, {
  through: "plan_features",
  foreignKey: "featureId",
  otherKey: "planId",
  as: "plans",
});

module.exports = {
  sequelize,
  Franchise,
  FranchiseAdmin,
  SystemAdmin,
  Plan,
  Feature,
  Contract,
  RoyaltyConfiguration,
  MonthlyRoyalty,
};