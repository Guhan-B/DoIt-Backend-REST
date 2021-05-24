const { DataTypes } = require('sequelize');

const database = require('../utility/database');

const Task = database.define('task',
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        priority: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: 'tasks',
        timestamps: true,
        createdAt: true,
        updatedAt: false
    }
);

module.exports = Task;