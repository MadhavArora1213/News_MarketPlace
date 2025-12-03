const express = require('express');
const router = express.Router();
const adminPublicationManagementController = require('../controllers/adminPublicationManagementController');
const {
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Admin Publication Management test route working!' });
});

// Get all publication management records (admin only)
router.get('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminPublicationManagementController.getAll
);

// Get publication management record by ID (admin only)
router.get('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminPublicationManagementController.getById
);

// Create a new publication management record (admin only)
router.post('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminPublicationManagementController.createValidation,
  adminPublicationManagementController.create
);

// Update publication management record (admin only)
router.put('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminPublicationManagementController.updateValidation,
  adminPublicationManagementController.update
);

// Delete publication management record (admin only)
router.delete('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminPublicationManagementController.delete
);

module.exports = router;