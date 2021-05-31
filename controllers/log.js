import { v4 } from 'uuid';
import { validationResult } from 'express-validator';

import { ServerError } from '../utility/error';
import { Models } from '../database/Database';

export const createLog = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const newLog = new Models.Log({
            title: req.body.title,
            note: req.body.note,
            userId: req.user._id
        });

        await newLog.save();

        res.status(201).json({
            message: "Log created",
            log: {
                _id: newLog._id,
                title: newLog.title,
                note: newLog.note
            },
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

    console.log(req.user._id);
    console.log(req.body.logId);

    try {
        const log = await Models.Log.findOne({
            userId: req.user._id,
            _id: req.body.logId
        });

        console.log(log);

        if (!log) {
            return next(new ServerError('Log does not exist', 404, 'RESOURCE_NOT_FOUND'));
        }

        await log.delete();

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
        const logs = await Models.Log.find({ userId: req.user.id }).select('_id title note');

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
            userId: req.user.id,
            _id: req.body.logId
        });

        if (!log) {
            return next(new ServerError('Log does not exist', 404, 'RESOURCE_NOT_FOUND'));
        }

        log.title = req.body.title;
        log.note = req.body.note;

        log = await log.save();

        res.status(200).json({
            message: "Log updated",
            log: log
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('UUnable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}


