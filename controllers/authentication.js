import { v4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { Models } from '../database/Database';
import { ServerError } from '../utility/error';
import { generateAccessTokens, generateRefreshTokens } from '../utility/tokens';

export const login = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const user = await Models.User.findOne({
            where: {
                email: req.body.email
            }
        });

        if (!user) {
            next(new ServerError('Email does not exist', 401, 'RESOURCE_NOT_FOUND'));
        }

        const isPasswordSame = await bcrypt.compare(req.body.password, user.password);

        if (!isPasswordSame) {
            next(new ServerError('Password does not match', 401, 'AUTHENTICATION_FAILED'));
        }

        const accessToken = generateAccessTokens({ userId: user.id });
        const refreshToken = generateRefreshTokens({ userId: user.id }, user.password);

        const result = await Models.Token.create({
            userId: user.id,
            refreshToken: refreshToken
        });

        res.status(200).json({
            userId: user.id,
            accessToken,
            refreshToken,
            expiresAt: Date.now() + 10 * 3600
        });
    } catch (e) {
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

export const register = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const isUserAvalible = await Models.User.findOne({
            where: {
                email: req.body.email
            }
        });

        if (isUserAvalible) {
            next(new ServerError('Email already exist', 409, 'RESOURCE_EXISTS'));
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        const newUser = await Models.User.create({
            id: v4(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User created successfully",
            user: newUser
        });
    } catch (e) {
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

export const verify = (req, res, next) => {
    res.status(200).json({
        message: "verify endpoint",
    });
}

export const logout = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    console.log(req.user);

    try {
        const token = await Models.Token.findOne({
            where: {
                userId: req.user.id,
                refreshToken: req.body.refreshToken
            }
        });

        if (!token) {
            next(new ServerError('Unable to logout', 403, 'FORBIDDEN'));
        }

        await token.destroy();

        res.status(200).json({
            message: "logout success"
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

export const refresh = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    let user, refreshToken = req.get('Authorization');

    if (!refreshToken) {
        next(new ServerError('Refresh token Missing', 401, 'AUTHORIZATION_FAILED'));
    }

    refreshToken = refreshToken.split(' ')[1];

    try {
        user = await Models.User.findOne({
            where: {
                id: req.body.userId
            }
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY + user.password, async (err, decoded) => {
        if (err) {
            next(new ServerError("Refresh Token error - " + err.message, 401, 'AUTHORIZATION_FAILED'));
        } else {
            try {
                const savedRefreshToken = await Models.Token.findOne({
                    where: {
                        userId: user.id,
                        refreshToken: refreshToken
                    }
                });

                console.log(savedRefreshToken);
                console.log(decoded);

                if (savedRefreshToken && savedRefreshToken.userId === decoded.userId) {
                    const accessToken = generateAccessTokens({ userId: user.id });
                    res.status(200).json({
                        accessToken,
                        expiresAt: Date.now() + 10 * 3600
                    });
                } else {
                    next(new ServerError("Refresh token invalid", 401, 'AUTHORIZATION_FAILED'));
                }
            } catch (e) {
                console.log(e);
                next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
            }
        }
    });
}