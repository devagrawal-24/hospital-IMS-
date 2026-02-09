const Inventory = require('../models/Inventory');

// @desc    Add item
// @route   POST /inventory
// @access  Private (Admin, Staff)
const addItem = async (req, res, next) => {
    const { itemName, category, quantity, status } = req.body;

    try {
        const item = await Inventory.create({
            itemName,
            category,
            quantity,
            status,
            addedBy: req.user._id,
        });
        res.status(201).json(item);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all items
// @route   GET /inventory
// @access  Private
const getItems = async (req, res, next) => {
    try {
        const items = await Inventory.find({}).populate('addedBy', 'fullName');
        res.json(items);
    } catch (error) {
        next(error);
    }
};

// @desc    Update item
// @route   PUT /inventory/:id
// @access  Private (Admin, Staff)
const updateItem = async (req, res, next) => {
    try {
        const item = await Inventory.findById(req.params.id);

        if (item) {
            item.itemName = req.body.itemName || item.itemName;
            item.category = req.body.category || item.category;
            item.quantity = req.body.quantity !== undefined ? req.body.quantity : item.quantity;
            item.status = req.body.status || item.status;

            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404);
            throw new Error('Item not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete item
// @route   DELETE /inventory/:id
// @access  Private (Admin)
const deleteItem = async (req, res, next) => {
    try {
        const item = await Inventory.findById(req.params.id);

        if (item) {
            await item.deleteOne();
            res.json({ message: 'Item removed' });
        } else {
            res.status(404);
            throw new Error('Item not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { addItem, getItems, updateItem, deleteItem };
