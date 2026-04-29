const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let mongoUri;

const connectDB = async () => {
    try {
        // Check if already connected
        if (mongoose.connection.readyState === 1) {
            console.log(`✓ MongoDB Already Connected: ${mongoose.connection.host}`);
            return mongoose.connection;
        }

        if (process.env.MONGO_URI) {
            mongoUri = process.env.MONGO_URI;
        } else if (!mongoUri) {
            console.log('No MONGO_URI found, using MongoMemoryServer');
            mongoServer = await MongoMemoryServer.create();
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
