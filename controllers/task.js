import { v4 } from 'uuid';
import { validationResult } from 'express-validator';

import { ServerError } from '../utility/error';
import { Models } from '../database/Database';

export const createTask = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const log = await Models.Log.findOne({
            where: {
                id: req.body.logId,
                userId: req.user.id
            }
        });

        if(!log){
            return next(new ServerError('Log does not exist', 400, 'BAD_REQUEST'));
        }

        const task = await Models.Task.create({
            id: v4(),
            logId: log.id,
            title: req.body.title,
            priority: req.body.priority,
            due: req.body.due
        });

        res.status(201).json({
            message: "Task created",
            task: task,
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

export const deleteTask = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const task = await Models.Task.findOne({
            where: {
                id: req.body.taskId
            }
        });

        if(!task){
            return next(new ServerError('Task does not exist', 404, 'RESOURCE_NOT_FOUND'));
        }

        const log = await Models.Log.findOne({
            where: {
                userId: req.user.id,
                id: task.logId
            }
        });

        if (!log) {
            return next(new ServerError('Unable to delete task', 402, 'FORBIDDEN'));
        }

        await task.destroy();

        res.status(200).json({
            message: "Task deleted",
            task: task
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

export const fetchTasks = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const log = await Models.Log.findOne({
            where:{
                userId: req.user.id,
                id: req.body.logId
            }
        });

        if(!log){
            return next(new ServerError('Unable to fetch task', 404, 'RESOURCE_NOT_FOUND'));
        }

        const tasks = await Models.Task.findAll({
            attributes: ['id', 'title', 'priority'],
            where: {
                logId: req.body.logId
            }
        });

        res.status(200).json({
            tasks: tasks,
            count: tasks.length
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}


