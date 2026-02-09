const express = require('express');
const router = express.Router();
const { addItem, getItems, updateItem, deleteItem } = require('../controllers/inventoryController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/', protect, authorize('Admin', 'Staff'), addItem);
router.get('/', protect, getItems);
router.put('/:id', protect, authorize('Admin', 'Staff'), updateItem);
router.delete('/:id', protect, authorize('Admin'), deleteItem);

module.exports = router;
