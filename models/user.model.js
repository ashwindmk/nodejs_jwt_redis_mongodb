const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true,
        min: 8,
        max: 255
    },
    password: {
        type: String,
        require: true,
        min: 8,
        max: 255
    }
});

module.exports = mongoose.model('User', userSchema, 'users');
