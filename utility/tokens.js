import jwt from 'jsonwebtoken';

export const generateAccessTokens = (payload) => {
    const token = jwt.sign(
        {
            userId: payload.userId,
            type: 'ACCESS',
            timestamp: Date.now()
        },
        process.env.ACCESS_TOKEN_KEY,
        {
            expiresIn: '100m'
        }
    );
    return token;
}

export const generateRefreshTokens = (payload, extra) => {
    const token = jwt.sign(
        {
            userId: payload.userId,
            type: 'REFRESH',
            timestamp: Date.now()
        },
        process.env.REFRESH_TOKEN_KEY + extra,
        {
            expiresIn: '1y'
        }
    );
    return token;
}

export const verifyAccessToken = (token) => {

}

export const verifyRefreshToken = (token) => {

}
