const { validationResult } = require('express-validator');

const { ServerError } = require('../utility/error');
const { Models } = require('../database/Database');

exports.createTask = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const log = await Models.Log.findOne({
            _id: req.body.logId,
            userId: req.user._id
        });

        if (!log) {
            return next(new ServerError('Log does not exist', 400, 'BAD_REQUEST'));
        }

        const newTask = new Models.Task({
            logId: log._id,
            title: req.body.title,
            priority: req.body.priority,
            due: req.body.due
        });

        await newTask.save();

        res.status(201).json({
            message: "Task created",
            task: newTask,
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.deleteTask = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const task = await Models.Task.findOne({
            _id: req.body.taskId
        });

        if (!task) {
            return next(new ServerError('Task does not exist', 404, 'RESOURCE_NOT_FOUND'));
        }

        const log = await Models.Log.findOne({
            userId: req.user._id,
            _id: task.logId
        });

        if (!log) {
            return next(new ServerError('Unable to delete task', 402, 'FORBIDDEN'));
        }

        await task.delete();

        res.status(200).json({
            message: "Task deleted",
            task: task
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.fetchTasks = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const log = await Models.Log.findOne({
            userId: req.user._id,
            _id: req.body.logId
        });

        if (!log) {
            return next(new ServerError('Unable to fetch task', 404, 'RESOURCE_NOT_FOUND'));
        }

        const tasks = await Models.Task.find({
            logId: req.body.logId
        }).select('_id title priority due isCompleted');

        res.status(200).json({
            tasks: tasks,
            count: tasks.length
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.toggleTask = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        let task = await Models.Task.findOne({
            _id: req.body.taskId
        });

        if (!task) {
            return next(new ServerError('Task does not exist', 404, 'RESOURCE_NOT_FOUND'));
        }

        const log = await Models.Log.findOne({
            userId: req.user._id,
            _id: task.logId
        });

        if (!log) {
            return next(new ServerError('Unable to update task', 402, 'FORBIDDEN'));
        }

        task.completed = !task.completed;

        await task.save();

        res.status(200).json({
            message: "Task updated",
            task: task
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}


