const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ role: 'Admin' });

        if (adminExists) {
            console.log('Admin user already exists!');
            process.exit();
        }

        // Create default admin
        const adminUser = {
            fullName: 'System Admin',
            username: 'admin',
            password: 'adminpassword123', // Will be hashed by pre-save hook
            role: 'Admin',
            department: 'Management',
        };

        await User.create(adminUser);

        console.log('Data Imported! Default Admin created:');
        console.log('Username: admin');
        console.log('Password: adminpassword123');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
