const PressPack = require('../models/PressPack');
const Publication = require('../models/Publication');
const { body, validationResult } = require('express-validator');

class PressPackController {
  // Validation rules
  createValidation = [
    body('distribution_package').trim().isLength({ min: 1 }).withMessage('Distribution package is required'),
    body('region').trim().isLength({ min: 1 }).withMessage('Region is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('industry').trim().isLength({ min: 1 }).withMessage('Industry is required'),
    body('indexed').isBoolean().withMessage('Indexed must be a boolean value'),
    body('no_of_indexed_websites').isInt({ min: 0 }).withMessage('Number of indexed websites must be a non-negative integer'),
    body('no_of_non_indexed_websites').isInt({ min: 0 }).withMessage('Number of non-indexed websites must be a non-negative integer'),
    body('words_limit').isInt({ min: 0 }).withMessage('Words limit must be a non-negative integer'),
    body('language').trim().isLength({ min: 1 }).withMessage('Language is required'),
    body('news').optional().trim(),
    body('disclaimer').optional().trim(),
    body('image').optional().trim(),
    body('link').optional().isURL().withMessage('Link must be a valid URL')
  ];

  updateValidation = [
    body('distribution_package').optional({ checkFalsy: true }).trim().isLength({ min: 1 }).withMessage('Distribution package cannot be empty if provided'),
    body('region').optional({ checkFalsy: true }).trim().isLength({ min: 1 }).withMessage('Region cannot be empty if provided'),
    body('price').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('industry').optional({ checkFalsy: true }).trim().isLength({ min: 1 }).withMessage('Industry cannot be empty if provided'),
    body('indexed').optional().isBoolean().withMessage('Indexed must be a boolean value'),
    body('no_of_indexed_websites').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Number of indexed websites must be a non-negative integer'),
    body('no_of_non_indexed_websites').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Number of non-indexed websites must be a non-negative integer'),
    body('words_limit').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Words limit must be a non-negative integer'),
    body('language').optional({ checkFalsy: true }).trim().isLength({ min: 1 }).withMessage('Language cannot be empty if provided'),
    body('news').optional(),
    body('disclaimer').optional(),
    body('image').optional(),
    body('link').optional().isURL().withMessage('Link must be a valid URL'),
    body('is_active').optional().isBoolean().withMessage('Is active must be a boolean value')
  ];

  // Get all press packs with filtering and pagination
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        region,
        industry,
        indexed,
        language,
        is_active,
        search
      } = req.query;

      const filters = {};

      // Add filters
      if (region) filters.region = region;
      if (industry) filters.industry = industry;
      if (indexed !== undefined) filters.indexed = indexed === 'true';
      if (language) filters.language = language;
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      // For regular users, only show active press packs
      if (req.user && !req.admin) {
        filters.is_active = true;
      }

      // Add search functionality
      let searchSql = '';
      const searchValues = [];

      if (search) {
        searchSql = ` AND (distribution_package ILIKE $${Object.keys(filters).length + 1} OR news ILIKE $${Object.keys(filters).length + 1})`;
        searchValues.push(`%${search}%`);
      }

      const offset = (page - 1) * limit;
      const pressPacks = await PressPack.findAll(filters, searchSql, searchValues, limit, offset);

      // Get total count for pagination (more efficient approach)
      const allPressPacks = await PressPack.findAll(filters, searchSql, searchValues, null, null);
      const total = allPressPacks.length;

