const jwt = require('jsonwebtoken');

const RefreshToken = require('../model/refreshtoken');

exports.accessAuthGaurd = (req, res, next) => {
    const token = req.get('Authorization');
    if (!token) {
        const error = new Error('Access Token Missing');
        error.statusCode = 401;
        throw error;
    }
    let decodedToken = null;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    } catch (e) {
        const error = new Error('Internal Server Error');
        error.statusCode = 500;
        error.errors = e;
        throw error;
    }
    if (!decodedToken) {
        const error = new Error('Invalid Access Token');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.id;
    next();
}

exports.refreshAuthGaurd = async (req, res, next) => {
    const token = req.get('Authorization');
    if (!token) {
        const error = new Error('Refresh token missing');
        error.statusCode = 401;
        throw error;
    }
    let decodedToken = null;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    } catch (e) {
        const error = new Error('Internal Server Error');
        error.statusCode = 500;
        error.errors = e;
        throw error;
    }
    if (!decodedToken) {
        const error = new Error('Invalid Refresh Token');
        error.statusCode = 401;
        throw error;
    }

    try {
        const result = await RefreshToken.findOne({
            where: {
                userId: decodedToken.id,
                token: token
            }
        });
        // Please continue this ASAP
    } catch (e) {
        const error = new Error('Internal Server Error');
        error.statusCode = 500;
        error.errors = e;
        throw error;
    }
}