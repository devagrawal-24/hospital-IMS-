const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getUserProfile, deleteUser, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/login', loginUser);
router.post('/register', protect, authorize('Admin'), registerUser);
router.get('/profile', protect, getUserProfile);
router.get('/users', protect, authorize('Admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('Admin'), deleteUser);

module.exports = router;
