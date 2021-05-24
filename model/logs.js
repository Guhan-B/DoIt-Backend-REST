const { DataTypes } = require('sequelize');

const database = require('../utility/database');

const Log = database.define(
    'log',
    {
        id: {
            primaryKey: true,
            type: DataTypes.STRING,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
    },
    {
        tableName: 'logs',
        timestamps: false
    }
);

module.exports = Log;