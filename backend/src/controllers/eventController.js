const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const EventRegistration = require('../models/EventRegistration');
const EventDisclaimer = require('../models/EventDisclaimer');
const { body, validationResult } = require('express-validator');
const { triggerSEOUpdate } = require('../utils/seoUtility');

class EventController {

  // Validation rules
  createValidation = [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').optional().trim(),
    body('country').optional().trim(),
    body('city').optional().trim(),
    body('start_date').isISO8601().withMessage('Valid start date is required'),
    body('end_date').optional().isISO8601().withMessage('Valid end date is required'),
    body('month').optional().trim(),
    body('event_type').optional().isIn(['Government Summit', 'Power List', 'Membership', 'Leisure Events', 'Sports Events', 'Music Festival', 'Art Festival']).withMessage('Invalid event type'),
    body('is_free').optional().isBoolean().withMessage('is_free must be a boolean'),
    body('organizer').optional().trim(),
    body('venue').optional().trim(),
    body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
    body('registration_deadline').optional().isISO8601().withMessage('Valid registration deadline is required'),
    body('status').optional().isIn(['active', 'cancelled', 'completed']).withMessage('Invalid status'),
    body('custom_form_fields').optional().isObject().withMessage('Custom form fields must be an object'),
    body('disclaimer_text').optional().trim(),
    body('enable_sponsor').optional().isBoolean().withMessage('enable_sponsor must be a boolean'),
    body('enable_media_partner').optional().isBoolean().withMessage('enable_media_partner must be a boolean'),
    body('enable_speaker').optional().isBoolean().withMessage('enable_speaker must be a boolean'),
    body('enable_guest').optional().isBoolean().withMessage('enable_guest must be a boolean')
  ];

  updateValidation = [
    body('title').optional().trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').optional().trim(),
    body('country').optional().trim(),
    body('city').optional().trim(),
    body('start_date').optional().isISO8601().withMessage('Valid start date is required'),
    body('end_date').optional().isISO8601().withMessage('Valid end date is required'),
    body('month').optional().trim(),
    body('event_type').optional().isIn(['Government Summit', 'Power List', 'Membership', 'Leisure Events', 'Sports Events', 'Music Festival', 'Art Festival']).withMessage('Invalid event type'),
    body('is_free').optional().isBoolean().withMessage('is_free must be a boolean'),
    body('organizer').optional().trim(),
    body('venue').optional().trim(),
    body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
    body('registration_deadline').optional().isISO8601().withMessage('Valid registration deadline is required'),
    body('status').optional().isIn(['active', 'cancelled', 'completed']).withMessage('Invalid status'),
    body('custom_form_fields').optional().isObject().withMessage('Custom form fields must be an object'),
    body('disclaimer_text').optional().trim(),
    body('enable_sponsor').optional().isBoolean().withMessage('enable_sponsor must be a boolean'),
    body('enable_media_partner').optional().isBoolean().withMessage('enable_media_partner must be a boolean'),
    body('enable_speaker').optional().isBoolean().withMessage('enable_speaker must be a boolean'),
    body('enable_guest').optional().isBoolean().withMessage('enable_guest must be a boolean')
  ];

  constructor() {
    const multer = require('multer');

    // Multer setup for CSV upload
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

    // Bind methods
    this.downloadTemplate = this.downloadTemplate.bind(this);
    this.bulkUpload = this.bulkUpload.bind(this);
    this.downloadCSV = this.downloadCSV.bind(this);
  }

