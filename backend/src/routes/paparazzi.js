const express = require('express');
const router = express.Router();
const paparazziController = require('../controllers/paparazziController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');

// Admin routes (admins can manage all paparazzi) - must come before user routes to avoid conflicts
router.get('/admin', verifyAdminToken, requireAdminPanelAccess, paparazziController.getAll);
router.get('/admin/:id', verifyAdminToken, requireAdminPanelAccess, paparazziController.getById);
router.post('/admin', verifyAdminToken, requireAdminPanelAccess, paparazziController.createValidation, paparazziController.create);
router.put('/admin/:id', verifyAdminToken, requireAdminPanelAccess, paparazziController.updateValidation, paparazziController.update);
router.delete('/admin/:id', verifyAdminToken, requireAdminPanelAccess, paparazziController.delete);

// Admin approval/rejection routes
router.put('/admin/:id/approve', verifyAdminToken, requireAdminPanelAccess, paparazziController.approve);
router.put('/admin/:id/reject', verifyAdminToken, requireAdminPanelAccess, paparazziController.reject);

// User routes (authenticated users can view approved paparazzi and manage their own submissions)
router.get('/', verifyToken, paparazziController.getAll); // Only approved paparazzi
router.post('/', verifyToken, paparazziController.createValidation, paparazziController.create);
router.get('/:id', verifyToken, paparazziController.getById);
router.put('/:id', verifyToken, paparazziController.updateValidation, paparazziController.update); // Only if owned and pending
router.delete('/:id', verifyToken, paparazziController.delete); // Only if owned and pending

module.exports = router;