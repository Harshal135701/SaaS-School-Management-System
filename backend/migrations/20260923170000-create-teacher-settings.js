'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('teacher_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      teacherId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'teachers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'UTC',
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'USD',
      },
      dateFormat: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'YYYY-MM-DD',
      },
      themeMode: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'system',
      },
      reducedMotion: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      highContrast: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      screenReaderFriendly: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      twoFactorEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('teacher_settings');
  }
};
