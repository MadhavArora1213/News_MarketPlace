const Paparazzi = require('../models/Paparazzi');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { body, validationResult } = require('express-validator');

class PaparazziController {

  // Validation rules
  createValidation = [
    body('username').trim().isLength({ min: 1 }).withMessage('Username is required'),
    body('page_name').trim().isLength({ min: 1 }).withMessage('Page name is required'),
    body('followers_count').isInt({ min: 0 }).withMessage('Followers count must be a non-negative integer'),
    body('collaboration').optional().trim(),
    body('category').optional().trim(),
    body('location').optional().trim(),
    body('price_reel_no_tag_no_collab').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('price_reel_with_tag_no_collab').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('price_reel_with_tag').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('video_minutes_allowed').optional().isInt({ min: 0 }).withMessage('Video minutes must be a non-negative integer'),
    body('pin_post_weekly_charge').optional().isFloat({ min: 0 }).withMessage('Charge must be a non-negative number'),
    body('story_charge').optional().isFloat({ min: 0 }).withMessage('Charge must be a non-negative number'),
    body('story_with_reel_charge').optional().isFloat({ min: 0 }).withMessage('Charge must be a non-negative number'),
    body('page_website').optional({ checkFalsy: true }).isURL().withMessage('Valid website URL is required'),
    body('platform').optional().isIn(['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook']).withMessage('Invalid platform'),
  ];

  updateValidation = [
    body('username').optional().trim().isLength({ min: 1 }).withMessage('Username is required'),
    body('page_name').optional().trim().isLength({ min: 1 }).withMessage('Page name is required'),
    body('followers_count').optional().isInt({ min: 0 }).withMessage('Followers count must be a non-negative integer'),
    body('collaboration').optional().trim(),
    body('category').optional().trim(),
    body('location').optional().trim(),
    body('price_reel_no_tag_no_collab').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('price_reel_with_tag_no_collab').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('price_reel_with_tag').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('video_minutes_allowed').optional().isInt({ min: 0 }).withMessage('Video minutes must be a non-negative integer'),
    body('pin_post_weekly_charge').optional().isFloat({ min: 0 }).withMessage('Charge must be a non-negative number'),
    body('story_charge').optional().isFloat({ min: 0 }).withMessage('Charge must be a non-negative number'),
    body('story_with_reel_charge').optional().isFloat({ min: 0 }).withMessage('Charge must be a non-negative number'),
    body('page_website').optional({ checkFalsy: true }).isURL().withMessage('Valid website URL is required'),
    body('platform').optional().isIn(['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook']).withMessage('Invalid platform'),
  ];

  // Create a new paparazzi submission
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      // Determine user_id based on route type
      let user_id;
      if (req.user) {
        // User route
        user_id = req.user.userId;
      } else if (req.admin) {
        // Admin route - for admin-created entries, use admin ID or require user_id in body
        user_id = req.body.user_id || req.admin.adminId;
      } else {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const paparazziData = { ...req.body, user_id, status: req.user ? 'pending' : 'approved' };
      const paparazzi = await Paparazzi.create(paparazziData);
      res.status(201).json({
        message: req.user ? 'Paparazzi submission created successfully' : 'Paparazzi created successfully',
        paparazzi: paparazzi.toJSON()
      });
    } catch (error) {
      console.error('Create paparazzi error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all paparazzi entries with filtering
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        user_id,
        platform,
        category,
        location
      } = req.query;

      let paparazzi;
      if (status) {
        paparazzi = await Paparazzi.findByStatus(status);
      } else if (user_id) {
        paparazzi = await Paparazzi.findByUserId(user_id);
      } else {
        paparazzi = await Paparazzi.findAll();
      }

      // For user routes, only show approved paparazzi unless it's their own
      if (!req.admin) {
        paparazzi = paparazzi.filter(p => p.status === 'approved' || p.user_id === req.user.userId);
      }

      // Apply additional filters
      let filtered = paparazzi;
      if (platform) {
        filtered = filtered.filter(p => p.platform === platform);
      }
      if (category) {
        filtered = filtered.filter(p => p.category && p.category.toLowerCase().includes(category.toLowerCase()));
      }
      if (location) {
        filtered = filtered.filter(p => p.location && p.location.toLowerCase().includes(location.toLowerCase()));
      }

      // Pagination
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + parseInt(limit));

