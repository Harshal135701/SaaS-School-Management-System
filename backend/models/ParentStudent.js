const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ParentStudent = sequelize.define(
  "ParentStudent",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    parentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    relationship: {
      type: DataTypes.ENUM("FATHER", "MOTHER", "GUARDIAN"),
      allowNull: false,
    },

    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "parent_students",
    timestamps: true,
  }
);

module.exports = ParentStudent;