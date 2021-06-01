const express = require('express');
const { body } = require('express-validator');

const { createLog, deleteLog, fetchLogs, updateLog } = require('../controllers/log');

const router = express.Router();

router.get(
    '/fetch',
    fetchLogs
);

router.post(
    '/create',
    [
        body('title').trim().notEmpty().withMessage("Log title is required"),
        body('note').trim().notEmpty().withMessage('note is required')
    ],
    createLog
);

router.delete(
    '/delete',
    [
        body('logId').trim().notEmpty().withMessage('Log id is required to delete a log')
    ],
    deleteLog
);

router.post(
    '/update',
    [
        body('logId').trim().notEmpty().withMessage('Log id is required to delete a log'),
        body('title').trim().notEmpty().withMessage('title is required'),
        body('note').trim().notEmpty().withMessage('note is required')
    ],
    updateLog
);

module.exports = router;