const express = require('express');
const dotenv = require('dotenv');

const database = require('./utility/database');
const errorHandler = require('./utility/error');
const headers = require('./utility/headers');
const Task = require('./model/tasks');
const Log = require('./model/logs');
const User = require('./model/user');
const RefreshToken = require('./model/refreshtoken');
const tasksRoutes = require('./routes/tasks');
const logsRoutes = require('./routes/logs');
const authRoutes = require('./routes/auth');

dotenv.config();
const app = express();

app.use(express.json());
app.use(headers);
app.use(tasksRoutes);
app.use(logsRoutes);
app.use('/auth', authRoutes);
app.use(errorHandler);

User.hasMany(Log, {
    onDelete: 'CASCADE'
});
Log.belongsTo(User);

Log.hasMany(Task, {
    onDelete: 'CASCADE'
});
Task.belongsTo(Log);

User.hasMany(RefreshToken, {
    onDelete: 'CASCADE'
});
RefreshToken.belongsTo(User);

database
    .sync()
    .then(result => {
        console.log(result);
        app.listen(process.env.PORT);
    })
    .catch(error => {
        console.log(error);
    });

