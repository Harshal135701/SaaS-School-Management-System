const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Conversation = sequelize.define(
  "Conversation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    franchiseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    studentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    teacherId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: "conversations",
    timestamps: true,
  }
);

module.exports = Conversation;