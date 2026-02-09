const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

dotenv.config();

connectDB();

const listUsers = async () => {
    try {
        const users = await User.find({});
        console.log('Users in DB:');
        users.forEach(user => {
            console.log(`${user.username}: ${user.password} (role: ${user.role})`);
        });
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

listUsers();