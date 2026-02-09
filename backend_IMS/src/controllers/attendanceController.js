const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Punch In
// @route   POST /attendance/punch-in
// @access  Private
const punchIn = async (req, res, next) => {
    try {
        // Check if already punched in without punch out
        const existingAttendance = await Attendance.findOne({
            userId: req.user._id,
            punchOutTime: null,
        });

        if (existingAttendance) {
            res.status(400);
            throw new Error('You are already punched in.');
        }

        const attendance = await Attendance.create({
            userId: req.user._id,
            punchInTime: new Date(),
        });

        res.status(201).json(attendance);
    } catch (error) {
        next(error);
    }
};

// @desc    Punch Out
// @route   POST /attendance/punch-out
// @access  Private
const punchOut = async (req, res, next) => {
    try {
        const attendance = await Attendance.findOne({
            userId: req.user._id,
            punchOutTime: null,
        });

        if (!attendance) {
            res.status(400);
            throw new Error('You have not punched in yet.');
        }

        attendance.punchOutTime = new Date();

        // Calculate hours
        const diff = Math.abs(attendance.punchOutTime - attendance.punchInTime); // in ms
        const hours = diff / (1000 * 60 * 60);
        attendance.totalHours = hours;

        // Standard shift logic could be added here for overtime calculation
        const standardShift = 8;
        if (hours > standardShift) {
            attendance.overtime = hours - standardShift;
        }

        await attendance.save();

        // Update user dailyHours (simplified, just adding last shift)
        const user = await User.findById(req.user._id);
        user.dailyHours += hours;
        await user.save();

        res.json(attendance);
    } catch (error) {
        next(error);
    }
};

// @desc    Get user attendance logs
// @route   GET /attendance/:userId
// @access  Private (Admin or Self)
const getAttendanceLogs = async (req, res, next) => {
    try {
        // Check if requesting own logs or if admin
        if (req.user._id.toString() !== req.params.userId && req.user.role !== 'Admin') {
            res.status(403);
            throw new Error('Not authorized to view these logs');
        }

        const logs = await Attendance.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all attendance (Admin only)
// @route   GET /attendance
// @access  Private/Admin
const getAllAttendance = async (req, res, next) => {
    try {
        const logs = await Attendance.find({}).populate('userId', 'fullName role').sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        next(error);
    }
};

module.exports = { punchIn, punchOut, getAttendanceLogs, getAllAttendance };
