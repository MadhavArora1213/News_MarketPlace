const { query } = require('../config/database');

class PressRelease {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.region = data.region;
    this.niche = data.niche;
    this.distribution_media_websites = data.distribution_media_websites;
    this.guaranteed_media_placements = data.guaranteed_media_placements;
    this.end_client_media_details = data.end_client_media_details;
    this.middlemen_contact_details = data.middlemen_contact_details;
    this.google_search_optimised = data.google_search_optimised !== undefined ? data.google_search_optimised : false;
    this.google_news_index = data.google_news_index !== undefined ? data.google_news_index : false;
    this.images_allowed = data.images_allowed;
    this.word_limit = data.word_limit;
    // Handle package_options field - ensure it's always an array
    if (typeof data.package_options === 'string') {
      try {
        this.package_options = JSON.parse(data.package_options);
      } catch (e) {
        console.error('Error parsing package_options JSON:', e);
        this.package_options = [];
      }
    } else if (Array.isArray(data.package_options)) {
      this.package_options = data.package_options;
    } else {
      this.package_options = data.package_options || [];
    }
    this.price = data.price;
    this.turnaround_time = data.turnaround_time;
    this.customer_info_needed = data.customer_info_needed;
    this.description = data.description;
    this.image_logo = data.image_logo;
    this.best_seller = data.best_seller !== undefined ? data.best_seller : false;
    this.content_writing_assistance = data.content_writing_assistance !== undefined ? data.content_writing_assistance : false;
    this.status = data.status || 'active';
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
    this.is_active = data.is_active !== undefined ? data.is_active : true;
  }

  // Validate press release data
  static validate(pressReleaseData) {
    const errors = [];

    // Required fields
    if (!pressReleaseData.name || typeof pressReleaseData.name !== 'string' || pressReleaseData.name.trim().length === 0) {
      errors.push('Name is required and must be a non-empty string');
    }

    // String fields
    const stringFields = [
      'region', 'niche', 'end_client_media_details', 'middlemen_contact_details',
      'turnaround_time', 'customer_info_needed', 'description', 'image_logo'
    ];

    stringFields.forEach(field => {
      if (pressReleaseData[field] !== undefined && typeof pressReleaseData[field] !== 'string') {
        errors.push(`${field.replace(/_/g, ' ')} must be a string`);
      }
    });

    // Number fields
    const numberFields = ['distribution_media_websites', 'guaranteed_media_placements', 'images_allowed', 'word_limit'];
    numberFields.forEach(field => {
      if (pressReleaseData[field] !== undefined && (!Number.isInteger(pressReleaseData[field]) || pressReleaseData[field] < 0)) {
        errors.push(`${field.replace(/_/g, ' ')} must be a non-negative integer`);
      }
    });

    // Price field
    if (pressReleaseData.price !== undefined && (typeof pressReleaseData.price !== 'number' || pressReleaseData.price < 0)) {
      errors.push('Price must be a non-negative number');
    }

    // Boolean fields
    const booleanFields = ['google_search_optimised', 'google_news_index', 'best_seller', 'content_writing_assistance'];
    booleanFields.forEach(field => {
      if (pressReleaseData[field] !== undefined && typeof pressReleaseData[field] !== 'boolean') {
        errors.push(`${field.replace(/_/g, ' ')} must be a boolean`);
      }
    });

    // Package options array
    if (pressReleaseData.package_options !== undefined && !Array.isArray(pressReleaseData.package_options)) {
      errors.push('Package options must be an array');
    }

    // Status
    const validStatuses = ['active', 'inactive'];
    if (pressReleaseData.status && !validStatuses.includes(pressReleaseData.status)) {
      errors.push('Status must be one of: active, inactive');
    }

    // User association - submitted_by is required for user submissions, optional for admin submissions
    if (pressReleaseData.submitted_by !== undefined && pressReleaseData.submitted_by !== null && !Number.isInteger(pressReleaseData.submitted_by)) {
      errors.push('Submitted by must be an integer');
    }

    // For admin submissions, either submitted_by or submitted_by_admin should be present
    if (pressReleaseData.submitted_by_admin !== undefined && pressReleaseData.submitted_by_admin !== null && !Number.isInteger(pressReleaseData.submitted_by_admin)) {
      errors.push('Submitted by admin must be an integer');
    }

    // Ensure at least one submitter is present
    if ((pressReleaseData.submitted_by === undefined || pressReleaseData.submitted_by === null) &&
        (pressReleaseData.submitted_by_admin === undefined || pressReleaseData.submitted_by_admin === null)) {
      errors.push('Either submitted_by or submitted_by_admin must be provided');
    }

    return errors;
  }

  // Create a new press release
  static async create(pressReleaseData) {
    console.log('PressRelease.create - Starting validation');
    const validationErrors = this.validate(pressReleaseData);
    if (validationErrors.length > 0) {
      console.error('PressRelease.create - Validation errors:', validationErrors);
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    console.log('PressRelease.create - Validation passed');
    const allowedFields = [
      'name', 'region', 'niche', 'distribution_media_websites', 'guaranteed_media_placements',
      'end_client_media_details', 'middlemen_contact_details', 'google_search_optimised',
      'google_news_index', 'images_allowed', 'word_limit', 'package_options', 'price',
      'turnaround_time', 'customer_info_needed', 'description', 'image_logo',
      'best_seller', 'content_writing_assistance', 'is_active'
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (pressReleaseData[field] !== undefined) {
        filteredData[field] = (field === 'package_options') ? JSON.stringify(pressReleaseData[field]) : pressReleaseData[field];
      }
    });

    console.log('PressRelease.create - Filtered data keys:', Object.keys(filteredData));
    const fields = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const placeholders = fields.map((_, index) => `$${index + 1}`);

    const sql = `
      INSERT INTO press_releases (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    console.log('PressRelease.create - Executing SQL:', sql);
    console.log('PressRelease.create - Values:', values);
    const result = await query(sql, values);
    console.log('PressRelease.create - Query result:', result.rows.length > 0 ? 'Success' : 'No rows returned');

    const pressRelease = new PressRelease(result.rows[0]);
    console.log('PressRelease.create - Created press release with ID:', pressRelease.id);
    return pressRelease;
  }

  // Find press release by ID
  static async findById(id) {
    const sql = 'SELECT * FROM press_releases WHERE id = $1';
    const result = await query(sql, [id]);
    if (result.rows[0]) {
      // Ensure package_options field is properly parsed
      const row = result.rows[0];
      if (row.package_options && typeof row.package_options === 'string') {
        try {
          row.package_options = JSON.parse(row.package_options);
        } catch (e) {
          console.error('Error parsing package_options in findById:', e);
          row.package_options = [];
        }
      }
      return new PressRelease(row);
    }
    return null;
  }

  // Find all press releases
  static async findAll(limit = null, offset = 0) {
    let sql = 'SELECT * FROM press_releases ORDER BY created_at DESC';
    const params = [];

    if (limit !== null) {
      sql += ' LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const result = await query(sql, params);
    // Ensure package_options field is properly parsed
    return result.rows.map(row => {
      if (row.package_options && typeof row.package_options === 'string') {
        try {
          row.package_options = JSON.parse(row.package_options);
        } catch (e) {
          console.error('Error parsing package_options in findAll:', e);
          row.package_options = [];
        }
      }
      return new PressRelease(row);
    });
  }

  // Update press release
  async update(updateData) {
    console.log('PressRelease.update - Starting update for ID:', this.id);
    console.log('PressRelease.update - Update data keys:', Object.keys(updateData));

    // For status updates, only validate the status field to avoid issues with existing invalid data
    if ('status' in updateData) {
      console.log('PressRelease.update - Status-only update');
      const validStatuses = ['active', 'inactive'];
      if (!validStatuses.includes(updateData.status)) {
        console.error('PressRelease.update - Invalid status:', updateData.status);
        throw new Error('Validation errors: Status must be one of: active, inactive');
      }
    } else {
      console.log('PressRelease.update - Full validation');
      // For other updates, validate all fields
      const validationErrors = PressRelease.validate({ ...this, ...updateData });
      if (validationErrors.length > 0) {
        console.error('PressRelease.update - Validation errors:', validationErrors);
        throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
      }
    }

    console.log('PressRelease.update - Validation passed');
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedUpdateFields = [
      'name', 'region', 'niche', 'distribution_media_websites', 'guaranteed_media_placements',
      'end_client_media_details', 'middlemen_contact_details', 'google_search_optimised',
      'google_news_index', 'images_allowed', 'word_limit', 'package_options', 'price',
      'turnaround_time', 'customer_info_needed', 'description', 'image_logo',
      'best_seller', 'content_writing_assistance', 'is_active',
      'status', 'admin_comments', 'rejection_reason'
    ];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && allowedUpdateFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push((key === 'package_options') ? JSON.stringify(updateData[key]) : updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      console.log('PressRelease.update - No fields to update');
      return this;
    }

    values.push(this.id);
    const sql = `UPDATE press_releases SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    console.log('PressRelease.update - Executing SQL:', sql);
    console.log('PressRelease.update - Values:', values);

    const result = await query(sql, values);
    console.log('PressRelease.update - Query result:', result.rows.length > 0 ? 'Success' : 'No rows returned');

    // Handle package_options field parsing for updated data
    const updatedData = result.rows[0];
    if (updatedData.package_options && typeof updatedData.package_options === 'string') {
      try {
        updatedData.package_options = JSON.parse(updatedData.package_options);
        console.log('PressRelease.update - Package options parsed successfully');
      } catch (e) {
        console.error('PressRelease.update - Error parsing package_options in update:', e);
        updatedData.package_options = [];
      }
    }
    Object.assign(this, updatedData);
    console.log('PressRelease.update - Update completed for ID:', this.id);
    return this;
  }

  // Delete press release
  async delete() {
    const sql = 'DELETE FROM press_releases WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      region: this.region,
      niche: this.niche,
      distribution_media_websites: this.distribution_media_websites,
      guaranteed_media_placements: this.guaranteed_media_placements,
      end_client_media_details: this.end_client_media_details,
      middlemen_contact_details: this.middlemen_contact_details,
      google_search_optimised: this.google_search_optimised,
      google_news_index: this.google_news_index,
      images_allowed: this.images_allowed,
      word_limit: this.word_limit,
      package_options: this.package_options,
      price: this.price,
      turnaround_time: this.turnaround_time,
      customer_info_needed: this.customer_info_needed,
      description: this.description,
      image_logo: this.image_logo,
      best_seller: this.best_seller,
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
      updated_at: this.updated_at,
      is_active: this.is_active
    };
  }
}

module.exports = PressRelease;