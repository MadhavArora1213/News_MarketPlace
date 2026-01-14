const RealEstate = require('../models/RealEstate');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { s3Service } = require('../services/s3Service');

class AdminRealEstateController {
  // Configure multer for file uploads (using memory storage for S3)
  constructor() {
    this.storage = multer.memoryStorage();

    this.fileFilter = (req, file, cb) => {
      // Allow common image types
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP images are allowed.'));
      }
    };

    this.upload = multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per image
        files: 10 // Maximum 10 images
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

  }


  // Validation rules for create
  createValidation = [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('location').optional().trim(),
    body('property_type').optional().trim(),
    body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
    body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
    body('area_sqft').optional().isFloat({ min: 0 }).withMessage('Area must be a positive number'),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
    body('submitted_by').optional().isInt().withMessage('Submitted by must be an integer'),
    body('submitted_by_admin').optional().isInt().withMessage('Submitted by admin must be an integer'),
    body('rejection_reason').optional().trim(),
    body('admin_comments').optional().trim(),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean'),
  ];

  // Validation rules for update
  updateValidation = [
    body('title').optional().trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').optional().trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('location').optional().trim(),
    body('property_type').optional().trim(),
    body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
    body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
    body('area_sqft').optional().isFloat({ min: 0 }).withMessage('Area must be a positive number'),
    body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
    body('submitted_by').optional().isInt().withMessage('Submitted by must be an integer'),
    body('submitted_by_admin').optional().isInt().withMessage('Submitted by admin must be an integer'),
    body('rejection_reason').optional().trim(),
    body('admin_comments').optional().trim(),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean'),
  ];

  // Get all real estate records
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        location,
        property_type,
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const whereClause = {};

      if (search) {
        whereClause.search = { val: search };
      } else {
        if (status) whereClause.status = status;
        if (location) whereClause.location = location;
        if (property_type) whereClause.property_type = property_type;
      }

      const limitNum = parseInt(limit);
      const offset = (page - 1) * limitNum;

      const { count, rows } = await RealEstate.findAndCountAll({
        where: whereClause,
        limit: limitNum,
        offset: offset,
        order: [[sortBy, sortOrder.toUpperCase()]]
      });

      res.json({
        realEstates: rows.map(re => re.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total: count,
          pages: Math.ceil(count / limitNum)
        }
      });
    } catch (error) {
      console.error('Get real estate records error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get real estate record by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const realEstate = await RealEstate.findById(id);

      if (!realEstate) {
        return res.status(404).json({ error: 'Real estate record not found' });
      }

      res.json({ realEstate: realEstate.toJSON() });
    } catch (error) {
      console.error('Get real estate by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create a new real estate record (admin only)
  async create(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const realEstateData = req.body;

      // Handle image files upload to S3
      if (req.files && req.files.length > 0) {
        const imageUrls = [];
        for (const imageFile of req.files) {
          try {
            // Basic file size check (skip compression for now)
            const maxSize = 5 * 1024 * 1024; // 5MB limit
            if (imageFile.size > maxSize) {
              throw new Error(`Image ${imageFile.originalname} is too large (${(imageFile.size / (1024 * 1024)).toFixed(2)}MB). Maximum allowed size is 5MB.`);
            }

            const s3Key = s3Service.generateKey('real-estate', 'image', imageFile.originalname);
            const contentType = s3Service.getContentType(imageFile.originalname);

            try {
              const s3Url = await s3Service.uploadFile(imageFile.buffer, s3Key, contentType, imageFile.originalname);
              imageUrls.push(s3Url);
            } catch (uploadError) {
              console.error('Failed to upload image to S3:', uploadError);
              throw new Error('Failed to upload image');
            }
          } catch (fileError) {
            console.error('File processing error:', fileError);
            return res.status(400).json({ error: fileError.message });
          }
        }
        realEstateData.images = imageUrls;
      }

      const realEstate = await RealEstate.create(realEstateData);

      res.status(201).json({
        message: 'Real estate record created successfully',
        realEstate: realEstate.toJSON()
      });
    } catch (error) {
      console.error('Create real estate error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Update real estate record (admin only)
  async update(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const realEstate = await RealEstate.findById(id);

      if (!realEstate) {
        return res.status(404).json({ error: 'Real estate record not found' });
      }

      const updateData = req.body;

      // Handle image files upload to S3 for updates
      if (req.files && req.files.length > 0) {
        const imageUrls = [];
        for (const imageFile of req.files) {
          try {
            // Basic file size check (skip compression for now)
            const maxSize = 5 * 1024 * 1024; // 5MB limit
            if (imageFile.size > maxSize) {
              throw new Error(`Image ${imageFile.originalname} is too large (${(imageFile.size / (1024 * 1024)).toFixed(2)}MB). Maximum allowed size is 5MB.`);
            }

            const s3Key = s3Service.generateKey('real-estate', 'image', imageFile.originalname);
            const contentType = s3Service.getContentType(imageFile.originalname);

            try {
              const s3Url = await s3Service.uploadFile(imageFile.buffer, s3Key, contentType, imageFile.originalname);
              imageUrls.push(s3Url);
            } catch (uploadError) {
              console.error('Failed to upload image to S3:', uploadError);
              throw new Error('Failed to upload image');
            }
          } catch (fileError) {
            console.error('File processing error:', fileError);
            return res.status(400).json({ error: fileError.message });
          }
        }
        updateData.images = imageUrls;
      }

      const updatedRealEstate = await realEstate.update(updateData);
      res.json({
        message: 'Real estate record updated successfully',
        realEstate: updatedRealEstate.toJSON()
      });
    } catch (error) {
      console.error('Update real estate error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Delete real estate record (admin only)
  async delete(req, res) {
    try {
      if (!req.admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const realEstate = await RealEstate.findById(id);

      if (!realEstate) {
        return res.status(404).json({ error: 'Real estate record not found' });
      }

      await realEstate.delete();
      res.json({ message: 'Real estate record deleted successfully' });
    } catch (error) {
      console.error('Delete real estate error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
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

      const { rows } = await RealEstate.findAndCountAll({
        where: whereClause,
        order: [['created_at', 'DESC']]
      });

      const headers = [
        'ID', 'Title', 'Description', 'Price', 'Location',
        'Property Type', 'Bedrooms', 'Bathrooms', 'Area (sqft)',
        'Status', 'Created At'
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
          escape(row.title),
          escape(row.description),
          row.price,
          escape(row.location),
          escape(row.property_type),
          row.bedrooms,
          row.bathrooms,
          row.area_sqft,
          row.status,
          row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : ''
        ];
        csv += data.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=real_estate_export_${new Date().toISOString().split('T')[0]}.csv`);
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
        'title',
        'description',
        'price',
        'location',
        'property_type',
        'bedrooms',
        'bathrooms',
        'area_sqft',
        'status'
      ];

      const dummyData = [
        ['Modern Apartment in Downtown', 'A beautiful modern apartment with city views', '250000', 'New York, NY', 'Apartment', '2', '2', '1200', 'approved'],
        ['Cozy Suburban House', 'Perfect for a small family with a large backyard', '350000', 'Austin, TX', 'House', '3', '2', '1800', 'approved'],
        ['Luxury Villa with Pool', 'Exclusive villa in a gated community', '1200000', 'Miami, FL', 'Villa', '5', '4', '4500', 'pending'],
        ['Compact Studio Condo', 'Efficient living space near the tech hub', '180000', 'San Francisco, CA', 'Condo', '1', '1', '600', 'approved'],
        ['Spacious Townhouse', 'Multi-level townhouse with modern amenities', '450000', 'Chicago, IL', 'Townhouse', '3', '3', '2200', 'approved']
      ];

      let csv = headers.join(',') + '\n';
      dummyData.forEach(row => {
        csv += row.map(val => `"${val}"`).join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=real_estate_template.csv');
      res.status(200).send(csv);
    } catch (error) {
      console.error('Download template error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk upload real estate records from CSV
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
                const realEstateData = {
                  title: row.title || '',
                  description: row.description || '',
                  price: parseFloat(row.price) || 0,
                  location: row.location || '',
                  property_type: row.property_type || '',
                  bedrooms: parseInt(row.bedrooms) || 0,
                  bathrooms: parseInt(row.bathrooms) || 0,
                  area_sqft: parseFloat(row.area_sqft) || 0,
                  status: row.status || 'pending',
                  is_active: true
                };

                if (!realEstateData.title || !realEstateData.description) {
                  errors.push(`Row ${index + 1}: Title and description are required.`);
                  continue;
                }

                const record = await RealEstate.create(realEstateData);
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
}

module.exports = AdminRealEstateController;