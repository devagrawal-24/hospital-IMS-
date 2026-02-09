const Patient = require('../models/Patient');

// @desc    Add a patient (Admin only)
// @route   POST /patients
// @access  Private/Admin
const addPatient = async (req, res, next) => {
    const { name, age, condition, appointmentDate, appointmentTime, notes, assignedDoctorId } = req.body;

    try {
        const patient = await Patient.create({
            name,
            age,
            condition,
            appointmentDate,
            appointmentTime,
            notes,
            assignedDoctorId,
        });
        res.status(201).json(patient);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all patients
// @route   GET /patients
// @access  Private (Admin, Doctor, Nurse)
const getPatients = async (req, res, next) => {
    try {
        const patients = await Patient.find({}).populate('assignedDoctorId', 'fullName');
        res.json(patients);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single patient
// @route   GET /patients/:id
// @access  Private
const getPatientById = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id).populate('assignedDoctorId', 'fullName');
        if (patient) {
            res.json(patient);
        } else {
            res.status(404);
            throw new Error('Patient not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update patient
// @route   PUT /patients/:id
// @access  Private (Admin, Doctor)
const updatePatient = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (patient) {
            // Allow updates to fields
            patient.name = req.body.name || patient.name;
            patient.age = req.body.age || patient.age;
            patient.condition = req.body.condition || patient.condition;
            patient.status = req.body.status || patient.status;
            patient.notes = req.body.notes || patient.notes;
            patient.appointmentDate = req.body.appointmentDate || patient.appointmentDate;
            patient.appointmentTime = req.body.appointmentTime || patient.appointmentTime;
            patient.assignedDoctorId = req.body.assignedDoctorId || patient.assignedDoctorId;

            if (req.body.lastCheckup) {
                patient.lastCheckup = req.body.lastCheckup;
            }

            const updatedPatient = await patient.save();
            res.json(updatedPatient);
        } else {
            res.status(404);
            throw new Error('Patient not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { addPatient, getPatients, getPatientById, updatePatient };
