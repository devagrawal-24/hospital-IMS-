const express = require('express');
const router = express.Router();
const { punchIn, punchOut, getAttendanceLogs, getAllAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/punch-in', protect, punchIn);
router.post('/punch-out', protect, punchOut);
router.get('/:userId', protect, getAttendanceLogs);
router.get('/', protect, authorize('Admin'), getAllAttendance);

module.exports = router;
