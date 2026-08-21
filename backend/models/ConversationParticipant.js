const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ConversationParticipant = sequelize.define(
  "ConversationParticipant",
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

    participantType: {
      type: DataTypes.ENUM("PARENT", "TEACHER"),
      allowNull: false,
    },

    participantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "conversation_participants",
    timestamps: true,
  }
);

module.exports = ConversationParticipant;