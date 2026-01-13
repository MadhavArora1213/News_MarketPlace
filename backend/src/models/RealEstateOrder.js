const { query } = require('../config/database');

class RealEstateOrder {
  constructor(data) {
    this.id = data.id;
    this.professional_id = data.professional_id;
    this.customer_name = data.customer_name;
    this.customer_email = data.customer_email;
    this.customer_whatsapp_country_code = data.customer_whatsapp_country_code;
    this.customer_whatsapp_number = data.customer_whatsapp_number;
    this.customer_calling_country_code = data.customer_calling_country_code;
    this.customer_calling_number = data.customer_calling_number;
    this.budget_range = data.budget_range;
    this.influencers_required = data.influencers_required;
    this.gender_required = data.gender_required;
    this.languages_required = data.languages_required;
    this.min_followers = data.min_followers;
    this.message = data.message;
    this.captcha_token = data.captcha_token;
    this.terms_accepted = data.terms_accepted;
    this.status = data.status || 'pending';
    this.submitted_by = data.submitted_by;
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
    if (!orderData.professional_id || !Number.isInteger(orderData.professional_id)) {
      errors.push('Professional ID is required and must be an integer');
    }

    if (!orderData.customer_name || typeof orderData.customer_name !== 'string' || orderData.customer_name.trim().length === 0) {
      errors.push('Customer name is required');
    }

    if (!orderData.customer_email || typeof orderData.customer_email !== 'string' || !orderData.customer_email.includes('@')) {
      errors.push('Valid customer email is required');
    }

    if (!orderData.customer_whatsapp_number || typeof orderData.customer_whatsapp_number !== 'string' || orderData.customer_whatsapp_number.trim().length === 0) {
      errors.push('WhatsApp number is required');
    }

    if (!orderData.budget_range || !['USD 15k-25k', 'USD 26k-50k', 'USD 51k-75k', 'USD 76k-100k', 'More than 100k'].includes(orderData.budget_range)) {
      errors.push('Valid budget range is required');
    }

    if (!orderData.influencers_required || !['1-10', '11-25', '26-50', '51-100', 'More than 100'].includes(orderData.influencers_required)) {
      errors.push('Valid influencers required range is required');
    }

    if (!orderData.gender_required || !['Male', 'Female', 'Both'].includes(orderData.gender_required)) {
      errors.push('Valid gender requirement is required');
    }

    if (!orderData.languages_required || !Array.isArray(orderData.languages_required) || orderData.languages_required.length === 0) {
      errors.push('At least one language is required');
    }

    if (!orderData.captcha_token || typeof orderData.captcha_token !== 'string') {
      errors.push('CAPTCHA token is required');
    }

    if (orderData.terms_accepted !== true) {
      errors.push('Terms and conditions must be accepted');
    }

    // Optional fields validation
    if (orderData.min_followers !== undefined && (!Number.isInteger(orderData.min_followers) || orderData.min_followers < 0)) {
      errors.push('Minimum followers must be a non-negative integer');
    }

    // Status validation
    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
    if (orderData.status && !validStatuses.includes(orderData.status)) {
      errors.push('Status must be one of: pending, approved, rejected, completed');
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
      'professional_id', 'customer_name', 'customer_email', 'customer_whatsapp_country_code',
      'customer_whatsapp_number', 'customer_calling_country_code', 'customer_calling_number',
      'budget_range', 'influencers_required', 'gender_required', 'languages_required',
      'min_followers', 'message', 'captcha_token', 'terms_accepted', 'status', 'submitted_by'
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
      INSERT INTO real_estate_orders (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await query(sql, values);
    return new RealEstateOrder(result.rows[0]);
  }

  // Find order by ID
  static async findById(id) {
    const sql = 'SELECT * FROM real_estate_orders WHERE id = $1';
    const result = await query(sql, [id]);
    if (result.rows[0]) {
      // Parse languages_required if it's stored as JSON string
      const row = result.rows[0];
      if (row.languages_required && typeof row.languages_required === 'string') {
        try {
          row.languages_required = JSON.parse(row.languages_required);
        } catch (e) {
          console.error('Error parsing languages_required in findById:', e);
          row.languages_required = [];
        }
      }
      return new RealEstateOrder(row);
    }
    return null;
  }

  // Find all orders with optional filters
  static async findAll(filters = {}, limit = null, offset = 0) {
    let whereClause = '';
    const params = [];
    let paramCount = 1;

    const filterFields = ['status', 'professional_id', 'submitted_by', 'approved_by', 'rejected_by', 'customer_email'];
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

    let sql = `SELECT * FROM real_estate_orders ${whereClause} ORDER BY created_at DESC`;

    if (limit !== null) {
      sql += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limit, offset);
    }

    const result = await query(sql, params);

    // Parse languages_required for each row
    return result.rows.map(row => {
      if (row.languages_required && typeof row.languages_required === 'string') {
        try {
          row.languages_required = JSON.parse(row.languages_required);
        } catch (e) {
          console.error('Error parsing languages_required in findAll:', e);
          row.languages_required = [];
        }
      }
      return new RealEstateOrder(row);
    });
  }

  // Get count of orders with optional filters
  static async getCount(filters = {}) {
    let whereClause = '';
    const params = [];

    const filterFields = ['status', 'professional_id', 'submitted_by', 'approved_by', 'rejected_by', 'customer_email'];
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

    const sql = `SELECT COUNT(*) as total FROM real_estate_orders ${whereClause}`;
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
      const validationErrors = RealEstateOrder.validate({ ...this, ...updateData });
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
    const sql = `UPDATE real_estate_orders SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);

    // Parse languages_required in updated data
    const updatedData = result.rows[0];
    if (updatedData.languages_required && typeof updatedData.languages_required === 'string') {
      try {
        updatedData.languages_required = JSON.parse(updatedData.languages_required);
      } catch (e) {
        console.error('Error parsing languages_required in update:', e);
        updatedData.languages_required = [];
      }
    }

    Object.assign(this, updatedData);
    return this;
  }

  // Delete order
  async delete() {
    const sql = 'DELETE FROM real_estate_orders WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      professional_id: this.professional_id,
      customer_name: this.customer_name,
      customer_email: this.customer_email,
      customer_whatsapp_country_code: this.customer_whatsapp_country_code,
      customer_whatsapp_number: this.customer_whatsapp_number,
      customer_calling_country_code: this.customer_calling_country_code,
      customer_calling_number: this.customer_calling_number,
      budget_range: this.budget_range,
      influencers_required: this.influencers_required,
      gender_required: this.gender_required,
      languages_required: this.languages_required,
      min_followers: this.min_followers,
      message: this.message,
      captcha_token: this.captcha_token,
      terms_accepted: this.terms_accepted,
      status: this.status,
      submitted_by: this.submitted_by,
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

module.exports = RealEstateOrder;