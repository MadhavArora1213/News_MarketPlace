const { query } = require('../config/database');

class PressPackOrder {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.whatsapp_number = data.whatsapp_number;
    this.calling_number = data.calling_number;
    this.press_release_selection = data.press_release_selection;
    this.email = data.email;
    this.company_registration_document = data.company_registration_document;
    this.letter_of_authorisation = data.letter_of_authorisation;
    this.image = data.image;
    this.word_pdf_document = data.word_pdf_document;
    this.submitted_by_type = data.submitted_by_type;
    this.package_selection = data.package_selection;
    this.message = data.message;
    this.captcha_token = data.captcha_token;
    this.terms_accepted = data.terms_accepted !== undefined ? data.terms_accepted : false;
    this.content_writing_assistance = data.content_writing_assistance !== undefined ? data.content_writing_assistance : false;
    this.status = data.status || 'pending';
    this.submitted_by = data.submitted_by;
    this.submitted_by_admin = data.submitted_by_admin;
    this.approved_at = data.approved_at;
    this.approved_by = data.approved_by;
    this.rejected_at = data.rejected_at;
    this.rejected_by = data.rejected_by;
    this.rejection_reason = data.rejection_reason;
    this.admin_comments = data.admin_comments;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validate order data
  static validate(orderData) {
    const errors = [];

    // Required fields
    if (!orderData.name || typeof orderData.name !== 'string' || orderData.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!orderData.email || typeof orderData.email !== 'string' || !orderData.email.includes('@')) {
      errors.push('Valid email is required');
    }

    if (!orderData.captcha_token || typeof orderData.captcha_token !== 'string') {
      errors.push('CAPTCHA token is required');
    }

    if (orderData.terms_accepted !== true) {
      errors.push('Terms and conditions must be accepted');
    }

    // Optional fields validation
    const stringFields = [
      'whatsapp_number', 'calling_number', 'company_registration_document',
      'letter_of_authorisation', 'image', 'word_pdf_document', 'submitted_by_type',
      'package_selection', 'message'
    ];

    stringFields.forEach(field => {
      if (orderData[field] !== undefined && typeof orderData[field] !== 'string') {
        errors.push(`${field.replace(/_/g, ' ')} must be a string`);
      }
    });

    // Press release selection
    if (orderData.press_release_selection !== undefined && !Number.isInteger(orderData.press_release_selection)) {
      errors.push('Press release selection must be an integer');
    }

    // Boolean fields
    const booleanFields = ['terms_accepted', 'content_writing_assistance'];
    booleanFields.forEach(field => {
      if (orderData[field] !== undefined && typeof orderData[field] !== 'boolean') {
        errors.push(`${field.replace(/_/g, ' ')} must be a boolean`);
      }
    });

    // Status validation
    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
    if (orderData.status && !validStatuses.includes(orderData.status)) {
      errors.push('Status must be one of: pending, approved, rejected, completed');
    }

    // User association - submitted_by is required for user submissions, optional for admin submissions
    if (orderData.submitted_by !== undefined && orderData.submitted_by !== null && !Number.isInteger(orderData.submitted_by)) {
      errors.push('Submitted by must be an integer');
    }

    // For admin submissions, either submitted_by or submitted_by_admin should be present
    if (orderData.submitted_by_admin !== undefined && orderData.submitted_by_admin !== null && !Number.isInteger(orderData.submitted_by_admin)) {
      errors.push('Submitted by admin must be an integer');
    }

    return errors;
  }

  // Create a new order
  static async create(orderData) {
    const validationErrors = this.validate(orderData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    const allowedFields = [
      'name', 'whatsapp_number', 'calling_number', 'press_release_selection', 'email',
      'company_registration_document', 'letter_of_authorisation', 'image', 'word_pdf_document',
      'submitted_by_type', 'package_selection', 'message', 'captcha_token', 'terms_accepted',
      'content_writing_assistance', 'status', 'submitted_by', 'submitted_by_admin'
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (orderData[field] !== undefined) {
        filteredData[field] = orderData[field];
      }
    });

    const fields = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const placeholders = fields.map((_, index) => `$${index + 1}`);

    const sql = `
      INSERT INTO press_pack_orders (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await query(sql, values);
    return new PressPackOrder(result.rows[0]);
  }

  // Find order by ID
  static async findById(id) {
    const sql = 'SELECT * FROM press_pack_orders WHERE id = $1';
    const result = await query(sql, [id]);
    if (result.rows[0]) {
      return new PressPackOrder(result.rows[0]);
    }
    return null;
  }

  // Find all orders with optional filters
  static async findAll(filters = {}, limit = null, offset = 0) {
    let whereClause = '';
    const params = [];
    let paramCount = 1;

    const filterFields = ['status', 'press_release_selection', 'submitted_by', 'approved_by', 'rejected_by'];
    const conditions = [];

    filterFields.forEach(field => {
      if (filters[field] !== undefined) {
        conditions.push(`${field} = $${paramCount}`);
        params.push(filters[field]);
        paramCount++;
      }
    });

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    let sql = `SELECT * FROM press_pack_orders ${whereClause} ORDER BY created_at DESC`;

    if (limit !== null) {
      sql += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limit, offset);
    }

    const result = await query(sql, params);
    return result.rows.map(row => new PressPackOrder(row));
  }

  // Get count of orders with optional filters
  static async getCount(filters = {}) {
    let whereClause = '';
    const params = [];

    const filterFields = ['status', 'press_release_selection', 'submitted_by', 'approved_by', 'rejected_by'];
    const conditions = [];

    filterFields.forEach(field => {
      if (filters[field] !== undefined) {
        conditions.push(`${field} = $${params.length + 1}`);
        params.push(filters[field]);
      }
    });

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const sql = `SELECT COUNT(*) as total FROM press_pack_orders ${whereClause}`;
    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }

  // Update order
  async update(updateData) {
    // For status updates, only validate the status field to avoid issues with existing invalid data
    if ('status' in updateData) {
      const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
      if (!validStatuses.includes(updateData.status)) {
        throw new Error('Validation errors: Status must be one of: pending, approved, rejected, completed');
      }

      // Set timestamps based on status
      if (updateData.status === 'approved' && !this.approved_at) {
        updateData.approved_at = new Date();
      } else if (updateData.status === 'rejected' && !this.rejected_at) {
        updateData.rejected_at = new Date();
      }
    } else {
      // For other updates, validate all fields
      const validationErrors = PressPackOrder.validate({ ...this, ...updateData });
      if (validationErrors.length > 0) {
        throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
      }
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return this;

    values.push(this.id);
    const sql = `UPDATE press_pack_orders SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete order
  async delete() {
    const sql = 'DELETE FROM press_pack_orders WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      whatsapp_number: this.whatsapp_number,
      calling_number: this.calling_number,
      press_release_selection: this.press_release_selection,
      email: this.email,
      company_registration_document: this.company_registration_document,
      letter_of_authorisation: this.letter_of_authorisation,
      image: this.image,
      word_pdf_document: this.word_pdf_document,
      submitted_by_type: this.submitted_by_type,
      package_selection: this.package_selection,
      message: this.message,
      captcha_token: this.captcha_token,
      terms_accepted: this.terms_accepted,
      content_writing_assistance: this.content_writing_assistance,
      status: this.status,
      submitted_by: this.submitted_by,
      submitted_by_admin: this.submitted_by_admin,
      approved_at: this.approved_at,
      approved_by: this.approved_by,
      rejected_at: this.rejected_at,
      rejected_by: this.rejected_by,
      rejection_reason: this.rejection_reason,
      admin_comments: this.admin_comments,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = PressPackOrder;