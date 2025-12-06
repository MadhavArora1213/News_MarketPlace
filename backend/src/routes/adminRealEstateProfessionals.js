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
  (req, res, next) => {
    console.log('AdminRealEstateProfessionals POST route - After upload middleware');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request file:', req.file ? { originalname: req.file.originalname, size: req.file.size } : 'No file');
    next();
  },
  controller.createValidation,
  (req, res, next) => {
    console.log('AdminRealEstateProfessionals POST route - After validation middleware');
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      console.error('AdminRealEstateProfessionals POST route - Validation errors from middleware:', errors.array());
    } else {
      console.log('AdminRealEstateProfessionals POST route - Validation passed in middleware');
    }
    next();
  },
  controller.create
);

// Update real estate professional (admin only)
router.put('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.upload.single('image'),
  (req, res, next) => {
    console.log('AdminRealEstateProfessionals PUT route - After upload middleware');
    console.log('Request params:', req.params);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request file:', req.file ? { originalname: req.file.originalname, size: req.file.size } : 'No file');
    next();
  },
  controller.updateValidation,
  (req, res, next) => {
    console.log('AdminRealEstateProfessionals PUT route - After validation middleware');
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      console.error('AdminRealEstateProfessionals PUT route - Validation errors from middleware:', errors.array());
    } else {
      console.log('AdminRealEstateProfessionals PUT route - Validation passed in middleware');
    }
    next();
  },
  controller.update
);

// Delete real estate professional (admin only)
router.delete('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.delete
);

module.exports = router;