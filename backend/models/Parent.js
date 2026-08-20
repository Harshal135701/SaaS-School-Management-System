const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Parent = sequelize.define(
  "Parent",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "parents",
    timestamps: true,
  }
);

module.exports = Parent;