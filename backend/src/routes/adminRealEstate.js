const express = require('express');
const router = express.Router();
const AdminRealEstateController = require('../controllers/adminRealEstateController');
const {
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');

// Instantiate the controller class
const controller = new AdminRealEstateController();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Admin Real Estate test route working!' });
});

// Get all real estate records (public for GET)
router.get('/',
  controller.getAll
);

// Get real estate record by ID (public for GET)
router.get('/:id',
  controller.getById
);

// Create a new real estate record (admin only)
router.post('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.upload.array('images', 10),
  controller.createValidation,
  controller.create
);

// Update real estate record (admin only)
router.put('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.upload.array('images', 10),
  controller.updateValidation,
  controller.update
);

// Delete real estate record (admin only)
router.delete('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.delete
);

module.exports = router;