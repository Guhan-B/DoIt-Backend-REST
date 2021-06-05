const express = require('express');
const { body } = require('express-validator');

const { login, register, logout, refresh, generateOTP, verifyOTP } = require('../controllers/authentication');
const { accessHandler } = require('../middlewares/authentication');

const router = express.Router();

router.post(
    '/login',
    [
        body('email')
            .trim()
            .isEmail()
            .withMessage("email badly formated")
            .normalizeEmail(),
        body('password')
            .trim()
            .isLength({ min: 6 })
            .withMessage("Passowrd should be minimum 6 characters long")
    ],
    login
);

router.post(
    '/register',
    [
        body('email')
            .trim()
            .isEmail()
            .withMessage("email badly formated")
            .normalizeEmail(),
        body('password')
            .trim()
            .isLength({ min: 6 })
            .withMessage("Passowrd should be minimum 6 characters long"),
    ],
    register
);

router.delete(
    '/logout',
    accessHandler,
    [
        body('refreshToken')
            .trim()
            .notEmpty()
            .withMessage("Refresh token required"),
    ],
    logout
);

router.post(
    '/refresh',
    [
        body('userId')
            .trim()
            .notEmpty()
            .withMessage('User id required')
    ],
    refresh
);

router.post(
    '/generateOTP',
    [
        body('userId')
            .trim()
            .notEmpty()
            .withMessage('User id required')
    ],
    generateOTP
);

router.post(
    '/verifyOTP',
    [
        body('verificationId')
            .trim()
            .notEmpty()
            .withMessage('Verification id required'),
        body('OTP')
            .trim()
            .notEmpty()
            .withMessage('otp required')
    ],
    verifyOTP
);

module.exports = router;