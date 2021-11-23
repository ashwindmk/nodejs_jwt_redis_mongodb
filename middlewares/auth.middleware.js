const jwt = require('jsonwebtoken');
const redisClient = require('../redis_connect');
let refreshTokens = require('../controllers/user.controller');

function verifyAccessToken(req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        console.log('Decoded user data', decoded);
        req.token = token;
        req.userData = decoded;
        next();
    } catch (err) {
        console.error('Error while verifying access token', err);
        res.status(401).json({
            status: 'fail',
            message: 'Invalid session',
            error: err  // Do not send this in production
        });
    }
}

function verifyRefreshToken(req, res, next) {
    const token = req.body.token;
    if (token === null) {
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid refresh token',
            error: err  // Do not send this in production
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        console.log('Decoded user data', decoded);

        // Verify using in-memory array store
        //const storedRefreshTokenData = refreshTokens.find(x => x.username === decoded.sub);

        // Verify using redis store
        const key = decoded.sub.toString();
        redisClient.get(key, (err, value) => {
            if (err) {
                console.error('Error while finding refresh token', err);
                return res.status(500).json({
                    status: false,
                    message: 'Error getting refresh token from store'
                });
            }
            const storedRefreshTokenData = JSON.parse(value);
            console.log('Stored refresh token data:', JSON.stringify(storedRefreshTokenData));
            if (storedRefreshTokenData === undefined || storedRefreshTokenData === null) {
                console.error('Refresh token is null or undefined!');
                return res.status(401).json({
                    status: false,
                    message: 'Refresh token is not in store'
                });
            }
            if (storedRefreshTokenData.token != token) {
                console.error('Refresh token mismatch: ', storedRefreshTokenData.token);
                return res.status(402).json({
                    status: false,
                    message: 'Refresh token is not in store'
                });
            }
    
            req.userData = decoded;

            // Validate refresh token

            next();
        });
    } catch (err) {
        console.error('Error while verifying access token', err);
        res.status(401).json({
            status: 'fail',
            message: 'Invalid session',
            error: err  // Do not send this in production
        });
    }
}

module.exports = {
    verifyAccessToken,
    verifyRefreshToken
};
