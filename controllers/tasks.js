const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const Task = require('../model/tasks');
const Log = require('../model/logs');

exports.fetchTasks = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.errors = err.array();
        return next(error);
    }

    try {
        const log = await Log.findOne({
            where: {
                id: req.body.logId,
                userId: req.userId
            }
        });

        if (log) {
            const result = await Task.findAll({
                where: {
                    logId: req.body.logId
                }
            });
            res.status(200).json({
                tasks: result,
                count: result.length
            })
        } else {
            const error = new Error('Forbidden');
            error.statusCode = 401;
            return next(error);
        }

    } catch (e) {
        const error = new Error('Unable to fetch tasks');
        error.statusCode = 404;
        error.errors = e;
        return next(error);
    }
}

exports.addTask = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.errors = err.array();
        return next(error);
    }

    try {
        const log = await Log.findOne({
            where: {
                id: req.body.logId,
                userId: req.userId
            }
        });

        if (log) {
            const result = await Task.create({
                id: uuidv4(),
                title: req.body.title,
                priority: req.body.priority,
                logId: req.body.logId
            });
            res.status(201).json({
                message: "Task created successfully",
                result: result
            });
        } else {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            return next(error);
        }

    } catch (e) {
        const error = new Error('Unable to create task');
        error.statusCode = 409;
        error.errors = e;
        return next(error);
    }
}

exports.deleteTask = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.errors = err.array();
        return next(error);
    }

    try {
        const log = await Log.findOne({
            where: {
                id: req.body.logId,
                userId: req.userId
            }
        });
        if (log) {
            const result = await Task.destroy({
                where: {
                    id: req.body.taskId
                }
            });
            res.status(200).json({
                message: (result > 0) ? "Task successfully deleted" : "No Task found with given id",
                result: result
            })
        } else {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            return next(error);
        }

    } catch (e) {
        const error = new Error('Unable to delete Task');
        error.statusCode = 409;
        error.errors = e;
        return next(error);
    }
}