const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                role: user.role,
                department: user.department,
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid username or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Register a new user (Admin only)
// @route   POST /auth/register
// @access  Private/Admin
const registerUser = async (req, res, next) => {
    const { fullName, username, password, role, department } = req.body;

    try {
        const userExists = await User.findOne({ username });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({
            fullName,
            username,
            password, // Pre-save hook hashes it
            role,
            department,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                role: user.role,
                department: user.department,
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                role: user.role,
                department: user.department,
                dailyHours: user.dailyHours,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user (Admin only)
// @route   DELETE /auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);

        if (user) {
            res.json({ message: 'User deleted successfully', userId: id });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users (Admin only)
// @route   GET /auth/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');

        res.json(users);
    } catch (error) {
        next(error);
    }
};

module.exports = { loginUser, registerUser, getUserProfile, deleteUser, getAllUsers };
