const express = require('express');
const { body } = require('express-validator');

const { me, update } = require('../controllers/user');

const router = express.Router();

router.get('/me', me);

router.post(
    '/update',
    [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('name cannot be empty'),
        body('avatar')
            .trim()
            .notEmpty()
            .withMessage('avatar required')
            .isNumeric()
            .withMessage('avatar should be a number')
    ],
    update
)

module.exports = router;