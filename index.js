import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import sendGrid from '@sendgrid/mail';

import { ConnectToDatabase } from './database/Database';
import errorHandler from './middlewares/error';
import { accessHandler } from './middlewares/authentication';
import authenticationRoutes from './routes/authentication';
import logRoutes from './routes/log';
import taskRoutes from './routes/task';
import userRoutes from './routes/user';

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

    try {
        const client = await ConnectToDatabase();
        app.listen(process.env.SERVER_PORT, () => {
            console.log(client);
            console.log(`server is running at http://localhost:${process.env.SERVER_PORT}`);
        })
    } catch (error) {
        console.log(error);
        console.log("[Error] Unable to start server");
    }
}

startServer();
