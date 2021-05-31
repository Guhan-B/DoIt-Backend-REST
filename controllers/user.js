import { Models } from '../database/Database';
import { ServerError } from '../utility/error';

export const me = async (req, res, next) => {
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
        res.status(200).json({ ...me });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}