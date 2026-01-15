const express = require('express');
const router = express.Router();
const adminPaparazziCreationsController = require('../controllers/adminPaparazziCreationsController');
const {
  verifyAdminToken,
  requireAdminPanelAccess
} = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for CSV uploads
const storage = multer.memoryStorage();
const csvUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Admin Paparazzi Creations test route working!' });
});

// Admin CSV operations (must come before parameterized routes)
router.get('/template', verifyAdminToken, requireAdminPanelAccess, adminPaparazziCreationsController.downloadTemplate);
router.get('/export-csv', verifyAdminToken, requireAdminPanelAccess, adminPaparazziCreationsController.exportCSV);
router.post('/bulk-upload', verifyAdminToken, requireAdminPanelAccess, csvUpload.single('file'), adminPaparazziCreationsController.bulkUpload);
router.post('/bulk-delete', verifyAdminToken, requireAdminPanelAccess, adminPaparazziCreationsController.bulkDelete);


// Public routes for paparazzi creations
router.get('/public/list', adminPaparazziCreationsController.getPublic);
router.get('/public/:id', adminPaparazziCreationsController.getPublicById);

// Admin Management Routes
router.get('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminPaparazziCreationsController.getAll
);

router.get('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminPaparazziCreationsController.getById
);

router.post('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminPaparazziCreationsController.createValidation,
  adminPaparazziCreationsController.create
);

router.put('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminPaparazziCreationsController.updateValidation,
  adminPaparazziCreationsController.update
);

router.delete('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  adminPaparazziCreationsController.delete
);

module.exports = router;