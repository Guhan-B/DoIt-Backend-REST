const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const helmet = require('helmet')
const sendGrid = require('@sendgrid/mail')

const { ConnectToDatabase } = require('./database/Database');
const errorHandler = require('./middlewares/error');
const { accessHandler } = require('./middlewares/authentication');
const authenticationRoutes = require('./routes/authentication');
const logRoutes = require('./routes/log');
const taskRoutes = require('./routes/task');
const userRoutes = require('./routes/user');

const startServer = async () => {
    dotenv.config();
    sendGrid.setApiKey(process.env.SENDGRID_API);

    const app = express();

    app.use(express.json());
    app.use(helmet());
    app.use(cors());

    app.use('/log', accessHandler, logRoutes)
    app.use('/task', accessHandler, taskRoutes)
    app.use('/user', accessHandler, userRoutes)
    app.use('/auth', authenticationRoutes);

    app.use(errorHandler);

    const PORT = process.env.PORT || 8000;

    try {
        const client = await ConnectToDatabase();
        console.log("[SUCCESS] Connected to database successfully")
        app.listen(PORT, () => {
            console.log(client);
            console.log(`[SUCCESS] server is running at ${PORT}`);
        })
    } catch (error) {
        console.log(error);
        console.log("[ERROR] Unable to start server");
    }
}

startServer();
