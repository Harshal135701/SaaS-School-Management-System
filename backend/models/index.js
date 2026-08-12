const sequelize = require("../config/database");

const Franchise = require("./Franchise");
const FranchiseAdmin = require("./FranchiseAdmin");
const SystemAdmin = require("./SystemAdmin");
const RoyaltyConfiguration = require("./RoyaltyConfiguration");

module.exports = {
  sequelize,
  Franchise,
  FranchiseAdmin,
  SystemAdmin,
  RoyaltyConfiguration,
};