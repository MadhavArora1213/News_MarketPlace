const RealEstateProfessional = require('../models/RealEstateProfessional');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { s3Service } = require('../services/s3Service');

class AdminRealEstateProfessionalController {
  constructor() {
    // Configure multer for image uploads (using memory storage for S3)
    this.storage = multer.memoryStorage();

    this.upload = multer({
      storage: this.storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 1 // Maximum 1 file for professional image
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      }
    });

    // Multer for CSV bulk upload
    this.csvUpload = multer({
      storage: this.storage,
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
          cb(null, true);
        } else {
          cb(new Error('Only CSV files are allowed'));
        }
      }
    });

    // Bind methods to preserve 'this' context
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.findAllWithFilters = this.findAllWithFilters.bind(this);
    this.getCount = this.getCount.bind(this);
    this.downloadCSV = this.downloadCSV.bind(this);
    this.downloadTemplate = this.downloadTemplate.bind(this);
    this.bulkUpload = this.bulkUpload.bind(this);
  }

  // Download CSV of all records
  async downloadCSV(req, res) {
    try {
      const { status, search } = req.query;
      const whereClause = {};

      if (search) {
        whereClause.search = { val: search };
      } else {
        if (status) whereClause.status = status;
      }

      const { rows } = await RealEstateProfessional.findAndCountAll({
        where: whereClause,
        order: [['created_at', 'DESC']]
      });

      const headers = [
        'ID', 'First Name', 'Last Name', 'IG URL', 'Followers', 'Verified',
        'Agency Owner', 'Agent', 'Dev Employee',
        'Gender', 'Nationality', 'City', 'Status', 'Created At'
      ];

      let csv = headers.join(',') + '\n';

      const escape = (text) => {
        if (text === null || text === undefined) return '';
        const stringValue = String(text);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      rows.forEach(row => {
        const data = [
          row.id,
          escape(row.first_name),
          escape(row.last_name),
          escape(row.ig_url),
          row.no_of_followers,
          row.verified_tick ? 'Yes' : 'No',
          row.real_estate_agency_owner ? 'Yes' : 'No',
          row.real_estate_agent ? 'Yes' : 'No',
          row.developer_employee ? 'Yes' : 'No',
          escape(row.gender),
          escape(row.nationality),
          escape(row.current_residence_city),
          escape(row.status),
          row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : ''
        ];
        csv += data.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=real_estate_professionals_export_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);

    } catch (error) {
      console.error('Download CSV error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Download CSV template for bulk upload
  async downloadTemplate(req, res) {
    try {
      const headers = [
        'first_name',
        'last_name',
        'ig_url',
        'no_of_followers',
        'verified_tick',
        'real_estate_agency_owner',
        'real_estate_agent',
        'developer_employee',
        'gender',
        'nationality',
        'current_residence_city',
        'status'
      ];

      const dummyData = [
        ['John', 'Doe', 'https://instagram.com/johndoe', '5000', 'true', 'true', 'false', 'false', 'Male', 'USA', 'New York', 'approved'],
        ['Jane', 'Smith', 'https://instagram.com/janesmith', '10000', 'true', 'false', 'true', 'false', 'Female', 'uk', 'London', 'pending']
      ];

      let csv = headers.join(',') + '\n';
      dummyData.forEach(row => {
        csv += row.map(val => `"${val}"`).join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=real_estate_professionals_template.csv');
      res.status(200).send(csv);
    } catch (error) {
      console.error('Download template error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk upload real estate professionals from CSV
  async bulkUpload(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Please upload a CSV file' });
      }

      const csvParser = require('csv-parser');
      const { Readable } = require('stream');

      const results = [];
      const stream = Readable.from(req.file.buffer.toString());

      stream
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            const createdRecords = [];
            const errors = [];

            for (const [index, row] of results.entries()) {
              try {
                // Basic mapping and cleaning
                const professionalData = {
                  first_name: row.first_name || '',
                  last_name: row.last_name || '',
                  ig_url: row.ig_url || '',
                  no_of_followers: parseInt(row.no_of_followers) || 0,
                  verified_tick: row.verified_tick === 'true',
                  real_estate_agency_owner: row.real_estate_agency_owner === 'true',
                  real_estate_agent: row.real_estate_agent === 'true',
                  developer_employee: row.developer_employee === 'true',
                  gender: row.gender || '',
                  nationality: row.nationality || '',
                  current_residence_city: row.current_residence_city || '',
                  status: row.status || 'pending',
                  is_active: true,
                  submitted_by_admin: req.admin.adminId
                };

                if (!professionalData.first_name || !professionalData.last_name) {
                  errors.push(`Row ${index + 1}: First name and last name are required.`);
                  continue;
                }

                const record = await RealEstateProfessional.create(professionalData);
                createdRecords.push(record);
              } catch (err) {
                errors.push(`Row ${index + 1}: ${err.message}`);
              }
            }

            res.json({
              message: `Bulk upload completed. ${createdRecords.length} records created.`,
              count: createdRecords.length,
              errors: errors.length > 0 ? errors : undefined
            });
          } catch (error) {
            console.error('Processing batch error:', error);
            res.status(500).json({ error: 'Error processing bulk upload' });
          }
        });
    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Validation rules for create
  createValidation = [
    body('first_name').trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('last_name').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    body('ig_url').optional().isURL().withMessage('Instagram URL must be a valid URL'),
    body('no_of_followers').optional().isInt({ min: 0 }).withMessage('Number of followers must be a non-negative integer'),
    body('verified_tick').optional().isBoolean().withMessage('Verified tick must be a boolean'),
    body('linkedin').optional().isURL().withMessage('LinkedIn URL must be a valid URL'),
    body('tiktok').optional().isURL().withMessage('TikTok URL must be a valid URL'),
    body('facebook').optional().isURL().withMessage('Facebook URL must be a valid URL'),
    body('youtube').optional().isURL().withMessage('YouTube URL must be a valid URL'),
    body('real_estate_agency_owner').optional().isBoolean().withMessage('Real estate agency owner must be a boolean'),
    body('real_estate_agent').optional().isBoolean().withMessage('Real estate agent must be a boolean'),
    body('developer_employee').optional().isBoolean().withMessage('Developer employee must be a boolean'),
    body('gender').optional().trim(),
    body('nationality').optional().trim(),
    body('current_residence_city').optional().trim(),
    body('languages').optional().isArray().withMessage('Languages must be an array'),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
    body('submitted_by').optional().isInt().withMessage('Submitted by must be an integer'),
    body('submitted_by_admin').optional().isInt().withMessage('Submitted by admin must be an integer'),
    body('rejection_reason').optional().trim(),
    body('admin_comments').optional().trim(),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean')
  ];

  // Validation rules for update
  updateValidation = [
    body('first_name').optional().trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('last_name').optional().trim().isLength({ min: 1 }).withMessage('Last name is required'),
    body('ig_url').optional().isURL().withMessage('Instagram URL must be a valid URL'),
    body('no_of_followers').optional().isInt({ min: 0 }).withMessage('Number of followers must be a non-negative integer'),
    body('verified_tick').optional().isBoolean().withMessage('Verified tick must be a boolean'),
    body('linkedin').optional().isURL().withMessage('LinkedIn URL must be a valid URL'),
    body('tiktok').optional().isURL().withMessage('TikTok URL must be a valid URL'),
    body('facebook').optional().isURL().withMessage('Facebook URL must be a valid URL'),
    body('youtube').optional().isURL().withMessage('YouTube URL must be a valid URL'),
    body('real_estate_agency_owner').optional().isBoolean().withMessage('Real estate agency owner must be a boolean'),
    body('real_estate_agent').optional().isBoolean().withMessage('Real estate agent must be a boolean'),
    body('developer_employee').optional().isBoolean().withMessage('Developer employee must be a boolean'),
    body('gender').optional().trim(),
    body('nationality').optional().trim(),
    body('current_residence_city').optional().trim(),
    body('languages').optional().isArray().withMessage('Languages must be an array'),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
    body('submitted_by').optional().isInt().withMessage('Submitted by must be an integer'),
    body('submitted_by_admin').optional().isInt().withMessage('Submitted by admin must be an integer'),
    body('rejection_reason').optional().trim(),
    body('admin_comments').optional().trim(),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean')
  ];

  // Get all real estate professionals (admin management - includes all statuses)
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        is_active,
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        gender,
        nationality,
        current_residence_city
      } = req.query;

      const whereClause = {};

      if (search) {
        whereClause.search = { val: search };
      } else {
        if (status) whereClause.status = status;
        if (is_active !== undefined) whereClause.is_active = is_active === 'true';
        if (gender) whereClause.gender = gender;
        if (nationality) whereClause.nationality = nationality;
        if (current_residence_city) whereClause.current_residence_city = current_residence_city;
      }

      const limitNum = parseInt(limit);
      const offset = (page - 1) * limitNum;

      const { count, rows } = await RealEstateProfessional.findAndCountAll({
        where: whereClause,
        limit: limitNum,
        offset: offset,
        order: [[sortBy, sortOrder.toUpperCase()]]
      });

      res.json({
        professionals: rows.map(p => p.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total: count,
          pages: Math.ceil(count / limitNum)
        }
      });
    } catch (error) {
      console.error('Get all real estate professionals error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get real estate professional by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const professional = await RealEstateProfessional.findById(id);

      if (!professional) {
        return res.status(404).json({ error: 'Real estate professional not found' });
      }

      res.json({ professional: professional.toJSON() });
    } catch (error) {
      console.error('Get real estate professional by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create a new real estate professional (admin only)
  async create(req, res) {
    console.log('AdminRealEstateProfessionalController.create - Starting');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request file:', req.file ? { originalname: req.file.originalname, size: req.file.size } : 'No file');
    console.log('Admin info:', req.admin);

    try {
      if (!req.admin) {
        console.log('AdminRealEstateProfessionalController.create - No admin access');
        return res.status(403).json({ error: 'Admin access required' });
      }

      console.log('AdminRealEstateProfessionalController.create - Form data already parsed by middleware');

      console.log('AdminRealEstateProfessionalController.create - Running validation');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('AdminRealEstateProfessionalController.create - Validation errors:', errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      console.log('AdminRealEstateProfessionalController.create - Validation passed');
      const professionalData = { ...req.body };
      console.log('AdminRealEstateProfessionalController.create - Professional data prepared:', Object.keys(professionalData));

      // Handle image upload to S3
      if (req.file) {
        console.log('AdminRealEstateProfessionalController.create - Uploading image to S3');
        const s3Key = s3Service.generateKey('real-estate-professionals', 'image', req.file.originalname);
        const contentType = s3Service.getContentType(req.file.originalname);

        try {
          const s3Url = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
          professionalData.image = s3Url;
          console.log('AdminRealEstateProfessionalController.create - Image uploaded successfully:', s3Url);
        } catch (uploadError) {
          console.error('AdminRealEstateProfessionalController.create - S3 upload error:', uploadError);
          throw new Error('Failed to upload image');
        }
      }

      // Set submission details for admin creation
      professionalData.submitted_by_admin = req.admin.adminId;
      professionalData.status = professionalData.status || 'approved'; // Default to approved for admin creations
      console.log('AdminRealEstateProfessionalController.create - Final professional data:', {
        submitted_by_admin: professionalData.submitted_by_admin,
        status: professionalData.status,
        first_name: professionalData.first_name,
        last_name: professionalData.last_name
      });

      console.log('AdminRealEstateProfessionalController.create - Creating professional in database');
      const professional = await RealEstateProfessional.create(professionalData);
      console.log('AdminRealEstateProfessionalController.create - Professional created successfully:', professional.id);

      res.status(201).json({
        message: 'Real estate professional created successfully',
        professional: professional.toJSON()
      });
    } catch (error) {
      console.error('AdminRealEstateProfessionalController.create - Error:', error);
      console.error('AdminRealEstateProfessionalController.create - Error stack:', error.stack);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Update real estate professional (admin only)
  async update(req, res) {
    console.log('AdminRealEstateProfessionalController.update - Starting');
    console.log('Request params:', req.params);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request file:', req.file ? { originalname: req.file.originalname, size: req.file.size } : 'No file');
    console.log('Admin info:', req.admin);

    try {
      if (!req.admin) {
        console.log('AdminRealEstateProfessionalController.update - No admin access');
        return res.status(403).json({ error: 'Admin access required' });
      }

      console.log('AdminRealEstateProfessionalController.update - Form data already parsed by middleware');

      console.log('AdminRealEstateProfessionalController.update - Running validation');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('AdminRealEstateProfessionalController.update - Validation errors:', errors.array());
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      console.log('AdminRealEstateProfessionalController.update - Validation passed');
      const { id } = req.params;
      console.log('AdminRealEstateProfessionalController.update - Looking up professional with ID:', id);

      const professional = await RealEstateProfessional.findById(id);

      if (!professional) {
        console.log('AdminRealEstateProfessionalController.update - Professional not found:', id);
        return res.status(404).json({ error: 'Real estate professional not found' });
      }

      console.log('AdminRealEstateProfessionalController.update - Professional found:', professional.id);
      const updateData = { ...req.body };
      console.log('AdminRealEstateProfessionalController.update - Update data prepared:', Object.keys(updateData));

      // Handle image upload to S3 for updates
      if (req.file) {
        console.log('AdminRealEstateProfessionalController.update - Uploading image to S3');
        const s3Key = s3Service.generateKey('real-estate-professionals', 'image', req.file.originalname);
        const contentType = s3Service.getContentType(req.file.originalname);

        try {
          const s3Url = await s3Service.uploadFile(req.file.buffer, s3Key, contentType, req.file.originalname);
          updateData.image = s3Url;
          console.log('AdminRealEstateProfessionalController.update - Image uploaded successfully:', s3Url);
        } catch (uploadError) {
          console.error('AdminRealEstateProfessionalController.update - S3 upload error:', uploadError);
          throw new Error('Failed to upload image');
        }
      }

      console.log('AdminRealEstateProfessionalController.update - Updating professional in database');
      const updatedProfessional = await professional.update(updateData);
      console.log('AdminRealEstateProfessionalController.update - Professional updated successfully:', updatedProfessional.id);

      res.json({
        message: 'Real estate professional updated successfully',
        professional: updatedProfessional.toJSON()
      });
    } catch (error) {
      console.error('AdminRealEstateProfessionalController.update - Error:', error);
      console.error('AdminRealEstateProfessionalController.update - Error stack:', error.stack);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Delete real estate professional (admin only)
  async delete(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const professional = await RealEstateProfessional.findById(id);

      if (!professional) {
        return res.status(404).json({ error: 'Real estate professional not found' });
      }

      await professional.delete();
      res.json({ message: 'Real estate professional deleted successfully' });
    } catch (error) {
      console.error('Delete real estate professional error:', error);
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
        whereClause += ` AND rp.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);
    paramCount += searchValues.length;

    const sql = `
      SELECT rp.* FROM real_estate_professionals rp
      ${whereClause} ${searchSql}
      ORDER BY rp.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await query(sql, params);
    // Ensure languages field is properly parsed for raw SQL results
    return result.rows.map(row => {
      if (row.languages && typeof row.languages === 'string') {
        try {
          row.languages = JSON.parse(row.languages);
        } catch (e) {
          console.error('Error parsing languages in raw query result:', e);
          row.languages = [];
        }
      }
      return new RealEstateProfessional(row);
    });
  }

  async getCount(filters, searchSql, searchValues) {
    const { query } = require('../config/database');
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        whereClause += ` AND rp.${key} = $${paramCount}`;
        params.push(filters[key]);
        paramCount++;
      }
    });

    params.push(...searchValues);

    const sql = `SELECT COUNT(*) as total FROM real_estate_professionals rp ${whereClause} ${searchSql}`;
    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }
}

module.exports = AdminRealEstateProfessionalController;