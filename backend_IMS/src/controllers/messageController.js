const Message = require('../models/Message');

// @desc    Send message (Any authenticated user -> Admin)
// @route   POST /messages
// @access  Private
const sendMessage = async (req, res, next) => {
    const { receiverId, content } = req.body;

    try {
        const message = await Message.create({
            senderId: req.user._id,
            receiverId, // Optional: if null, could be broadcast or addressed to 'Admins' generally
            content,
        });
        
        // Populate sender details before responding
        await message.populate('senderId', 'fullName role');
        await message.populate('receiverId', 'fullName role');
        
        res.status(201).json(message);
    } catch (error) {
        next(error);
    }
};

// @desc    Get messages for current user
// @route   GET /messages
// @access  Private (Admin gets all, others get their own)
const getMessages = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        let messages;
        
        // Admin gets all messages
        if (userRole === 'Admin') {
            messages = await Message.find({})
                .populate('senderId', 'fullName role')
                .populate('receiverId', 'fullName role')
                .sort({ createdAt: -1 });
        } else {
            // Non-admin users get messages sent to them or messages they sent to admin
            messages = await Message.find({
                $or: [
                    { senderId: userId }, // Messages they sent
                    { receiverId: userId }, // Messages sent to them
                ]
            })
            .populate('senderId', 'fullName role')
            .populate('receiverId', 'fullName role')
            .sort({ createdAt: -1 });
        }
        
        res.json(messages);
    } catch (error) {
        next(error);
    }
};

module.exports = { sendMessage, getMessages };

