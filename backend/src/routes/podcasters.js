const express = require('express');
const router = express.Router();
const podcasterController = require('../controllers/podcasterController');
const {
  verifyToken,
  verifyAdminToken,
  requireAdminRoleLevel,
  requireOwnership,
  requireAdminPermission,
  requireAdminPanelAccess
} = require('../middleware/auth');
const { podcasterSubmitLimit } = require('../middleware/rateLimit');

// Configure multer for image uploads (same as in controller)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads (using memory storage for S3)
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF images are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Maximum 1 image file
  }
});

// Public routes (no authentication required)
router.get('/approved', podcasterController.getApprovedPodcasters);
router.get('/approved/:id', podcasterController.getApprovedById);

// File upload route
router.post('/upload-file', upload.single('file'), podcasterController.uploadFile);

// User routes (authenticated users can create and view their own podcaster submissions)
router.post('/', verifyToken, podcasterSubmitLimit, podcasterController.createValidation, podcasterController.create);
router.get('/my', verifyToken, podcasterController.getMyPodcasters);

// Admin routes (admins can manage all podcaster submissions)
router.get('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_podcasters'), podcasterController.getAll);
router.post('/admin', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_podcasters'), upload.single('image'), podcasterController.adminCreateValidation, podcasterController.create);
router.get('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_podcasters'), podcasterController.getById);
router.put('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_podcasters'), upload.single('image'), podcasterController.updateValidation, podcasterController.update);
router.put('/admin/:id/approve', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_podcasters'), podcasterController.approvePodcaster);
router.put('/admin/:id/reject', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_podcasters'), podcasterController.rejectPodcaster);
router.delete('/admin/:id', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_podcasters'), podcasterController.delete);

// User parameterized routes (users can view and edit their own submissions)
router.get('/:id', verifyToken, podcasterController.getById);
router.put('/:id', verifyToken, requireOwnership('podcaster'), upload.single('image'), podcasterController.updateValidation, podcasterController.update);
router.delete('/:id', verifyToken, requireOwnership('podcaster'), podcasterController.delete);

// Bulk operations routes (admin only)
router.put('/bulk-approve', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_podcasters'), podcasterController.bulkApprove);
router.put('/bulk-reject', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_podcasters'), podcasterController.bulkReject);
router.delete('/bulk', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('manage_podcasters'), (req, res) => {
  // Bulk delete implementation would go here
  res.status(501).json({ error: 'Bulk delete not implemented yet' });
});

// Status management (admin only)
router.patch('/:id/status', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_podcasters'), (req, res) => {
  // Status update implementation would go here
  res.status(501).json({ error: 'Status update not implemented yet' });
});

// Approval/Rejection endpoints (admin only)
router.post('/:id/approve', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_podcasters'), podcasterController.approvePodcaster);
router.post('/:id/reject', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_podcasters'), podcasterController.rejectPodcaster);

// Bulk approval/rejection endpoints (admin only)
router.put('/bulk-approve', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_podcasters'), podcasterController.bulkApprove);
router.put('/bulk-reject', verifyAdminToken, requireAdminPanelAccess, requireAdminPermission('approve_podcasters'), podcasterController.bulkReject);

module.exports = router;