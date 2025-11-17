const express = require('express');
const router = express.Router();
const publishedWorkController = require('../controllers/publishedWorkController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission
} = require('../middleware/auth');

// Admin routes (require admin authentication and permissions) - must come before public routes
router.get('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publishedWorkController.getAll);
router.post('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publishedWorkController.createValidation, publishedWorkController.create);
router.get('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publishedWorkController.getById);
router.put('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publishedWorkController.updateValidation, publishedWorkController.update);
router.delete('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publishedWorkController.delete);

// Public routes (no authentication required for reading)
router.get('/', publishedWorkController.getAll);
router.get('/featured', publishedWorkController.getFeatured);
router.get('/search', publishedWorkController.search);
router.get('/:id', publishedWorkController.getById);
router.get('/sn/:sn', publishedWorkController.getBySN);

// Bulk operations (admin only)
router.post('/admin/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publishedWorkController.bulkCreate);
router.put('/admin/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publishedWorkController.bulkUpdate);
router.delete('/admin/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publishedWorkController.bulkDelete);

// Feature toggle (admin only)
router.patch('/admin/:id/feature', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publishedWorkController.toggleFeatured);

// Extract publication info from URL (admin only)
router.post('/admin/extract-info', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_publications'), publishedWorkController.extractPublicationInfo);

module.exports = router;