const PressRelease = require('../models/PressRelease');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { s3Service } = require('../services/s3Service');

class AdminPressReleaseController {
  constructor() {
    // Configure multer for image uploads (using memory storage for S3)
    this.storage = multer.memoryStorage();

    console.log('AdminPressReleaseController: Creating multer without fileFilter');
    this.upload = multer({
      storage: this.storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
      }
    });

    // Bind methods to preserve 'this' context
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.approve = this.approve.bind(this);
    this.reject = this.reject.bind(this);
    this.findAllWithFilters = this.findAllWithFilters.bind(this);
    this.getCount = this.getCount.bind(this);
  }

  // Validation rules for create
  createValidation = [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('region').optional().trim(),
    body('niche').optional().trim(),
    body('distribution_media_websites').optional().isInt({ min: 0 }).withMessage('Distribution media websites must be a non-negative integer'),
    body('guaranteed_media_placements').optional().isInt({ min: 0 }).withMessage('Guaranteed media placements must be a non-negative integer'),
    body('end_client_media_details').optional().trim(),
    body('middlemen_contact_details').optional().trim(),
    body('google_search_optimised_status').optional().isIn(['Not Guaranteed', 'Guaranteed']).withMessage('Google search optimised status must be Not Guaranteed or Guaranteed'),
    body('google_search_optimised_publications').optional().custom((value, { req }) => {
      if (req.body.google_search_optimised_status === 'Guaranteed') {
        if (!value || value === '' || !Number.isInteger(Number(value)) || Number(value) < 1) {
          throw new Error('Google search optimised publications must be a positive integer when status is Guaranteed');
        }
      }
      return true;
    }),
    body('google_news_index_status').optional().isIn(['Not Guaranteed', 'Guaranteed']).withMessage('Google news index status must be Not Guaranteed or Guaranteed'),
    body('google_news_index_publications').optional().custom((value, { req }) => {
      if (req.body.google_news_index_status === 'Guaranteed') {
        if (!value || value === '' || !Number.isInteger(Number(value)) || Number(value) < 1) {
          throw new Error('Google news index publications must be a positive integer when status is Guaranteed');
        }
      }
      return true;
    }),
    body('images_allowed').optional().isInt({ min: 0 }).withMessage('Images allowed must be a non-negative integer'),
    body('word_limit').optional().isInt({ min: 0 }).withMessage('Word limit must be a non-negative integer'),
    body('package_options').optional().isArray().withMessage('Package options must be an array'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('turnaround_time').optional().trim(),
    body('customer_info_needed').optional().trim(),
    body('description').optional().trim(),
    body('best_seller').optional().isBoolean().withMessage('Best seller must be a boolean'),
    body('content_writing_assistance').optional().isBoolean().withMessage('Content writing assistance must be a boolean'),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean')
  ];

  // Validation rules for update
  updateValidation = [
    body('name').optional().trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('region').optional().trim(),
    body('niche').optional().trim(),
    body('distribution_media_websites').optional().isInt({ min: 0 }).withMessage('Distribution media websites must be a non-negative integer'),
    body('guaranteed_media_placements').optional().isInt({ min: 0 }).withMessage('Guaranteed media placements must be a non-negative integer'),
    body('end_client_media_details').optional().trim(),
    body('middlemen_contact_details').optional().trim(),
    body('google_search_optimised_status').optional().isIn(['Not Guaranteed', 'Guaranteed']).withMessage('Google search optimised status must be Not Guaranteed or Guaranteed'),
    body('google_search_optimised_publications').optional().custom((value, { req }) => {
      if (req.body.google_search_optimised_status === 'Guaranteed') {
        if (!value || value === '' || !Number.isInteger(Number(value)) || Number(value) < 1) {
          throw new Error('Google search optimised publications must be a positive integer when status is Guaranteed');
        }
      }
      return true;
    }),
    body('google_news_index_status').optional().isIn(['Not Guaranteed', 'Guaranteed']).withMessage('Google news index status must be Not Guaranteed or Guaranteed'),
    body('google_news_index_publications').optional().custom((value, { req }) => {
      if (req.body.google_news_index_status === 'Guaranteed') {
        if (!value || value === '' || !Number.isInteger(Number(value)) || Number(value) < 1) {
          throw new Error('Google news index publications must be a positive integer when status is Guaranteed');
        }
      }
      return true;
    }),
    body('images_allowed').optional().isInt({ min: 0 }).withMessage('Images allowed must be a non-negative integer'),
    body('word_limit').optional().isInt({ min: 0 }).withMessage('Word limit must be a non-negative integer'),
    body('package_options').optional().isArray().withMessage('Package options must be an array'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('turnaround_time').optional().trim(),
    body('customer_info_needed').optional().trim(),
    body('description').optional().trim(),
    body('best_seller').optional().isBoolean().withMessage('Best seller must be a boolean'),
    body('content_writing_assistance').optional().isBoolean().withMessage('Content writing assistance must be a boolean'),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
    body('rejection_reason').optional().trim(),
    body('admin_comments').optional().trim()
  ];

  // Get all press releases (admin management - includes all statuses)
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        name,
        region,
        niche,
        best_seller,
        google_search_optimised_status,
        google_news_index_status,
        status,
        is_active
      } = req.query;

      // Build filters
      const filters = {};
      if (status) filters.status = status;
      if (is_active !== undefined) filters.is_active = is_active === 'true';
      if (best_seller !== undefined) filters.best_seller = best_seller === 'true';
      if (google_search_optimised_status) filters.google_search_optimised_status = google_search_optimised_status;
      if (google_news_index_status) filters.google_news_index_status = google_news_index_status;

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (name) {
        searchSql += ` AND pr.name ILIKE $${searchParamCount}`;
        searchValues.push(`%${name}%`);
        searchParamCount++;
      }

      if (region) {
        searchSql += ` AND pr.region ILIKE $${searchParamCount}`;
        searchValues.push(`%${region}%`);
        searchParamCount++;
      }

      if (niche) {
        searchSql += ` AND pr.niche ILIKE $${searchParamCount}`;
        searchValues.push(`%${niche}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const pressReleases = await this.findAllWithFilters(filters, searchSql, searchValues, limit, offset);
      const total = await this.getCount(filters, searchSql, searchValues);

      res.json({
        pressReleases: pressReleases.map(pr => pr.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all press releases error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get press release by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const pressRelease = await PressRelease.findById(id);

      if (!pressRelease) {
        return res.status(404).json({ error: 'Press release not found' });
      }

      res.json({ pressRelease: pressRelease.toJSON() });
    } catch (error) {
      console.error('Get press release by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create a new press release (admin only)
  async create(req, res) {
    console.log('AdminPressReleaseController.create - Starting');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request file:', req.file ? { originalname: req.file.originalname, size: req.file.size } : 'No file');
    console.log('Admin info:', req.admin);

    try {
      if (!req.admin) {
        console.log('AdminPressReleaseController.create - No admin access');
        return res.status(403).json({ error: 'Admin access required' });
      }

      console.log('AdminPressReleaseController.create - Form data already parsed by middleware');

      console.log('AdminPressReleaseController.create - Running validation');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('AdminPressReleaseController.create - Validation errors:', errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      console.log('AdminPressReleaseController.create - Validation passed');
      const pressReleaseData = { ...req.body };
      console.log('AdminPressReleaseController.create - Press release data prepared:', Object.keys(pressReleaseData));

      // Handle image upload to S3
      if (req.file) {
        console.log('AdminPressReleaseController.create - Uploading image to S3');

        // Validate file type
        if (!req.file.mimetype.startsWith('image/')) {
          throw new Error('Only image files are allowed');
        }

        const s3Key = s3Service.generateKey('press-releases', 'logo', req.file.originalname);
        const contentType = s3Service.getContentType(req.file.originalname);

        try {
          const s3Url = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
          pressReleaseData.image_logo = s3Url;
          console.log('AdminPressReleaseController.create - Image uploaded successfully:', s3Url);
        } catch (uploadError) {
          console.error('AdminPressReleaseController.create - S3 upload error:', uploadError);
          throw new Error('Failed to upload image');
        }
      }

      // Set submission details for admin creation
      pressReleaseData.submitted_by_admin = req.admin.adminId;
      pressReleaseData.status = pressReleaseData.status || 'active'; // Default to active for admin creations
      console.log('AdminPressReleaseController.create - Final press release data:', {
        submitted_by_admin: pressReleaseData.submitted_by_admin,
        status: pressReleaseData.status,
        name: pressReleaseData.name
      });

      console.log('AdminPressReleaseController.create - Creating press release in database');
      const pressRelease = await PressRelease.create(pressReleaseData);
      console.log('AdminPressReleaseController.create - Press release created successfully:', pressRelease.id);

      res.status(201).json({
        message: 'Press release created successfully',
        pressRelease: pressRelease.toJSON()
      });
    } catch (error) {
      console.error('AdminPressReleaseController.create - Error:', error);
      console.error('AdminPressReleaseController.create - Error stack:', error.stack);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Update press release (admin only)
  async update(req, res) {
    console.log('AdminPressReleaseController.update - Starting');
    console.log('Request params:', req.params);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request file:', req.file ? { originalname: req.file.originalname, size: req.file.size } : 'No file');
    console.log('Admin info:', req.admin);

    try {
      if (!req.admin) {
        console.log('AdminPressReleaseController.update - No admin access');
        return res.status(403).json({ error: 'Admin access required' });
      }

      console.log('AdminPressReleaseController.update - Form data already parsed by middleware');

      console.log('AdminPressReleaseController.update - Running validation');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('AdminPressReleaseController.update - Validation errors:', errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      console.log('AdminPressReleaseController.update - Validation passed');
      const { id } = req.params;
      console.log('AdminPressReleaseController.update - Looking up press release with ID:', id);

      const pressRelease = await PressRelease.findById(id);

      if (!pressRelease) {
        console.log('AdminPressReleaseController.update - Press release not found:', id);
        return res.status(404).json({ error: 'Press release not found' });
      }

      console.log('AdminPressReleaseController.update - Press release found:', pressRelease.id);
      const updateData = { ...req.body };
      console.log('AdminPressReleaseController.update - Update data prepared:', Object.keys(updateData));

      // Handle image upload to S3 for updates
      if (req.file) {
        console.log('AdminPressReleaseController.update - Uploading image to S3');
        const s3Key = s3Service.generateKey('press-releases', 'logo', req.file.originalname);
        const contentType = s3Service.getContentType(req.file.originalname);

        try {
          const s3Url = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
          updateData.image_logo = s3Url;
          console.log('AdminPressReleaseController.update - Image uploaded successfully:', s3Url);
        } catch (uploadError) {
          console.error('AdminPressReleaseController.update - S3 upload error:', uploadError);
          throw new Error('Failed to upload image');
        }
      }

      console.log('AdminPressReleaseController.update - Updating press release in database');
      const updatedPressRelease = await pressRelease.update(updateData);
      console.log('AdminPressReleaseController.update - Press release updated successfully:', updatedPressRelease.id);

      res.json({
        message: 'Press release updated successfully',
        pressRelease: updatedPressRelease.toJSON()
      });
    } catch (error) {
      console.error('AdminPressReleaseController.update - Error:', error);
      console.error('AdminPressReleaseController.update - Error stack:', error.stack);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Approve press release (admin only)
  async approve(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const pressRelease = await PressRelease.findById(id);

      if (!pressRelease) {
        return res.status(404).json({ error: 'Press release not found' });
      }

      const updateData = {
        status: 'active',
        approved_by: req.admin.adminId,
        approved_at: new Date(),
        rejected_at: null,
        rejected_by: null,
        rejection_reason: null
      };

      await pressRelease.update(updateData);

      res.json({
        message: 'Press release approved successfully',
        pressRelease: pressRelease.toJSON()
      });
    } catch (error) {
      console.error('Approve press release error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Reject press release (admin only)
  async reject(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const { rejection_reason, admin_comments } = req.body;

      const pressRelease = await PressRelease.findById(id);

      if (!pressRelease) {
        return res.status(404).json({ error: 'Press release not found' });
      }

      const updateData = {
        status: 'inactive',
        rejected_by: req.admin.adminId,
        rejected_at: new Date(),
        approved_at: null,
        approved_by: null,
        rejection_reason: rejection_reason || null,
        admin_comments: admin_comments || null
      };

      await pressRelease.update(updateData);

      res.json({
        message: 'Press release rejected successfully',
        pressRelease: pressRelease.toJSON()
      });
    } catch (error) {
      console.error('Reject press release error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete press release (admin only)
  async delete(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const pressRelease = await PressRelease.findById(id);

      if (!pressRelease) {
        return res.status(404).json({ error: 'Press release not found' });
      }

      await pressRelease.delete();
      res.json({ message: 'Press release deleted successfully' });
    } catch (error) {
      console.error('Delete press release error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper methods for database queries
  async findAllWithFilters(filters, searchSql, searchValues, limit, offset) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        whereClause += ` AND pr.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);
    paramCount += searchValues.length;

    const sql = `
      SELECT pr.* FROM press_releases pr
      ${whereClause} ${searchSql}
      ORDER BY pr.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows.map(row => new PressRelease(row));
  }

  async getCount(filters, searchSql, searchValues) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        whereClause += ` AND pr.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);

    const sql = `SELECT COUNT(*) as total FROM press_releases pr ${whereClause} ${searchSql}`;
    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }
}

module.exports = AdminPressReleaseController;