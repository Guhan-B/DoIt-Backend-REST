import express from 'express';
import { body } from 'express-validator';

import { login, register, logout, refresh } from '../controllers/authentication';
import { accessHandler } from '../middlewares/authentication';

const router = express.Router();

router.get(
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
        body('name')
            .trim()
            .isLength({ min: 3 })
            .withMessage("Name should be minimum 3 characters"),
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

router.get(
    '/refresh',
    [
        body('userId')
            .trim()
            .notEmpty()
            .withMessage('User id required')
    ],
    refresh
);

export default router;