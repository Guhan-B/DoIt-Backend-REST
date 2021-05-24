const { Sequelize } = require('sequelize');

const database = new Sequelize('node-task', 'root', 'Guhan@2001', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = database;