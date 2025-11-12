const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');
const { verifyToken, verifyAdminToken } = require('../middleware/auth');
const { publicationSubmitLimit } = require('../middleware/rateLimit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/websites');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow common document and image types
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Maximum 5 files
  }
});

// User Routes (require user authentication)
router.post('/send-otp', verifyToken, publicationSubmitLimit, websiteController.sendOtp);

router.post('/submit', verifyToken, publicationSubmitLimit, upload.fields([
  { name: 'website_registration_document', maxCount: 1 },
  { name: 'tax_document', maxCount: 1 },
  { name: 'bank_details', maxCount: 1 },
  { name: 'owner_passport', maxCount: 1 },
  { name: 'general_contact_details', maxCount: 1 }
]), websiteController.submitValidation, websiteController.submitWebsite);

router.post('/verify-otp', verifyToken, publicationSubmitLimit, websiteController.otpValidation, websiteController.verifyOtp);

// Admin Routes (require admin authentication)
router.get('/', verifyAdminToken, websiteController.getAll);
router.get('/:id', verifyAdminToken, websiteController.getById);
router.put('/:id/status', verifyAdminToken, websiteController.updateStatusValidation, websiteController.updateStatus);
router.delete('/:id', verifyAdminToken, websiteController.delete);
router.post('/bulk/status', verifyAdminToken, websiteController.bulkUpdateStatusValidation, websiteController.bulkUpdateStatus);
router.post('/bulk/delete', verifyAdminToken, websiteController.bulkDeleteValidation, websiteController.bulkDelete);

module.exports = router;