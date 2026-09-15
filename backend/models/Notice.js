const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Notice = sequelize.define(
  "Notice",
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
      onDelete: "CASCADE",
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Title is required",
        },
      },
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Content is required",
        },
      },
    },

    targetAudience: {
      type: DataTypes.ENUM(
        "ALL",
        "TEACHERS",
        "STUDENTS",
        "PARENTS"
      ),
      allowNull: false,
    },

    priority: {
      type: DataTypes.ENUM(
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT"
      ),
      allowNull: false,
      defaultValue: "MEDIUM",
    },

    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "notices",
    timestamps: true,
  }
);

module.exports = Notice;