const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    punchInTime: { type: Date, required: true },
    punchOutTime: { type: Date },
    totalHours: { type: Number, default: 0 },
    overtime: { type: Number, default: 0 },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Attendance', attendanceSchema);
