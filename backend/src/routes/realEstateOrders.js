const express = require('express');
const router = express.Router();
const realEstateOrderController = require('../controllers/realEstateOrderController');
const { authenticateUser } = require('../middleware/auth');
const { authenticateAdmin } = require('../middleware/auth');

// User routes (require authentication)
router.post('/', authenticateUser, realEstateOrderController.createValidation, realEstateOrderController.create);

// Get orders by professional (for professional dashboard)
router.get('/professional/:professionalId', authenticateUser, realEstateOrderController.getOrdersByProfessional);

// Admin routes (require admin authentication)
router.get('/', authenticateAdmin, realEstateOrderController.getAll);
router.get('/:id', authenticateAdmin, realEstateOrderController.getById);
router.put('/:id', authenticateAdmin, realEstateOrderController.update);
router.delete('/:id', authenticateAdmin, realEstateOrderController.delete);

module.exports = router;