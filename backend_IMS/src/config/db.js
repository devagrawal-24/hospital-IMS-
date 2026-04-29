const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoUri;

const connectDB = async () => {
    try {
        if (process.env.MONGO_URI) {
            mongoUri = process.env.MONGO_URI;
        } else if (!mongoUri) {
            console.log('No MONGO_URI found, using MongoMemoryServer');
            const mongoServer = await MongoMemoryServer.create();
            mongoUri = mongoServer.getUri();
        }

        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
