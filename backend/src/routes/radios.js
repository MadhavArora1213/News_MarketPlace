const express = require('express');
const router = express.Router();
const radioController = require('../controllers/radioController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminRoleLevel,
  requireOwnership,
  requireAdminPermission,
  requireAdminPanelAccess
} = require('../middleware/auth');

// User routes (authenticated users can view radios)
router.get('/', verifyToken, radioController.getAll);

// Admin routes (admins can manage all radios)
router.get('/admin', verifyAdminToken, requireAdminPanelAccess, radioController.getAll);
router.post('/admin', verifyAdminToken, requireAdminPanelAccess, radioController.createValidation, radioController.create);
router.get('/admin/:id', verifyAdminToken, requireAdminPanelAccess, radioController.getById);
router.put('/admin/:id', verifyAdminToken, requireAdminPanelAccess, radioController.updateValidation, radioController.update);
router.delete('/admin/:id', verifyAdminToken, requireAdminPanelAccess, radioController.delete);

// Get group for a specific radio
router.get('/:id/group', verifyToken, radioController.getGroup);

// User parameterized routes
router.get('/:id', verifyToken, radioController.getById);

module.exports = router;