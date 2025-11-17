const express = require('express');
const router = express.Router();
const articleSubmissionController = require('../controllers/articleSubmissionController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

console.log('Admin Article Submissions routes file loaded - FULL VERSION');

// Configure multer for image uploads (same as in controller)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/article-submissions');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'article-submission-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const {
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission
} = require('../middleware/auth');

// Test route without middleware
router.get('/test', (req, res) => {
  console.log('Test route hit - full version working');
  res.json({ message: 'Full test route working!' });
});

// Admin routes for article submissions
router.get('/',
  (req, res, next) => {
    console.log('Admin article submissions route hit');
    next();
  },
  articleSubmissionController.getAllSubmissions
);

router.get('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission('manage_publications'),
  articleSubmissionController.getSubmissionById
);

router.put('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission('manage_publications'),
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 }
  ]),
  articleSubmissionController.updateValidation,
  articleSubmissionController.updateSubmission
);

router.delete('/:id',
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission('manage_publications'),
  articleSubmissionController.deleteSubmission
);

router.put('/:id/approve',
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission('approve_publications'),
  articleSubmissionController.approveSubmission
);

router.put('/:id/reject',
  verifyAdminToken,
  requireAdminPanelAccess,
  requireAdminPermission('approve_publications'),
  articleSubmissionController.rejectSubmission
);

module.exports = router;