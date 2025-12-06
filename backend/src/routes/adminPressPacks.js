const express = require('express');
const router = express.Router();
const AdminPressPackController = require('../controllers/adminPressPackController');
const {
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission
} = require('../middleware/auth');

const adminPressPackController = new AdminPressPackController();

// All routes require admin authentication and panel access
router.use(verifyAdminToken);
router.use(requireAdminPanelAccess);
router.use(requireAdminPermission('manage_publications'));

// Get all press packs (admin management)
router.get('/', adminPressPackController.getAll);

// Get press pack by ID
router.get('/:id', adminPressPackController.getById);

// Create a new press pack
router.post('/', adminPressPackController.upload.single('image'), adminPressPackController.createValidation, adminPressPackController.create);

// Update press pack
router.put('/:id', adminPressPackController.upload.single('image'), adminPressPackController.updateValidation, adminPressPackController.update);

// Delete press pack
router.delete('/:id', adminPressPackController.delete);

module.exports = router;