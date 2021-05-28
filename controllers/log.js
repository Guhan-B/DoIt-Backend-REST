import { v4 } from 'uuid';
import { validationResult } from 'express-validator';

import { ServerError } from '../utility/error';
import { Models } from '../database/Database';

export const createLog = async (req, res, next) => {
    console.log("hello");
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const log = await Models.Log.create({
            id: v4(),
            title: req.body.title,
            note: req.body.note,
            userId: req.user.id
        });
        res.status(201).json({
            message: "Log created",
            log: log,
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

export const deleteLog = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const log = await Models.Log.findOne({
            where: {
                userId: req.user.id,
                id: req.body.logId
            }
        });

        if (!log) {
            next(new ServerError('Log does not exist', 404, 'RESOURCE_NOT_FOUND'));
        }

        await log.destroy();

        res.status(200).json({
            message: "Log deleted",
            log: log
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

export const fetchLogs = async (req, res, next) => {
    try {
        const logs = await Models.Log.findAll({
            attributes: ['id', 'title', 'note'],
            where: {
                userId: req.user.id
            }
        });
        res.status(200).json({
            logs: logs,
            count: logs.length
        });
    } catch (e) {
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

export const updateLog = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        let log = await Models.Log.findOne({
            where: {
                userId: req.user.id,
                id: req.body.logId
            }
        });

        if (!log) {
            next(new ServerError('Log does not exist', 404, 'RESOURCE_NOT_FOUND'));
        }

        log = await log.update({
            title: req.body.title,
            note: req.body.note
        });

        res.status(200).json({
            message: "Log updated",
            log: log
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('UUnable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}


