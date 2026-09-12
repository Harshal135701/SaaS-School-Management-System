const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Watchman = sequelize.define(
    "Watchman",
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

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      joiningDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      paymentType: {
        type: DataTypes.ENUM(
          "DAILY",
          "WEEKLY",
          "FORTNIGHTLY",
          "MONTHLY",
          "CUSTOM"
        ),
        allowNull: false,
      },

      rate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "watchmen",
      timestamps: true,
    }
  );

  return Watchman;
};