      res.json({
        pressPacks: pressPacks.map(pp => pp.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all press packs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get press pack by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const pressPack = await PressPack.findById(id);

      if (!pressPack) {
        return res.status(404).json({ error: 'Press pack not found' });
      }

      // For regular users, only show active press packs
      if (req.user && !req.admin && !pressPack.is_active) {
        return res.status(404).json({ error: 'Press pack not found' });
      }

      res.json({ pressPack: pressPack.toJSON() });
    } catch (error) {
      console.error('Get press pack by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create a new press pack (admin only)
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const pressPackData = req.body;

      // Convert numeric fields
      const numericFields = ['price', 'no_of_indexed_websites', 'no_of_non_indexed_websites', 'words_limit'];
      numericFields.forEach(field => {
        if (pressPackData[field] !== undefined && pressPackData[field] !== '') {
          const num = parseFloat(pressPackData[field]);
          pressPackData[field] = isNaN(num) ? null : num;
        }
      });

      // Convert boolean fields
      if (pressPackData.indexed !== undefined) {
        pressPackData.indexed = pressPackData.indexed === 'true' || pressPackData.indexed === true;
      }

      const pressPack = await PressPack.create(pressPackData);
      res.status(201).json({
        message: 'Press pack created successfully',
        pressPack: pressPack.toJSON()
      });
    } catch (error) {
      console.error('Create press pack error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update press pack (admin only)
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
      const pressPack = await PressPack.findById(id);

      if (!pressPack) {
        return res.status(404).json({ error: 'Press pack not found' });
      }

      const updateData = {};

      // Process each field from req.body
      Object.keys(req.body).forEach(field => {
        const value = req.body[field];

        // Skip empty strings for optional fields
        if (value === '') {
          return;
        }

        // Convert numeric fields
        const numericFields = ['price', 'no_of_indexed_websites', 'no_of_non_indexed_websites', 'words_limit'];
        if (numericFields.includes(field)) {
          const num = parseFloat(value);
          updateData[field] = isNaN(num) ? null : num;
        }
        // Convert boolean fields
        else if (field === 'indexed' || field === 'is_active') {
          updateData[field] = value === 'true' || value === true;
        }
        // Keep other fields as-is
        else {
          updateData[field] = value;
        }
      });

      const updatedPressPack = await pressPack.update(updateData);
      res.json({
        message: 'Press pack updated successfully',
        pressPack: updatedPressPack.toJSON()
      });
    } catch (error) {
      console.error('Update press pack error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete press pack (admin only)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const pressPack = await PressPack.findById(id);

      if (!pressPack) {
        return res.status(404).json({ error: 'Press pack not found' });
      }

      await pressPack.delete();
      res.json({ message: 'Press pack deleted successfully' });
    } catch (error) {
      console.error('Delete press pack error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk create press packs (admin only)
  async bulkCreate(req, res) {
    try {
      const { pressPacks } = req.body;

      if (!Array.isArray(pressPacks) || pressPacks.length === 0) {
        return res.status(400).json({ error: 'Press packs array is required' });
      }

      const createdPressPacks = [];
      const errors = [];

      for (let i = 0; i < pressPacks.length; i++) {
        try {
          const pressPackData = pressPacks[i];

          // Convert numeric fields
          const numericFields = ['price', 'no_of_indexed_websites', 'no_of_non_indexed_websites', 'words_limit'];
          numericFields.forEach(field => {
            if (pressPackData[field] !== undefined && pressPackData[field] !== '') {
              const num = parseFloat(pressPackData[field]);
              pressPackData[field] = isNaN(num) ? null : num;
            }
          });

          // Convert boolean fields
          if (pressPackData.indexed !== undefined) {
            pressPackData.indexed = pressPackData.indexed === 'true' || pressPackData.indexed === true;
          }

          const pressPack = await PressPack.create(pressPackData);
          createdPressPacks.push(pressPack.toJSON());
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.status(201).json({
        message: `Created ${createdPressPacks.length} press packs successfully`,
        created: createdPressPacks,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk create press packs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk update press packs (admin only)
  async bulkUpdate(req, res) {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: 'Updates array is required' });
      }

      const updatedPressPacks = [];
      const errors = [];

      for (let i = 0; i < updates.length; i++) {
        try {
          const { id, ...rawUpdateData } = updates[i];
          const pressPack = await PressPack.findById(id);

          if (!pressPack) {
            errors.push({ index: i, error: 'Press pack not found' });
            continue;
          }

          // Process update data, filtering out empty strings
          const updateData = {};
          Object.keys(rawUpdateData).forEach(field => {
            const value = rawUpdateData[field];

            // Skip empty strings for optional fields
            if (value === '') {
              return;
            }

            // Convert numeric fields
            const numericFields = ['price', 'no_of_indexed_websites', 'no_of_non_indexed_websites', 'words_limit'];
            if (numericFields.includes(field)) {
              const num = parseFloat(value);
              updateData[field] = isNaN(num) ? null : num;
            }
            // Convert boolean fields
            else if (field === 'indexed' || field === 'is_active') {
              updateData[field] = value === 'true' || value === true;
            }
            // Keep other fields as-is
            else {
              updateData[field] = value;
            }
          });

          const updatedPressPack = await pressPack.update(updateData);
          updatedPressPacks.push(updatedPressPack.toJSON());
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Updated ${updatedPressPacks.length} press packs successfully`,
        updated: updatedPressPacks,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk update press packs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk delete press packs (admin only)
  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Press pack IDs array is required' });
      }

      const deletedCount = [];
      const errors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const pressPack = await PressPack.findById(ids[i]);

          if (!pressPack) {
            errors.push({ index: i, error: 'Press pack not found' });
            continue;
          }

          await pressPack.delete();
          deletedCount.push(ids[i]);
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Deleted ${deletedCount.length} press packs successfully`,
        deleted: deletedCount,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk delete press packs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get publications associated with a press pack
  async getPublications(req, res) {
    try {
      const { id } = req.params;
      const pressPack = await PressPack.findById(id);

      if (!pressPack) {
        return res.status(404).json({ error: 'Press pack not found' });
      }

      const publications = await pressPack.getPublications();
      res.json({
        pressPackId: id,
        publications: publications.map(pub => pub.toJSON())
      });
    } catch (error) {
      console.error('Get press pack publications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Add publication to press pack (admin only)
  async addPublication(req, res) {
    try {
      const { id, publicationId } = req.params;

      const pressPack = await PressPack.findById(id);
      if (!pressPack) {
        return res.status(404).json({ error: 'Press pack not found' });
      }

      const publication = await Publication.findById(publicationId);
      if (!publication) {
        return res.status(404).json({ error: 'Publication not found' });
      }

      await pressPack.addPublication(publicationId);
      res.json({ message: 'Publication added to press pack successfully' });
    } catch (error) {
      console.error('Add publication to press pack error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Remove publication from press pack (admin only)
  async removePublication(req, res) {
    try {
      const { id, publicationId } = req.params;

      const pressPack = await PressPack.findById(id);
      if (!pressPack) {
        return res.status(404).json({ error: 'Press pack not found' });
      }

      await pressPack.removePublication(publicationId);
      res.json({ message: 'Publication removed from press pack successfully' });
    } catch (error) {
      console.error('Remove publication from press pack error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new PressPackController();