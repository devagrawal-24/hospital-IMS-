const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Message = require('./src/models/Message');
const connectDB = require('./src/config/db');

dotenv.config();

connectDB();

const clearMessages = async () => {
    try {
        await Message.deleteMany({});
        console.log('All messages cleared!');
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

clearMessages();