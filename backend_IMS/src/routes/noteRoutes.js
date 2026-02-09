const express = require('express');
const router = express.Router();
const { createNote, getAllNotes, getUserNotes, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createNote);
router.get('/', protect, getAllNotes);
router.get('/:userId', protect, getUserNotes);
router.delete('/:id', protect, deleteNote);

module.exports = router;
