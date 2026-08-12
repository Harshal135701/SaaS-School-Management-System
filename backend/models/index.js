const { sequelize } = require("../config/database");
const Franchise = require("./Franchise");
const FranchiseAdmin = require("./FranchiseAdmin");
const SystemAdmin = require("./SystemAdmin");

module.exports = {
  sequelize,
  Franchise,
  FranchiseAdmin,
  SystemAdmin,
};