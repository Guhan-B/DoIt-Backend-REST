const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const Log = require('../model/logs');

exports.fetchLogs = async (req, res, next) => {
    try {
        const logs = await Log.findAll({
            attributes: ['id', 'title'],
            where: {
                userId: req.userId
            }
        });
        res.status(200).json({
            logs: logs,
            length: logs.length
        });
    } catch (e) {
        const error = new Error('Unable to fetch logs');
        error.statusCode = 404;
        error.errors = e;
        return next(error);
    }
}

exports.createLog = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.errors = err.array();
        return next(error);
    }

    try {
        const result = await Log.create({
            id: uuidv4(),
            title: req.body.title,
            userId: req.userId
        });
        res.status(201).json({ result: result });
    } catch (e) {
        const error = new Error('Unable to create log');
        error.statusCode = 409;
        error.errors = e;
        return next(error);
    }
}

exports.deleteLog = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.errors = err.array();
        return next(error);
    }

    try {
        const result = await Log.destroy({
            where: {
                id: req.body.id,
                userId: req.userId
            }
        });
        res.status(200).json({
            message: (result > 0) ? "Log successfully deleted" : "No log found with given id",
            result: result
        })
    } catch (e) {
        const error = new Error('Unable to delete log');
        error.statusCode = 409;
        error.errors = e;
        return next(error);
    }
}