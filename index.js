require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const database = 'userdb';
const mongoConnection = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${database}`;
const connectMongoDb = () => {
    console.log('Connecting to Mongo DB ...');
    mongoose.connect(mongoConnection, {authSource: 'admin', useUnifiedTopology: true})
    .then(() => console.log('Successfully connected to Mongo DB'))
    .catch((err) => {
        console.error('Error while connecting to Mongo DB:', err);
        setTimeout(connectMongoDb, 5000);
    });
};

connectMongoDb();

const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');

const app = express();

app.use(express.json());

// Test
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Hello world'
    });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening on port', port, '...'));
