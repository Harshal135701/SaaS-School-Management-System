"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("conversation_participants", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },

      conversationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "conversations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      participantType: {
        type: Sequelize.ENUM("PARENT", "TEACHER"),
        allowNull: false,
      },

      participantId: {
        type: Sequelize.UUID,
        allowNull: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addConstraint("conversation_participants", {
      fields: [
        "conversationId",
        "participantType",
        "participantId",
      ],
      type: "unique",
      name: "unique_conversation_participant",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("conversation_participants");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_conversation_participants_participantType";'
    );
  },
};