const express = require('express');
const { body } = require('express-validator');

const { createTask, deleteTask, fetchTasks, toggleTask } = require('../controllers/task');

const router = express.Router();

router.get(
    '/fetch',
    [
        body('logId')
            .trim()
            .notEmpty()
            .withMessage('Log id required')
    ],
    fetchTasks
);

router.post(
    '/create',
    [
        body('logId')
            .trim()
            .notEmpty()
            .withMessage('Log id required'),
        body('title')
            .trim()
            .notEmpty()
            .withMessage("Task title is required"),
        body('due')
            .notEmpty()
            .isNumeric()
            .withMessage("Due date is not valid"),
        body('priority')
            .trim()
            .notEmpty()
            .withMessage('priority is required')
            .custom(value => {
                if (value != 0 && value != 1 && value != 2) {
                    throw new Error("Task Priority Invalid")
                }
                return true;
            })
    ],
    createTask
);

router.delete(
    '/delete',
    [
        body('taskId')
            .trim()
            .notEmpty()
            .withMessage('Task id is required to delete a task')
    ],
    deleteTask
);

router.post(
    '/toggle',
    [
        body('taskId')
            .trim()
            .notEmpty()
            .withMessage('Task id is required to delete a task')
    ],
    toggleTask
);

module.exports = router;