const { DataTypes } = require('sequelize');

const database = require('../utility/database');

const RefreshToken = database.define('refreshtoken',
    {
        token: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        },
    },
    {
        tableName: 'refreshTokens',
        timestamps: true,
        updatedAt: false
    }
);

module.exports = RefreshToken;