const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    condition: { type: String, required: true },
    appointmentDate: { type: Date },
    appointmentTime: { type: String },
    status: { type: String, enum: ['Admitted', 'Discharged', 'Pending'], default: 'Pending' },
    lastCheckup: { type: Date },
    notes: { type: String },
    assignedDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Patient', patientSchema);
