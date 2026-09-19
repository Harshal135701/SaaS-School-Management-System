const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SubjectRequirement = sequelize.define(
  "SubjectRequirement",
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

    subjectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    periodsPerWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "subject_requirements",
    timestamps: true,
  }
);

module.exports = SubjectRequirement;