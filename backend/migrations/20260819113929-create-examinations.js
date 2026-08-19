"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("examinations", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      franchiseId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "franchises",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      examDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      totalMarks: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      passingMarks: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("UPCOMING", "ONGOING", "COMPLETED"),
        defaultValue: "UPCOMING",
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("examinations");
  },
};