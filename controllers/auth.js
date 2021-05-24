const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../model/user');

exports.userSignUp = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.errors = err.array();
        return next(error);
    }

    try {
        const isUserAvalible = await User.findOne({
            where: {
                email: req.body.email
            }
        });

        if (isUserAvalible) {
            const error = new Error('User already exist');
            error.statusCode = 406;
            return next(error);
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        const result = await User.create({
            id: uuidv4(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User created successfully",
            user: result
        });

    } catch (e) {
        const error = new Error('Unable to create user');
        error.statusCode = 401;
        error.errors = e;
        return next(error);
    }
}

exports.userSignIn = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.errors = err.array();
        return next(error);
    }

    try {
        const user = await User.findOne({
            where: {
                email: req.body.email
            }
        });
        if (user) {
            const isEqual = await bcrypt.compare(req.body.password, user.password);
            const accessToken = jwt.sign(
                {
                    id: user.id,
                },
                process.env.ACCESS_TOKEN_KEY,
                {
                    expiresIn: '15m'
                }
            );
            const refreshToken = jwt.sign(
                {
                    id: user.id,
                },
                process.env.REFRESH_TOKEN_KEY,
                {
                    expiresIn: '1y'
                }
            );
            if (isEqual) {
                res.status(200).json({
                    message: "Authentication successfull",
                    token: accessToken,
                    refreshToken: refreshToken,
                    expiresIn: Date.now() + 14 * 60
                });
            } else {
                const error = new Error('Password incorrect');
                error.statusCode = 401;
                return next(error);
            }
        } else {
            const error = new Error('Email not found');
            error.statusCode = 401;
            return next(error);
        }
    } catch (e) {
        const error = new Error('Unable to authenticate');
        error.statusCode = 401;
        error.errors = e;
        return next(error);
    }
}

exports.refreshUser = async (req, res, next) => {
    res.status(200).json({
        message: "refresh endpoint"
    })
}