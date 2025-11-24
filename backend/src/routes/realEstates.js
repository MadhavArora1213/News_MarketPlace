const express = require('express');
const router = express.Router();
const realEstateController = require('../controllers/realEstateController');
const { verifyToken: authenticateUser, verifyAdminToken: authenticateAdmin } = require('../middleware/auth');
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
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10 // Maximum 10 images
  }
});

// User routes (require authentication)
router.post('/',
  authenticateUser,
  upload.fields([{ name: 'images', maxCount: 10 }]),
  realEstateController.createValidation,
  realEstateController.create
);

router.get('/my',
  authenticateUser,
  realEstateController.getMyRealEstates
);

router.put('/:id',
  authenticateUser,
  upload.fields([{ name: 'images', maxCount: 10 }]),
  realEstateController.updateValidation,
  realEstateController.update
);

router.delete('/:id',
  authenticateUser,
  realEstateController.delete
);

// Admin routes (require admin authentication)
router.get('/admin',
  authenticateAdmin,
  realEstateController.getAll
);

router.post('/admin',
  authenticateAdmin,
  upload.fields([{ name: 'images', maxCount: 10 }]),
  realEstateController.adminCreateValidation,
  realEstateController.create
);

router.get('/admin/:id',
  authenticateAdmin,
  realEstateController.getById
);

router.put('/admin/:id',
  authenticateAdmin,
  upload.fields([{ name: 'images', maxCount: 10 }]),
  realEstateController.updateValidation,
  realEstateController.update
);

router.delete('/admin/:id',
  authenticateAdmin,
  realEstateController.delete
);

router.put('/admin/:id/approve',
  authenticateAdmin,
  realEstateController.approveRealEstate
);

router.put('/admin/:id/reject',
  authenticateAdmin,
  realEstateController.rejectRealEstate
);

router.put('/bulk-approve',
  authenticateAdmin,
  realEstateController.bulkApprove
);

router.put('/bulk-reject',
  authenticateAdmin,
  realEstateController.bulkReject
);

// Public routes (no authentication required)
router.get('/',
  realEstateController.getApprovedRealEstates
);

router.get('/approved/:id',
  realEstateController.getApprovedById
);

router.get('/:id',
  realEstateController.getApprovedById
);

module.exports = router;