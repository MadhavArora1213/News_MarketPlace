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

// Bulk upload (admin only)
router.post('/bulk-upload',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.csvUpload.single('file'),
  controller.bulkUpload
);

// Download CSV of all records (admin only)
router.get('/export-csv',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.downloadCSV
);

// Download template (admin only)
router.get('/template',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.downloadTemplate
);

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

// Middleware to parse form data before validation
const parseFormData = (req, res, next) => {
  console.log('AdminRealEstateProfessionals - Parsing form data middleware');

  // Parse languages field if it's a JSON string
  if (req.body.languages && typeof req.body.languages === 'string') {
    console.log('Parsing languages:', req.body.languages);
    try {
      req.body.languages = JSON.parse(req.body.languages);
      console.log('Languages parsed successfully:', req.body.languages);
    } catch (e) {
      console.error('Languages parsing error:', e);
      return res.status(400).json({
        error: 'Validation failed',
        details: [{ msg: 'Languages must be a valid JSON array' }]
      });
    }
  }

  // Parse boolean fields that come as strings from FormData
  const booleanFields = ['verified_tick', 'real_estate_agency_owner', 'real_estate_agent', 'developer_employee', 'is_active'];
  booleanFields.forEach(field => {
    if (req.body[field] !== undefined) {
      console.log(`Parsing boolean ${field}:`, req.body[field]);
      if (req.body[field] === 'true') req.body[field] = true;
      else if (req.body[field] === 'false') req.body[field] = false;
      console.log(`${field} parsed to:`, req.body[field]);
    }
  });

  // Parse numeric fields
  if (req.body.no_of_followers !== undefined) {
    console.log('Parsing no_of_followers:', req.body.no_of_followers);
    const followers = parseInt(req.body.no_of_followers);
    if (isNaN(followers)) {
      console.error('Invalid no_of_followers:', req.body.no_of_followers);
      return res.status(400).json({
        error: 'Validation failed',
        details: [{ msg: 'Number of followers must be a valid number' }]
      });
    }
    req.body.no_of_followers = followers;
    console.log('no_of_followers parsed to:', followers);
  }

  next();
};

// Create a new real estate professional (admin only)
router.post('/',
  verifyAdminToken,
  requireAdminPanelAccess,
  controller.upload.single('image'),
  parseFormData,
  (req, res, next) => {
    console.log('AdminRealEstateProfessionals POST route - After parsing middleware');
    console.log('Parsed body keys:', Object.keys(req.body));
    console.log('Languages type:', Array.isArray(req.body.languages) ? 'array' : typeof req.body.languages);
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
  parseFormData,
  (req, res, next) => {
    console.log('AdminRealEstateProfessionals PUT route - After parsing middleware');
    console.log('Request params:', req.params);
    console.log('Parsed body keys:', Object.keys(req.body));
    console.log('Languages type:', Array.isArray(req.body.languages) ? 'array' : typeof req.body.languages);
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