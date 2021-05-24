const database = require('./database');
const Task = require('../model/tasks');
const Log = require('../model/logs');

const startServer = async () => {
    console.log("ggggg");
    Log.hasMany(Task);
    Task.belongsTo(Log);
    try{
        const result = await database.sync();
        console.log("Server started");
        console.log(result);
        app.listen(8080);
    } catch(error) {
        console.log("Unable to start server");
        console.error(error);
    }
}

module.exports = startServer;