const Agency = require('../models/Agency');
const emailService = require('../services/emailService');
const otpService = require('../services/otpService');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Removed pending agencies storage as agencies are created immediately

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

class AgencyController {
  // Validation rules for agency registration
  registerValidation = [
    body('agency_name').trim().isLength({ min: 1 }).withMessage('Agency name is required'),
    body('agency_email').isEmail().normalizeEmail().withMessage('Valid agency email is required'),
    body('agency_owner_name').trim().isLength({ min: 1 }).withMessage('Agency owner name is required'),
    body('agency_owner_email').optional().isEmail().normalizeEmail().withMessage('Valid owner email is required'),
    body('agency_founded_year').optional().isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Valid founded year is required'),
    body('agency_website').optional().isURL().withMessage('Valid website URL is required'),
    body('agency_ig').optional().isURL().withMessage('Valid Instagram URL is required'),
    body('agency_linkedin').optional().isURL().withMessage('Valid LinkedIn URL is required'),
    body('agency_facebook').optional().isURL().withMessage('Valid Facebook URL is required'),
  ];

  otpValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('emailOtp').optional().isLength({ min: 6, max: 6 }).isNumeric().withMessage('Email OTP must be 6 digits'),
    body('phoneOtp').optional().isLength({ min: 6, max: 6 }).isNumeric().withMessage('Phone OTP must be 6 digits'),
    body('whatsappOtp').optional().isLength({ min: 6, max: 6 }).isNumeric().withMessage('WhatsApp OTP must be 6 digits'),
  ];

  // Generate OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Register agency
  async registerAgency(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const agencyData = req.body;

      // Parse numeric fields
      if (agencyData.agency_founded_year) {
        agencyData.agency_founded_year = parseInt(agencyData.agency_founded_year, 10);
      }

      // Handle file uploads
      const uploadedFiles = {};
      if (req.files) {
        Object.keys(req.files).forEach(fieldName => {
          if (req.files[fieldName] && req.files[fieldName][0]) {
            uploadedFiles[fieldName] = req.files[fieldName][0].filename;
          }
        });
      }

      // Map file fields to database fields
      const fileMappings = {
        'company_incorporation_trade_license': 'agency_document_incorporation_trade_license',
        'tax_registration_document': 'agency_document_tax_registration',
        'agency_bank_details': 'agency_bank_details',
        'agency_owner_passport': 'agency_owner_passport',
        'agency_owner_photo': 'agency_owner_photo'
      };

      Object.keys(fileMappings).forEach(formField => {
        if (uploadedFiles[formField]) {
          agencyData[fileMappings[formField]] = uploadedFiles[formField];
        }
      });

      // Map form fields to database fields
      const fieldMappings = {
        'how_did_you_hear': 'how_did_you_hear_about_us'
      };

      Object.keys(fieldMappings).forEach(formField => {
        if (agencyData[formField]) {
          agencyData[fieldMappings[formField]] = agencyData[formField];
          delete agencyData[formField];
        }
      });

      // Check if agency with this email already exists
      const existingAgency = await Agency.findAll().then(agencies =>
        agencies.find(agency => agency.agency_email === agencyData.agency_email)
      );
      if (existingAgency) {
        return res.status(400).json({ error: 'Agency with this email already exists' });
      }

      // Create agency in database
      const agency = await Agency.create(agencyData);

      res.status(201).json({
        message: 'Agency registered successfully',
        agency: agency.toJSON()
      });
    } catch (error) {
      console.error('Agency registration error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Verify individual OTP
  async verifyOtp(req, res) {
    try {
      const { type, otp, email, phone, whatsapp } = req.body;

      if (!type || !otp) {
        return res.status(400).json({ error: 'Type and OTP are required' });
      }

      // Get the contact info based on type
      const contactInfo = type === 'email' ? email : (type === 'phone' ? phone : whatsapp);

      if (!contactInfo) {
        return res.status(400).json({ error: `${type} contact information is required for verification` });
      }

      // Verify the specific OTP from temp storage
      console.log(`Verifying ${type} OTP for ${contactInfo}`);
      console.log('Stored OTPs keys:', Object.keys(global.tempOtps || {}));
      const otpData = global.tempOtps?.[contactInfo];
      console.log('OTP data found:', !!otpData);
      console.log('Received OTP:', otp);
      console.log('Stored OTP:', otpData?.otp);
      console.log('OTP expired?', Date.now() > (otpData?.expiry || 0));

      if (!otpData) {
        console.log('No OTP data found for contact:', contactInfo);
        return res.status(400).json({ error: `No OTP found for ${type}. Please request a new OTP.` });
      }

      if (otpData.otp !== otp) {
        console.log('OTP mismatch:', otpData.otp, '!==', otp);
        return res.status(400).json({ error: `Invalid ${type} OTP. Please check and try again.` });
      }

      if (Date.now() > otpData.expiry) {
        console.log('OTP expired');
        // Clean up expired OTP
        delete global.tempOtps[contactInfo];
        return res.status(400).json({ error: `Expired ${type} OTP. Please request a new OTP.` });
      }

      // Clean up temp OTPs
      delete global.tempOtps[contactInfo];

      // Return success for OTP verification
      res.json({
        message: `${type} verified successfully`,
        fullyVerified: true
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Send individual OTP (only email OTP supported)
  async sendOtp(req, res) {
    try {
      const { type, email } = req.body;
      
      if (type !== 'email') {
        return res.status(400).json({ error: 'Only email OTP is supported' });
      }
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`Generated ${type} OTP: ${otp}`);

      await otpService.sendEmailOtp(email, otp);
      // Store OTP temporarily
      if (!global.tempOtps) global.tempOtps = {};
      global.tempOtps[email] = { otp, expiry: Date.now() + 10 * 60 * 1000 };

      res.json({ message: `${type} OTP sent successfully`, otp: otp });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }

  // Resend OTP
  async resendOtp(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Regenerate OTP
      const emailOtp = this.generateOTP();
      console.log(`Regenerated email OTP: ${emailOtp}`);

      // Send OTP
      await otpService.sendEmailOtp(email, emailOtp);

      // Store OTP temporarily
      if (!global.tempOtps) global.tempOtps = {};
      global.tempOtps[email] = { otp: emailOtp, expiry: Date.now() + 10 * 60 * 1000 };

      res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get all agencies (admin only)
  async getAllAgencies(req, res) {
    try {
      const agencies = await Agency.findAll();
      res.json({
        agencies: agencies.map(agency => agency.toJSON())
      });
    } catch (error) {
      console.error('Get all agencies error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update agency status (admin only)
  async updateAgencyStatus(req, res) {
    try {
      const { id, status } = req.body;

      if (!id || !status) {
        return res.status(400).json({ error: 'Agency ID and status are required' });
      }

      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or rejected' });
      }

      const agency = await Agency.findById(id);
      if (!agency) {
        return res.status(404).json({ error: 'Agency not found' });
      }

      await agency.update({ status });

      // Send email notification
      try {
        let subject, htmlContent;
        if (status === 'approved') {
          subject = 'Agency Registration Approved';
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Agency Registration Approved</h2>
              <p>Dear ${agency.agency_owner_name},</p>
              <p>Congratulations! Your agency "${agency.agency_name}" has been approved.</p>
              <p>You can now access all agency features on our platform.</p>
              <p>Best regards,<br>News Marketplace Team</p>
            </div>
          `;
        } else if (status === 'rejected') {
          subject = 'Agency Registration Update';
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Agency Registration Update</h2>
              <p>Dear ${agency.agency_owner_name},</p>
              <p>We regret to inform you that your agency "${agency.agency_name}" registration has been rejected.</p>
              <p>Please contact our support team for more information.</p>
              <p>Best regards,<br>News Marketplace Team</p>
            </div>
          `;
        }

        if (subject && htmlContent) {
          await emailService.sendCustomEmail(agency.agency_email, subject, htmlContent);
        }
      } catch (emailError) {
        console.error('Error sending status update email:', emailError);
        // Don't fail the request if email fails
      }

      res.json({
        message: 'Agency status updated successfully',
        agency: agency.toJSON()
      });
    } catch (error) {
      console.error('Update agency status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AgencyController();