const { validationResult } = require('express-validator');

const { Models } = require('../database/Database');
const { ServerError } = require('../utility/error');

exports.me = async (req, res, next) => {
    try {
        const me = {};

        me._id = req.user._id;
        me.email = req.user.email;
        me.name = req.user.name;
        me.logs = [];

        const logs = await Models.Log.find({
            userId: req.user._id
        }).select('_id title note');

        for (const log of logs) {
            const tasks = await Models.Task.find({
                logId: log._id
            }).select('_id title priority due completed');
            me.logs.push({
                _id: log._id,
                title: log.title,
                note: log.note,
                tasks: tasks
            });
        }
        return res.status(200).json({ ...me });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.update = async (req, res, next) => {
    console.log("GG")
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const user = await Models.User.findOne({ _id: req.user._id });

        user.name = req.body.name;
        user.avatar = req.body.avatar;

        await user.save();

        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            },
        })
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}