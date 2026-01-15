const express = require('express');
const router = express.Router();
const adminPublicationManagementController = require('../controllers/adminPublicationManagementController');
const {
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');
// Instantiate the controller class
const controller = new adminPublicationManagementController();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Admin Publication Management test route working!' });
});

// Download template (admin only)
router.get('/template',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.downloadTemplate
);

// Export CSV (admin only)
router.get('/export-csv',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.exportCSV
);

// Bulk upload (admin only)
router.post('/bulk-upload',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.csvUpload.single('file'),
  controller.bulkUpload
);

// Get all publication management records (public for GET)
router.get('/',
  controller.getAll
);

// Get publication management record by ID (public for GET)
router.get('/:id',
  controller.getById
);

// Create a new publication management record (admin only)
router.post('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.upload.single('image'),
  controller.createValidation,
  controller.create
);

// Update publication management record (admin only)
router.put('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.upload.single('image'),
  controller.updateValidation,
  controller.update
);

// Delete publication management record (admin only)
router.delete('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.delete
);

module.exports = router;