const express = require('express');
const { body } = require('express-validator');

const tasksController = require('../controllers/tasks');
const { accessAuthGaurd } = require('../middlewares/authGaurd');

const Router = express.Router();

Router.get(
    '/tasks',
    accessAuthGaurd,
    [
        body('logId').trim().notEmpty().withMessage('LogId is required to get tasks')
    ],
    tasksController.fetchTasks
);

Router.post(
    '/task',
    accessAuthGaurd,
    [
        body('title').trim().isLength({ min: 5 }).withMessage("Task title minimum length 5"),
        body('priority').custom(value => {
            if (value != 0 && value != 1 && value != 2) {
                throw new Error("Task Priority Invalid")
            }
            return true;
        }),
        body('logId').trim().notEmpty().withMessage('LogId is required to add task')
    ],
    tasksController.addTask
);

Router.delete(
    '/task',
    accessAuthGaurd,
    [
        body('taskId').trim().notEmpty().withMessage('taskId is required to delete task'),
        body('logId').trim().notEmpty().withMessage('logId is required'),
    ],
    tasksController.deleteTask
);

module.exports = Router;