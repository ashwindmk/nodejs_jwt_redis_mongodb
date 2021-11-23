const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const redisClient = require('../redis_connect');

let refreshTokens = [];  // Not used since using redis

function getPayload(userId) {
    return { sub: userId };
}

function generateAccessToken(userId) {
    const payload = getPayload(userId);
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_TIME });
    return accessToken;
}

function generateRefreshToken(userId) {
    const payload = getPayload(userId);
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_TIME });
    
    // Save refresh token in in-memory store
    /*let storedRefreshToken = refreshTokens.find(x => x.username === username);
    if (storedRefreshToken === undefined) {
        // Add token
        refreshTokens.push({
            username,
            token: refreshToken
        });
    } else {
        // Update token
        const index = refreshTokens.findIndex(x => x.username === username);
        refreshTokens[index].token = refreshToken;
    }*/

    // Save refresh token in redis store
    redisClient.set(userId.toString(), JSON.stringify({token: refreshToken}));

    return refreshToken;
}

async function register(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password  // Encrypt password using bcryptjs in production
    });

    try {
        const savedUser = await user.save();
        res.json({
            status: true,
            message: 'Register success',
            data: {
                user: savedUser
            }
        });
    } catch (err) {
        console.error('Error while registering user', err);
        res.status(500).json({
            status: false,
            message: 'Register failed',
            error: err
        });
    }
}

async function login(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const user = await User.findOne({username, password}).exec();

        if (user === null) {
            res.status(401).json({
                status: false,
                message: 'Incorrect username or password'
            });
            return;
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.json({
            status: true,
            message: 'Login success',
            data: {
                access_token: accessToken,
                refrash_token: refreshToken
            }
        });
    } catch (err) {
        console.error('Error while login', err);
        res.status(401).json({
            status: 'fail',
            message: 'Login failed'
        });
    }
}

// Refresh access token
function token(req, res) {
    const userId = req.userData.sub;
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    res.json({
        status: 'success',
        message: 'Refresh token success',
        data: {
            access_token: accessToken,
            refrash_token: refreshToken
        }
    });
}

// Dashboard
const dashboard = (req, res) => {
    res.json({
        status: 'success',
        message: 'Welcome to dashboard'
    });
};

async function logout(req, res) {
    // Remove refresh token from in-memory array store
    /*const username = req.userData.sub;
    refreshTokens = refreshTokens.filter(x => x.username != username);*/

    // Remove refresh token from redis
    const userId = req.userData.sub;
    await redisClient.del(userId);

    // Blacklist access token
    const accessToken = req.token;
    const expiry = 60;  // secs
    await redisClient.set('BL_' + userId, accessToken, 'EX', expiry);  // Use HMSET here

    res.json({
        status: true,
        message: 'Logout success'
    });
}

module.exports = {
    refreshTokens,
    register,
    login,
    token,
    dashboard,
    logout
};
