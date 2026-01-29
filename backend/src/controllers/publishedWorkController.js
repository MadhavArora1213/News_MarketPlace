const PublishedWork = require('../models/PublishedWork');
const { triggerSEOUpdate } = require('../utils/seoUtility');
const { body, validationResult } = require('express-validator');
const publicationExtractorService = require('../services/publicationExtractorService');

class PublishedWorkController {
  // Validation rules
  createValidation = [
    body('sn').trim().isLength({ min: 1 }).withMessage('SN is required'),
    body('publication_name').trim().isLength({ min: 1 }).withMessage('Publication name is required'),
    body('publication_website').isURL().withMessage('Valid publication website URL is required'),
    body('article_link').isURL().withMessage('Valid article link URL is required'),
    body('article_year').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Valid article year is required'),
    body('company_name').trim().isLength({ min: 1 }).withMessage('Company name is required'),
    body('person_name').trim().isLength({ min: 1 }).withMessage('Person name is required'),
    body('industry').trim().isLength({ min: 1 }).withMessage('Industry is required'),
    body('company_country').trim().isLength({ min: 1 }).withMessage('Company country is required'),
    body('individual_country').trim().isLength({ min: 1 }).withMessage('Individual country is required'),
    body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('is_featured').optional().isBoolean().withMessage('is_featured must be a boolean'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
  ];

  updateValidation = [
    body('sn').optional().trim().isLength({ min: 1 }).withMessage('SN is required'),
    body('publication_name').optional().trim().isLength({ min: 1 }).withMessage('Publication name is required'),
    body('publication_website').optional().isURL().withMessage('Valid publication website URL is required'),
    body('article_link').optional().isURL().withMessage('Valid article link URL is required'),
    body('article_year').optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Valid article year is required'),
    body('company_name').optional().trim().isLength({ min: 1 }).withMessage('Company name is required'),
    body('person_name').optional().trim().isLength({ min: 1 }).withMessage('Person name is required'),
    body('industry').optional().trim().isLength({ min: 1 }).withMessage('Industry is required'),
    body('company_country').optional().trim().isLength({ min: 1 }).withMessage('Company country is required'),
    body('individual_country').optional().trim().isLength({ min: 1 }).withMessage('Individual country is required'),
    body('description').optional().trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('is_featured').optional().isBoolean().withMessage('is_featured must be a boolean'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
  ];

  // Create a new published work (admin only)
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const publishedWorkData = req.body;
      const publishedWork = await PublishedWork.create(publishedWorkData);

      res.status(201).json({
        message: 'Published work created successfully',
        publishedWork: publishedWork.toJSON()
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Create published work error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all published works (public listing)
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        is_featured,
        search,
        industry,
        company_country,
        individual_country,
        article_year,
        publication_name
      } = req.query;

      const filters = {};
      if (is_featured !== undefined) filters.is_featured = is_featured === 'true';

      let searchSql = '';
      const searchValues = [];
      let paramStart = filters.is_featured !== undefined ? 2 : 1; // Start after filter parameters

      if (search) {
        searchSql = ` AND (
          publication_name ILIKE $${paramStart} OR
          company_name ILIKE $${paramStart} OR
          person_name ILIKE $${paramStart} OR
          industry ILIKE $${paramStart} OR
          company_country ILIKE $${paramStart} OR
          individual_country ILIKE $${paramStart} OR
          description ILIKE $${paramStart}
        )`;
        searchValues.push(`%${search}%`);
        paramStart++;
      }

      if (industry) {
        searchSql += ` AND industry ILIKE $${paramStart}`;
        searchValues.push(`%${industry}%`);
        paramStart++;
      }

      if (company_country) {
        searchSql += ` AND company_country ILIKE $${paramStart}`;
        searchValues.push(`%${company_country}%`);
        paramStart++;
      }

      if (individual_country) {
        searchSql += ` AND individual_country ILIKE $${paramStart}`;
        searchValues.push(`%${individual_country}%`);
        paramStart++;
      }

      if (article_year) {
        searchSql += ` AND article_year = $${paramStart}`;
        searchValues.push(parseInt(article_year));
        paramStart++;
      }

      if (publication_name) {
        searchSql += ` AND publication_name ILIKE $${paramStart}`;
        searchValues.push(`%${publication_name}%`);
        paramStart++;
      }

      const offset = (page - 1) * limit;
      const publishedWorks = await PublishedWork.findAll(filters, searchSql, searchValues, limit, offset);

      res.json({
        publishedWorks: publishedWorks.map(pw => pw.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get published works error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get published work by ID (public detail view)
  async getById(req, res) {
    try {
      const { id } = req.params;
      const publishedWork = await PublishedWork.findById(id);

      if (!publishedWork) {
        return res.status(404).json({ error: 'Published work not found' });
      }

      res.json({ publishedWork: publishedWork.toJSON() });
    } catch (error) {
      console.error('Get published work by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get published work by SN (public detail view)
  async getBySN(req, res) {
    try {
      const { sn } = req.params;
      const publishedWork = await PublishedWork.findBySN(sn);

      if (!publishedWork) {
        return res.status(404).json({ error: 'Published work not found' });
      }

      res.json({ publishedWork: publishedWork.toJSON() });
    } catch (error) {
      console.error('Get published work by SN error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get featured published works (public)
  async getFeatured(req, res) {
    try {
      const { limit = 10 } = req.query;
      const publishedWorks = await PublishedWork.getFeatured(parseInt(limit));

      res.json({
        publishedWorks: publishedWorks.map(pw => pw.toJSON())
      });
    } catch (error) {
      console.error('Get featured published works error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Search published works (public)
  async search(req, res) {
    try {
      const {
        q: searchTerm,
        page = 1,
        limit = 10,
        filters = {}
      } = req.query;

      const offset = (page - 1) * limit;
      const publishedWorks = await PublishedWork.search(searchTerm, filters, limit, offset);

      res.json({
        publishedWorks: publishedWorks.map(pw => pw.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Search published works error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update published work (admin only)
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
      const publishedWork = await PublishedWork.findById(id);

      if (!publishedWork) {
        return res.status(404).json({ error: 'Published work not found' });
      }

      const updatedPublishedWork = await publishedWork.update(req.body);
      res.json({
        message: 'Published work updated successfully',
        publishedWork: updatedPublishedWork.toJSON()
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Update published work error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete published work (soft delete, admin only)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const publishedWork = await PublishedWork.findById(id);

      if (!publishedWork) {
        return res.status(404).json({ error: 'Published work not found' });
      }

      await publishedWork.delete();
      res.json({ message: 'Published work deleted successfully' });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Delete published work error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Toggle featured status (admin only)
  async toggleFeatured(req, res) {
    try {
      const { id } = req.params;
      const publishedWork = await PublishedWork.findById(id);

      if (!publishedWork) {
        return res.status(404).json({ error: 'Published work not found' });
      }

      const updatedPublishedWork = await publishedWork.update({
        is_featured: !publishedWork.is_featured
      });

      res.json({
        message: `Published work ${updatedPublishedWork.is_featured ? 'featured' : 'unfeatured'} successfully`,
        publishedWork: updatedPublishedWork.toJSON()
      });
    } catch (error) {
      console.error('Toggle featured error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk create published works (admin only)
  async bulkCreate(req, res) {
    try {
      const { publishedWorks } = req.body;

      if (!Array.isArray(publishedWorks) || publishedWorks.length === 0) {
        return res.status(400).json({ error: 'Published works array is required' });
      }

      const createdPublishedWorks = [];
      const errors = [];

      for (let i = 0; i < publishedWorks.length; i++) {
        try {
          const publishedWork = await PublishedWork.create(publishedWorks[i]);
          createdPublishedWorks.push(publishedWork.toJSON());
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.status(201).json({
        message: `Created ${createdPublishedWorks.length} published works successfully`,
        created: createdPublishedWorks,
        errors: errors
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Bulk create published works error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk update published works (admin only)
  async bulkUpdate(req, res) {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: 'Updates array is required' });
      }

      const updatedPublishedWorks = [];
      const errors = [];

      for (let i = 0; i < updates.length; i++) {
        try {
          const { id, ...updateData } = updates[i];
          const publishedWork = await PublishedWork.findById(id);

          if (!publishedWork) {
            errors.push({ index: i, error: 'Published work not found' });
            continue;
          }

          const updatedPublishedWork = await publishedWork.update(updateData);
          updatedPublishedWorks.push(updatedPublishedWork.toJSON());
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Updated ${updatedPublishedWorks.length} published works successfully`,
        updated: updatedPublishedWorks,
        errors: errors
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Bulk update published works error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk delete published works (admin only)
  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' });
      }

      const deletedCount = [];
      const errors = [];

      for (let i = 0; i < ids.length; i++) {
        try {
          const publishedWork = await PublishedWork.findById(ids[i]);

          if (!publishedWork) {
            errors.push({ index: i, error: 'Published work not found' });
            continue;
          }

          await publishedWork.delete();
          deletedCount.push(ids[i]);
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Deleted ${deletedCount.length} published works successfully`,
        deleted: deletedCount,
        errors: errors
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Bulk delete published works error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Extract publication information from article URL (admin only)
  async extractPublicationInfo(req, res) {
    try {
      const { articleUrl } = req.body;

      if (!articleUrl) {
        return res.status(400).json({ error: 'Article URL is required' });
      }

      // Basic URL validation
      try {
        new URL(articleUrl);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      const publicationInfo = await publicationExtractorService.extractPublicationInfo(articleUrl);

      res.json({
        publication_name: publicationInfo.publication_name,
        publication_website: publicationInfo.publication_website
      });
    } catch (error) {
      console.error('Extract publication info error:', error);
      res.status(500).json({ error: 'Failed to extract publication information' });
    }
  }
}

module.exports = new PublishedWorkController();