const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Franchise = require("./Franchise");

const FranchiseAdmin = sequelize.define(
  "FranchiseAdmin",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },

    franchiseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "franchises",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
  },
  {
    tableName: "franchise_admins",
    timestamps: true,
  }
);

Franchise.hasOne(FranchiseAdmin, {
  foreignKey: "franchiseId",
  as: "admin",
});

FranchiseAdmin.belongsTo(Franchise, {
  foreignKey: "franchiseId",
  as: "franchise",
});

module.exports = FranchiseAdmin;