      res.json({
        paparazzi: paginated.map(p => p.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filtered.length
        }
      });
    } catch (error) {
      console.error('Get paparazzi error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get paparazzi by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const paparazzi = await Paparazzi.findById(id);

      if (!paparazzi) {
        return res.status(404).json({ error: 'Paparazzi not found' });
      }

      // For user routes, check if approved or owned by user
      if (!req.admin && paparazzi.status !== 'approved' && paparazzi.user_id !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ paparazzi: paparazzi.toJSON() });
    } catch (error) {
      console.error('Get paparazzi by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update paparazzi
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const paparazzi = await Paparazzi.findById(id);

      if (!paparazzi) {
        return res.status(404).json({ error: 'Paparazzi not found' });
      }

      // For user routes, check ownership and status
      if (!req.admin) {
        if (paparazzi.user_id !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied: You can only update your own submissions' });
        }
        if (paparazzi.status !== 'pending') {
          return res.status(403).json({ error: 'You can only update pending submissions' });
        }
      }

      const updatedPaparazzi = await paparazzi.update(req.body);
      res.json({
        message: 'Paparazzi updated successfully',
        paparazzi: updatedPaparazzi.toJSON()
      });
    } catch (error) {
      console.error('Update paparazzi error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete paparazzi
  async delete(req, res) {
    try {
      const { id } = req.params;
      const paparazzi = await Paparazzi.findById(id);

      if (!paparazzi) {
        return res.status(404).json({ error: 'Paparazzi not found' });
      }

      // For user routes, check ownership and status
      if (!req.admin) {
        if (paparazzi.user_id !== req.user.userId) {
          return res.status(403).json({ error: 'Access denied: You can only delete your own submissions' });
        }
        if (paparazzi.status !== 'pending') {
          return res.status(403).json({ error: 'You can only delete pending submissions' });
        }
      }

      await paparazzi.delete();
      res.json({ message: 'Paparazzi deleted successfully' });
    } catch (error) {
      console.error('Delete paparazzi error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Approve paparazzi
  async approve(req, res) {
    try {
      const { id } = req.params;
      const paparazzi = await Paparazzi.findById(id);

      if (!paparazzi) {
        return res.status(404).json({ error: 'Paparazzi not found' });
      }

      await paparazzi.approve(req.admin.adminId);

      // Send approval email (don't fail the operation if email fails)
      try {
        const user = await User.findById(paparazzi.user_id);
        if (user) {
          console.log(`Sending approval email to user: ${user.email} for paparazzi: ${paparazzi.page_name}`);
          const subject = 'Your Paparazzi Submission Has Been Approved';
          const htmlContent = PaparazziController.generateApprovalEmailTemplate(paparazzi);
          const result = await emailService.sendCustomEmail(user.email, subject, htmlContent);
          console.log('Approval email sent successfully:', result);
        } else {
          console.warn('User not found for paparazzi approval email');
        }
      } catch (emailError) {
        console.error('Failed to send approval email, but approval succeeded:', emailError);
      }

      res.json({
        message: 'Paparazzi approved successfully',
        paparazzi: paparazzi.toJSON()
      });
    } catch (error) {
      console.error('Approve paparazzi error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Reject paparazzi
  async reject(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const paparazzi = await Paparazzi.findById(id);

      if (!paparazzi) {
        return res.status(404).json({ error: 'Paparazzi not found' });
      }

      await paparazzi.reject(req.admin.adminId, reason);

      // Send rejection email (don't fail the operation if email fails)
      try {
        const user = await User.findById(paparazzi.user_id);
        if (user) {
          console.log(`Sending rejection email to user: ${user.email} for paparazzi: ${paparazzi.page_name}`);
          const subject = 'Your Paparazzi Submission Has Been Rejected';
          const htmlContent = PaparazziController.generateRejectionEmailTemplate(paparazzi, reason);
          const result = await emailService.sendCustomEmail(user.email, subject, htmlContent);
          console.log('Rejection email sent successfully:', result);
        } else {
          console.warn('User not found for paparazzi rejection email');
        }
      } catch (emailError) {
        console.error('Failed to send rejection email, but rejection succeeded:', emailError);
      }

      res.json({
        message: 'Paparazzi rejected successfully',
        paparazzi: paparazzi.toJSON()
      });
    } catch (error) {
      console.error('Reject paparazzi error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Generate approval email template
  static generateApprovalEmailTemplate(paparazzi) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FAFAFA; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>News Marketplace</h1>
            </div>
            <div class="content">
              <h2>Congratulations!</h2>
              <p>Your paparazzi submission for <strong>${paparazzi.page_name}</strong> has been approved and is now live on our platform.</p>
              <p>You can now receive collaboration requests from our users.</p>
              <p>Thank you for being part of our community!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 News Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate rejection email template
  static generateRejectionEmailTemplate(paparazzi, reason) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #212121; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #F44336; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #FAFAFA; padding: 30px; border-radius: 0 0 8px 8px; }
            .reason { background: #FFF3E0; padding: 15px; border-left: 4px solid #F44336; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #757575; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>News Marketplace</h1>
            </div>
            <div class="content">
              <h2>Submission Update</h2>
              <p>Unfortunately, your paparazzi submission for <strong>${paparazzi.page_name}</strong> could not be approved at this time.</p>
              <div class="reason">
                <strong>Reason for rejection:</strong><br>
                ${reason}
              </div>
              <p>You can update your submission and resubmit it for review. Please ensure all information is accurate and complete.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 News Marketplace. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

module.exports = new PaparazziController();