const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const sendGrid = require('@sendgrid/mail');
const moment = require('moment');

const { Models } = require('../database/Database');
const { ServerError } = require('../utility/error');
const { generateAccessTokens, generateRefreshTokens }= require('../utility/tokens');

exports.login = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const user = await Models.User.findOne({
            email: req.body.email
        });

        if (!user) {
            return next(new ServerError('Email does not exist', 401, 'RESOURCE_NOT_FOUND'));
        }

        if (!user.verified) {
            return res.status(401).json({
                message: "User verification required",
                verified: false
            });
        }

        const isPasswordSame = await bcrypt.compare(req.body.password, user.password);

        if (!isPasswordSame) {
            return next(new ServerError('Password does not match', 401, 'AUTHENTICATION_FAILED'));
        }

        const accessToken = generateAccessTokens({ userId: user._id });
        const refreshToken = generateRefreshTokens({ userId: user._id }, user.password);

        const newToken = new Models.Token({
            userId: user._id,
            refreshToken: refreshToken
        });

        await newToken.save();

        res.status(200).json({
            userId: user._id,
            accessToken,
            refreshToken,
            expiresAt: Date.now() + 10 * 3600,
            verified: true
        });
    } catch (e) {
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.register = async (req, res, next) => {
    const err = validationResult(req);


    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const isUserAvalible = await Models.User.findOne({
            email: req.body.email
        });

        console.log(isUserAvalible);

        if (isUserAvalible) {
            return next(new ServerError('Email already exist', 409, 'RESOURCE_EXISTS'));
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 12);

        const newUser = new Models.User({
            name: req.body.email.split('@')[0],
            email: req.body.email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: "Proceed to email verification",
            userId: newUser._id,
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.generateOTP = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const user = await Models.User.findOne({
            _id: req.body.userId
        });

        if (!user) {
            return next(new ServerError('User not found', 404, 'RESOURCE_NOT_FOUND'));
        }

        if (user.verified) {
            return next(new ServerError('User already verified', 409, 'CONFLICT'));
        }

        const min = Math.ceil(1000);
        const max = Math.floor(9999);
        const otp = Math.floor(Math.random() * (max - min) + min)
        const validTill = moment().add(5, 'minutes').toISOString();

        const newEmailOTP = new Models.EmailOTP({
            otp,
            validTill,
            userId: req.body.userId
        });

        await newEmailOTP.save();

        await sendGrid.send({
            from: 'no-reply@cpdevs.ml',
            to: user.email,
            templateId: 'd-7f3e92a9e2254c1397cc3ba91e367be6',
            dynamicTemplateData: {
                user_name: user.name,
                verify_otp: otp
            }
        });

        res.status(200).json({
            message: "OTP has been sent to registered email",
            verificationId: newEmailOTP._id
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.verifyOTP = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const emailOTP = await Models.EmailOTP.findOne({
            _id: req.body.verfId,
        });

        if (!emailOTP) {
            return next(new ServerError('invalid verification', 404, 'RESOURCE_NOT_FOUND'));
        }



        console.log("Saved OTP:", emailOTP.otp);
        console.log("User OTP:", Number.parseInt(req.body.otp));

        if (emailOTP.otp === Number.parseInt(req.body.otp)) {
            const current = moment();
            const validTill = moment(emailOTP.validTill);

            if (moment(current).isBefore(validTill)) {
                let user = await Models.User.findOne({
                    _id: emailOTP.userId
                });

                user.verified = true;
                await user.save();

                const accessToken = generateAccessTokens({ userId: user._id });
                const refreshToken = generateRefreshTokens({ userId: user._id }, user.password);

                const newToken = new Models.Token({
                    userId: user._id,
                    refreshToken: refreshToken
                });

                await newToken.save();

                await emailOTP.delete();

                res.status(200).json({
                    userId: user._id,
                    accessToken,
                    refreshToken,
                    expiresAt: moment().add(15, 'minutes').toISOString()
                });
            } else {
                await emailOTP.delete();
                return next(new ServerError('OTP Expired', 422, 'VERIFICATION_FAILED'));
            }
        } else {
            return next(new ServerError('Invalid OTP', 422, 'VERIFICATION_FAILED'));
        }

    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.logout = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    try {
        const token = await Models.Token.findOne({
            userId: req.user._id,
            refreshToken: req.body.refreshToken
        });

        if (!token) {
            return next(new ServerError('Unable to logout', 403, 'FORBIDDEN'));
        }

        await token.delete();

        res.status(200).json({
            message: "logout success"
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }
}

exports.refresh = async (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return next(new ServerError('Validation failed', 422, 'VALIDATION_FAILED', err.array()));
    }

    let user, refreshToken = req.get('Authorization');

    if (!refreshToken) {
        return next(new ServerError('Refresh token Missing', 401, 'AUTHORIZATION_FAILED'));
    }

    refreshToken = refreshToken.split(' ')[1];

    try {
        user = await Models.User.findOne({
            _id: req.body.userId
        });
    } catch (e) {
        console.log(e);
        return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY + user.password, async (err, decoded) => {
        if (err) {
            return next(new ServerError("Refresh Token error - " + err.message, 401, 'AUTHORIZATION_FAILED'));
        } else {
            try {
                const savedRefreshToken = await Models.Token.findOne({
                    userId: user._id,
                    refreshToken: refreshToken
                });

                console.log(savedRefreshToken);
                console.log(decoded);

                if (savedRefreshToken && savedRefreshToken.userId == decoded.userId) {
                    const accessToken = generateAccessTokens({ userId: user._id });
                    res.status(200).json({
                        accessToken,
                        expiresAt: Date.now() + 10 * 3600
                    });
                } else {
                    return next(new ServerError("Refresh token invalid", 401, 'AUTHORIZATION_FAILED'));
                }
            } catch (e) {
                console.log(e);
                return next(new ServerError('Unable to process request', 500, 'INTERNAL_SERVER_ERROR'));
            }
        }
    });
}