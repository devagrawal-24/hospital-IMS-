const Note = require('../models/Note');

// @desc    Create note
// @route   POST /notes
// @access  Private
const createNote = async (req, res, next) => {
    const { title, content } = req.body;

    try {
        const note = await Note.create({
            userId: req.user._id,
            title,
            content,
        });
        res.status(201).json(note);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all notes
// @route   GET /notes
// @access  Private
const getAllNotes = async (req, res, next) => {
    try {
        const notes = await Note.find({})
            .populate('userId', 'fullName role')
            .sort({ timestamp: -1 });
        res.json(notes);
    } catch (error) {
        next(error);
    }
};

// @desc    Get user notes
// @route   GET /notes/:userId
// @access  Private (Self or Admin)
const getUserNotes = async (req, res, next) => {
    try {
        if (req.user._id.toString() !== req.params.userId && req.user.role !== 'Admin') {
            res.status(403);
            throw new Error('Not authorized to view these notes');
        }

        const notes = await Note.find({ userId: req.params.userId }).sort({ timestamp: -1 });
        res.json(notes);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete note
// @route   DELETE /notes/:id
// @access  Private (Self or Admin)
const deleteNote = async (req, res, next) => {
    try {
        const note = await Note.findById(req.params.id);

        if (note) {
            if (req.user._id.toString() !== note.userId.toString() && req.user.role !== 'Admin') {
                res.status(403);
                throw new Error('Not authorized to delete this note');
            }

            await note.deleteOne();
            res.json({ message: 'Note removed' });
        } else {
            res.status(404);
            throw new Error('Note not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { createNote, getAllNotes, getUserNotes, deleteNote };