  // Download CSV Template
  async downloadTemplate(req, res) {
    try {
      const headers = [
        'Title', 'Description', 'Country', 'City', 'Start Date (YYYY-MM-DD)',
        'End Date (YYYY-MM-DD)', 'Event Type', 'Is Free (true/false)',
        'Organizer', 'Venue', 'Capacity'
      ];

      const dummyData = [
        ['Tech Summit 2025', 'Annual Tech Conference', 'USA', 'San Francisco', '2025-06-15', '2025-06-17', 'Government Summit', 'false', 'Tech Corp', 'Convention Center', '1000'],
        ['Community Meetup', 'Local gathering', 'UK', 'London', '2025-07-20', '2025-07-20', 'Leisure Events', 'true', 'Community Group', 'Public Park', '50']
      ];

      let csv = headers.join(',') + '\n';
      dummyData.forEach(row => {
        csv += row.map(val => `"${val}"`).join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=event_template.csv');
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
            const createdRecords = [];
            const errors = [];

            for (const [index, row] of results.entries()) {
              try {
                // Map CSV fields to Event fields
                const title = row['Title'] || row['title'];
                if (!title) throw new Error('Title is required');

                const eventData = {
                  title,
                  description: row['Description'] || row['description'] || '',
                  country: row['Country'] || row['country'] || '',
                  city: row['City'] || row['city'] || '',
                  start_date: row['Start Date (YYYY-MM-DD)'] || row['Start Date'] || row['start_date'],
                  end_date: row['End Date (YYYY-MM-DD)'] || row['End Date'] || row['end_date'],
                  event_type: row['Event Type'] || row['event_type'],
                  is_free: (row['Is Free (true/false)'] || row['Is Free'] || row['is_free']) === 'true',
                  organizer: row['Organizer'] || row['organizer'] || '',
                  venue: row['Venue'] || row['venue'] || '',
                  capacity: parseInt(row['Capacity'] || row['capacity']) || null,
                  status: 'active',
                  created_by: req.admin?.id
                };

                if (!eventData.start_date) throw new Error('Start date is required');

                const event = await Event.create(eventData);
                createdRecords.push(event);
              } catch (err) {
                errors.push(`Row ${index + 1}: ${err.message}`);
              }
            }

            res.json({
              message: `Bulk upload completed. ${createdRecords.length} events created.`,
              count: createdRecords.length,
              errors: errors.length > 0 ? errors : undefined
            });

            // Trigger SEO and Sitemap update
            triggerSEOUpdate();
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
      const {
        country,
        city,
        month,
        event_type,
        is_free,
        search
      } = req.query;

      const filters = {};
      if (country) filters.country = country;
      if (city) filters.city = city;
      if (month) filters.month = month;
      if (event_type) filters.event_type = event_type;
      if (is_free !== undefined && is_free !== '') filters.is_free = is_free === 'true';

      let searchSql = '';
      const searchValues = [];
      let paramStart = Object.keys(filters).length + 1;

      if (search) {
        searchSql = ` AND (
          title ILIKE $${paramStart} OR
          description ILIKE $${paramStart} OR
          organizer ILIKE $${paramStart} OR
          venue ILIKE $${paramStart}
        )`;
        searchValues.push(`%${search}%`);
      }

      // Fetch all matching events (limit: null)
      const events = await Event.findAll(filters, searchSql, searchValues, null, 0);

      const headers = [
        'ID', 'Title', 'Description', 'Country', 'City', 'Start Date', 'End Date',
        'Event Type', 'Is Free', 'Organizer', 'Venue', 'Capacity', 'Status', 'Created At'
      ];

      let csv = headers.join(',') + '\n';

      events.forEach(event => {
        const escape = (text) => {
          if (text === null || text === undefined) return '';
          const stringValue = String(text);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        };

        const row = [
          event.id,
          escape(event.title),
          escape(event.description),
          escape(event.country),
          escape(event.city),
          escape(event.start_date),
          escape(event.end_date),
          escape(event.event_type),
          event.is_free ? 'Yes' : 'No',
          escape(event.organizer),
          escape(event.venue),
          event.capacity || '',
          escape(event.status),
          event.created_at ? new Date(event.created_at).toISOString().split('T')[0] : ''
        ];
        csv += row.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=events_export.csv');
      res.status(200).send(csv);

    } catch (error) {
      console.error('Download CSV error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create a new event (admin only)
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const eventData = {
        ...req.body,
        created_by: req.admin?.id || req.body.created_by
      };

      const event = await Event.create(eventData);

      res.status(201).json({
        message: 'Event created successfully',
        event: event.toJSON()
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all events (public with filters)
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        country,
        city,
        month,
        event_type,
        is_free, // paid/free filter
        search
      } = req.query;

      const filters = {};

      if (country) filters.country = country;
      if (city) filters.city = city;
      if (month) filters.month = month;
      if (event_type) filters.event_type = event_type;
      if (is_free !== undefined) filters.is_free = is_free === 'true';

      let searchSql = '';
      const searchValues = [];
      let paramStart = Object.keys(filters).length + 1;

      if (search) {
        searchSql = ` AND (
          title ILIKE $${paramStart} OR
          description ILIKE $${paramStart} OR
          organizer ILIKE $${paramStart} OR
          venue ILIKE $${paramStart}
        )`;
        searchValues.push(`%${search}%`);
        paramStart++;
      }

      const offset = (page - 1) * limit;
      const events = await Event.findAll(filters, searchSql, searchValues, limit, offset);

      res.json({
        events: events.map(event => event.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get event by ID (public)
  async getById(req, res) {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Get associated tickets and disclaimers
      const tickets = await Ticket.findByEventId(id, { status: 'active' });
      const disclaimers = await EventDisclaimer.findByEventId(id, true);

      res.json({
        event: event.toJSON(),
        tickets: tickets.map(ticket => ticket.toJSON()),
        disclaimers: disclaimers.map(disclaimer => disclaimer.toJSON())
      });
    } catch (error) {
      console.error('Get event by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update event (admin only)
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
      const event = await Event.findById(id);

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const updatedEvent = await event.update(req.body);
      res.json({
        message: 'Event updated successfully',
        event: updatedEvent.toJSON()
      });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete event (admin only)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      await event.delete();
      res.json({ message: 'Event deleted successfully' });

      // Trigger SEO and Sitemap update
      triggerSEOUpdate();
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get event registrations (admin only)
  async getRegistrations(req, res) {
    try {
      const { id } = req.params;
      const { status, payment_status } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (payment_status) filters.payment_status = payment_status;

      const registrations = await EventRegistration.findByEventId(id, filters);

      res.json({
        registrations: registrations.map(reg => reg.toJSON())
      });
    } catch (error) {
      console.error('Get event registrations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new EventController();