const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');

const Router = express.Router();

Router.post(
    '/signup',
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
    authController.userSignUp
);

Router.get(
    '/signin',
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
    authController.userSignIn
);

Router.get(
    '/refresh',
    authController.refreshUser
);


module.exports = Router;