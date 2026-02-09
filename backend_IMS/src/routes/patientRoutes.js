const express = require('express');
const router = express.Router();
const { addPatient, getPatients, getPatientById, updatePatient } = require('../controllers/patientController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/', protect, authorize('Admin'), addPatient);
router.get('/', protect, authorize('Admin', 'Doctor', 'Nurse'), getPatients);
router.get('/:id', protect, getPatientById);
router.put('/:id', protect, authorize('Admin', 'Doctor'), updatePatient);

module.exports = router;
