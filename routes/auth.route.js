const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', userController.register);

router.post('/login', userController.login);

router.post('/token', authMiddleware.verifyRefreshToken, userController.token);

router.get('/logout', authMiddleware.verifyAccessToken, userController.logout);

module.exports = router;
