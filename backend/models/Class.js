const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Class = sequelize.define(
    "Class",
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

      code: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      numericValue: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "classes",
      timestamps: true,
    }
  );

  return Class;
};