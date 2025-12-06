const express = require('express');
const router = express.Router();
const AdminRealEstateProfessionalController = require('../controllers/adminRealEstateProfessionalController');
const {
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');

// Instantiate the controller class
const controller = new AdminRealEstateProfessionalController();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Admin Real Estate Professionals test route working!' });
});

// Get all real estate professionals (admin only)
router.get('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.getAll
);

// Get real estate professional by ID (admin only)
router.get('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.getById
);

// Create a new real estate professional (admin only)
router.post('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.upload.single('image'),
  controller.createValidation,
  controller.create
);

// Update real estate professional (admin only)
router.put('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.upload.single('image'),
  controller.updateValidation,
  controller.update
);

// Delete real estate professional (admin only)
router.delete('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.delete
);

module.exports = router;