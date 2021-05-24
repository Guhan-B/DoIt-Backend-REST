const express = require('express');
const { body } = require('express-validator');

const logsController = require('../controllers/logs');
const { accessAuthGaurd } = require('../middlewares/authGaurd');

const Router = express.Router();

Router.get(
    '/logs',
    accessAuthGaurd,
    logsController.fetchLogs
);

Router.post(
    '/log',
    accessAuthGaurd,
    [
        body('title').trim().isLength({ min: 5 }).withMessage("Log title minimum length 5")
    ],
    logsController.createLog
);

Router.delete(
    '/log',
    accessAuthGaurd,
    [
        body('id').trim().notEmpty().withMessage('id is required to add task')
    ],
    logsController.deleteLog
);

module.exports = Router;