const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Franchise = require("./Franchise");

const RoyaltyConfiguration = sequelize.define(
    "RoyaltyConfiguration",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        franchiseId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "franchises",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        royaltyType: {
            type: DataTypes.ENUM("FIXED", "PERCENTAGE"),
            allowNull: false,
        },

        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },

        effectiveFrom: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
    },
    {
        tableName: "royalty_configurations",
        timestamps: true,
    }
);

Franchise.hasMany(RoyaltyConfiguration, {
    foreignKey: "franchiseId",
    as: "royaltyConfigurations",
});

RoyaltyConfiguration.belongsTo(Franchise, {
    foreignKey: "franchiseId",
    as: "franchise",
});

module.exports = { RoyaltyConfiguration };