import { Models } from '../database/Database';
import { ServerError } from '../utility/error';

export const me = async (req, res, next) => {
    try {
        const me = {};

        const user = await Models.User.findOne({
            where: {
                id: req.user.id
            }
        });

        me.id = user.id;
        me.email = user.email;
        me.name = user.name;
        me.logs = [];

        const logs = await Models.Log.findAll({
            where: {
                userId: user.id
            }
        });

        for (const log of logs) {
            const tasks = await Models.Task.findAll({
                attributes: ['id', 'title', 'priority', 'due', 'isCompleted'],
                where: {
                    logId: log.id
                },
            });
            me.logs.push({
                id: log.id,
                title: log.title,
                note: log.note,
                tasks: tasks
            });
        }
        res.status(200).json({ me });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}