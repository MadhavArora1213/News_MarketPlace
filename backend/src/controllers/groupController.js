const Group = require('../models/Group');
const { body, validationResult } = require('express-validator');

class GroupController {
  constructor() {
    const multer = require('multer');
    this.storage = multer.memoryStorage();
    this.csvUpload = multer({
      storage: this.storage,
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
          cb(null, true);
        } else {
          cb(new Error('Only CSV files are allowed'));
        }
      }
    });

    this.downloadTemplate = this.downloadTemplate.bind(this);
    this.bulkUpload = this.bulkUpload.bind(this);
    this.downloadCSV = this.downloadCSV.bind(this);
  }

  // Download CSV Template
  async downloadTemplate(req, res) {
    try {
      const headers = ['Group Name', 'Location', 'Website', 'LinkedIn', 'Instagram', 'Group SN (Optional)'];
      const dummyData = [
        ['Global Tech Group', 'San Francisco, USA', 'https://techgroup.com', 'https://linkedin.com/company/techgroup', 'https://instagram.com/techgroup', 'GRP-123456'],
        ['Local Community', 'London, UK', 'https://community.org', '', '', '']
      ];

      let csv = headers.join(',') + '\n';
      dummyData.forEach(row => {
        csv += row.map(val => `"${val}"`).join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=groups_template.csv');
      res.status(200).send(csv);
    } catch (error) {
      console.error('Download template error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk Upload
  async bulkUpload(req, res) {
    try {
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
            const createdGroups = [];
            const errors = [];

            for (const [index, row] of results.entries()) {
              try {
                const groupName = row['Group Name'] || row['group_name'];
                const groupLocation = row['Location'] || row['group_location'];
                const groupWebsite = row['Website'] || row['group_website'];

                if (!groupName || !groupLocation || !groupWebsite) {
                  throw new Error('Group Name, Location, and Website are required');
                }

                const groupData = {
                  group_name: groupName,
                  group_location: groupLocation,
                  group_website: groupWebsite,
                  group_linkedin: row['LinkedIn'] || row['group_linkedin'] || '',
                  group_instagram: row['Instagram'] || row['group_instagram'] || '',
                  group_sn: row['Group SN (Optional)'] || row['Group SN'] || row['group_sn'] || '',
                  submitted_by: req.user?.userId,
                  submitted_by_admin: req.admin?.adminId
                };

                const newGroup = await Group.create(groupData);
                createdGroups.push(newGroup);
              } catch (err) {
                errors.push(`Row ${index + 1}: ${err.message}`);
              }
            }

            res.json({
              message: `Bulk upload completed. ${createdGroups.length} groups created.`,
              count: createdGroups.length,
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

  // Download CSV
  async downloadCSV(req, res) {
    try {
      const { status, is_active, group_name } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (group_name) {
        searchSql += ` AND group_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${group_name}%`);
        searchParamCount++;
      }

      // Fetch all matching records (no limit)
      const groups = await Group.findAll(filters, searchSql, searchValues, null, 0);

      const headers = [
        'ID', 'Group SN', 'Group Name', 'Location', 'Website', 'LinkedIn', 'Instagram',
        'Status', 'Is Active', 'Created At'
      ];

      let csv = headers.join(',') + '\n';

      groups.forEach(group => {
        const escape = (text) => {
          if (text === null || text === undefined) return '';
          const stringValue = String(text);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        };

        const row = [
          group.id,
          escape(group.group_sn),
          escape(group.group_name),
          escape(group.group_location),
          escape(group.group_website),
          escape(group.group_linkedin),
          escape(group.group_instagram),
          escape(group.status),
          group.is_active ? 'Yes' : 'No',
          group.created_at ? new Date(group.created_at).toISOString().split('T')[0] : ''
        ];
        csv += row.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=groups_export.csv');
      res.status(200).send(csv);
    } catch (error) {
      console.error('Download CSV error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Validation rules
  createValidation = [
    body('group_sn').trim().isLength({ min: 1 }).withMessage('Group SN is required'),
    body('group_name').trim().isLength({ min: 1 }).withMessage('Group name is required'),
    body('group_location').trim().isLength({ min: 1 }).withMessage('Group location is required'),
    body('group_website').isURL().withMessage('Valid group website URL is required'),
  ];

  updateValidation = [
    body('group_sn').optional().trim().isLength({ min: 1 }).withMessage('Group SN is required'),
    body('group_name').optional().trim().isLength({ min: 1 }).withMessage('Group name is required'),
    body('group_location').optional().trim().isLength({ min: 1 }).withMessage('Group location is required'),
    body('group_website').optional().isURL().withMessage('Valid group website URL is required'),
    body('status').optional().isIn(['draft', 'pending', 'approved', 'rejected']).withMessage('Invalid status'),
  ];

  // Create a new group
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const groupData = {
        ...req.body,
        submitted_by: req.user?.userId,
        submitted_by_admin: req.admin?.adminId
      };

      const group = await Group.create(groupData);
      res.status(201).json({
        message: 'Group created successfully',
        group: group.toJSON()
      });
    } catch (error) {
      console.error('Create group error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all groups with filtering
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        is_active,
        group_name
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (is_active !== undefined) filters.is_active = is_active === 'true';

      // Add search filters
      let searchSql = '';
      const searchValues = [];
      let searchParamCount = Object.keys(filters).length + 1;

      if (group_name) {
        searchSql += ` AND group_name ILIKE $${searchParamCount}`;
        searchValues.push(`%${group_name}%`);
        searchParamCount++;
      }

      const offset = (page - 1) * limit;
      const groups = await Group.findAll(filters, searchSql, searchValues, limit, offset);

      // For admin routes, return all groups. For regular user routes, filter to only approved and active groups
      let filteredGroups = groups;
      if (!req.admin) {
        filteredGroups = groups.filter(group => group.status === 'approved' && group.is_active === true);
      }

      res.json({
        groups: filteredGroups.map(group => group.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredGroups.length // This should be improved with a count query
        }
      });
    } catch (error) {
      console.error('Get groups error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get group by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const group = await Group.findById(id);

      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      res.json({ group: group.toJSON() });
    } catch (error) {
      console.error('Get group by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update group
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
      const group = await Group.findById(id);

      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      const updatedGroup = await group.update(req.body);
      res.json({
        message: 'Group updated successfully',
        group: updatedGroup.toJSON()
      });
    } catch (error) {
      console.error('Update group error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete group (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const group = await Group.findById(id);

      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      await group.delete();
      res.json({ message: 'Group deleted successfully' });
    } catch (error) {
      console.error('Delete group error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get publications for a group
  async getPublications(req, res) {
    try {
      const { id } = req.params;
      const group = await Group.findById(id);

      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      const publications = await group.getPublications();
      res.json({
        group: group.toJSON(),
        publications: publications.map(pub => pub.toJSON())
      });
    } catch (error) {
      console.error('Get group publications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk create groups
  async bulkCreate(req, res) {
    try {
      const { groups } = req.body;

      if (!Array.isArray(groups) || groups.length === 0) {
        return res.status(400).json({ error: 'Groups array is required' });
      }

      const createdGroups = [];
      const errors = [];

      for (let i = 0; i < groups.length; i++) {
        try {
          const groupData = {
            ...groups[i],
            submitted_by: req.user?.userId,
            submitted_by_admin: req.admin?.adminId
          };
          const group = await Group.create(groupData);
          createdGroups.push(group.toJSON());
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.status(201).json({
        message: `Created ${createdGroups.length} groups successfully`,
        created: createdGroups,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk create groups error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk update groups
  async bulkUpdate(req, res) {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: 'Updates array is required' });
      }

      const updatedGroups = [];
      const errors = [];

      for (let i = 0; i < updates.length; i++) {
        try {
          const { id, ...updateData } = updates[i];
          const group = await Group.findById(id);

          if (!group) {
            errors.push({ index: i, error: 'Group not found' });
            continue;
          }

          const updatedGroup = await group.update(updateData);
          updatedGroups.push(updatedGroup.toJSON());
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Updated ${updatedGroups.length} groups successfully`,
        updated: updatedGroups,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk update groups error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Bulk delete groups
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
          const group = await Group.findById(ids[i]);

          if (!group) {
            errors.push({ index: i, error: 'Group not found' });
            continue;
          }

          await group.delete();
          deletedCount.push(ids[i]);
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        message: `Deleted ${deletedCount.length} groups successfully`,
        deleted: deletedCount,
        errors: errors
      });
    } catch (error) {
      console.error('Bulk delete groups error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update group status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['draft', 'pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const group = await Group.findById(id);

      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }

      const updatedGroup = await group.update({ status });
      res.json({
        message: 'Group status updated successfully',
        group: updatedGroup.toJSON()
      });
    } catch (error) {
      console.error('Update group status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new GroupController();