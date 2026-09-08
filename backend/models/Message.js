const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    senderType: {
      type: DataTypes.ENUM("PARENT", "TEACHER"),
      allowNull: false,
    },

    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },

    editedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    isDeletedForEveryone: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },

    deletedForMeBy: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
      allowNull: false,
    },
  },
  {
    tableName: "messages",
    timestamps: true,
  }
);

module.exports = Message;