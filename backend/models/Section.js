const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Section = sequelize.define(
    "Section",
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

      classId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "sections",
      timestamps: true,
    }
  );

  return Section;
};