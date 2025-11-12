const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const { verifyAdminToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/agencies');
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
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  }
});

// Routes
router.post('/register', upload.fields([
  { name: 'company_incorporation_trade_license', maxCount: 1 },
  { name: 'tax_registration_document', maxCount: 1 },
  { name: 'agency_bank_details', maxCount: 1 },
  { name: 'agency_owner_passport', maxCount: 1 },
  { name: 'agency_owner_photo', maxCount: 1 }
]), agencyController.registerValidation, agencyController.registerAgency);

router.post('/verify-otp', agencyController.otpValidation, agencyController.verifyOtp);

router.post('/send-otp', agencyController.sendOtp);

router.post('/resend-otp', agencyController.resendOtp);

router.get('/', verifyAdminToken, agencyController.getAllAgencies);

router.post('/update-status', verifyAdminToken, agencyController.updateAgencyStatus);

module.exports = router;