const { sequelize } = require("../config/database");
const Franchise = require("./Franchise");

module.exports = {
  sequelize,
  Franchise,
};