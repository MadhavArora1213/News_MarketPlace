const { query } = require('../config/database');

class Theme {
  constructor(data) {
    this.id = data.id;
    this.platform = data.platform;
    this.username = data.username;
    this.page_name = data.page_name;
    this.no_of_followers = data.no_of_followers;
    this.collaboration = data.collaboration;
    this.category = data.category;
    this.location = data.location;
    this.price_reel_without_tagging_collaboration = data.price_reel_without_tagging_collaboration;
    this.price_reel_with_tagging_collaboration = data.price_reel_with_tagging_collaboration;
    this.price_reel_with_tagging = data.price_reel_with_tagging;
    this.video_minute_allowed = data.video_minute_allowed;
    this.pin_post_charges_week = data.pin_post_charges_week;
    this.story_charges = data.story_charges;
    this.story_with_reel_charges = data.story_with_reel_charges;
    this.page_website = data.page_website;
    this.submitted_by = data.submitted_by;
    this.submitted_by_admin = data.submitted_by_admin;
    this.status = data.status || 'pending';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.status_history = data.status_history || [];
    this.approved_at = data.approved_at;
    this.approved_by = data.approved_by;
    this.rejected_at = data.rejected_at;
    this.rejected_by = data.rejected_by;
    this.rejection_reason = data.rejection_reason;
    this.admin_comments = data.admin_comments;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new theme
  static async create(themeData) {
    const {
      platform,
      username,
      page_name,
      no_of_followers,
      collaboration,
      category,
      location,
      price_reel_without_tagging_collaboration,
      price_reel_with_tagging_collaboration,
      price_reel_with_tagging,
      video_minute_allowed,
      pin_post_charges_week,
      story_charges,
      story_with_reel_charges,
      page_website,
      submitted_by,
      submitted_by_admin
    } = themeData;

    const sql = `
      INSERT INTO themes (
        platform, username, page_name, no_of_followers, collaboration, category, location,
        price_reel_without_tagging_collaboration, price_reel_with_tagging_collaboration,
        price_reel_with_tagging, video_minute_allowed, pin_post_charges_week, story_charges,
        story_with_reel_charges, page_website, submitted_by, submitted_by_admin
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const values = [
      platform, username, page_name, no_of_followers, collaboration, category, location,
      price_reel_without_tagging_collaboration, price_reel_with_tagging_collaboration,
      price_reel_with_tagging, video_minute_allowed, pin_post_charges_week, story_charges,
      story_with_reel_charges, page_website, submitted_by, submitted_by_admin
    ];

    const result = await query(sql, values);
    return new Theme(result.rows[0]);
  }

  // Find theme by ID
  static async findById(id) {
    const sql = 'SELECT * FROM themes WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Theme(result.rows[0]) : null;
  }

  // Find theme by username
  static async findByUsername(username) {
    const sql = 'SELECT * FROM themes WHERE username = $1';
    const result = await query(sql, [username]);
    return result.rows[0] ? new Theme(result.rows[0]) : null;
  }

  // Find all themes with search and pagination
  static async findAll(filters = {}, searchSql = '', searchValues = [], limit = null, offset = null) {
    let sql = 'SELECT * FROM themes WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      sql += ` AND is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    }

    if (filters.platform) {
      sql += ` AND platform = $${paramCount}`;
      values.push(filters.platform);
      paramCount++;
    }

    if (filters.category) {
      sql += ` AND category = $${paramCount}`;
      values.push(filters.category);
      paramCount++;
    }

    // Add search conditions
    if (searchSql) {
      sql += searchSql;
      values.push(...searchValues);
      paramCount += searchValues.length;
    }

    sql += ' ORDER BY created_at DESC';

    // Add pagination
    if (limit) {
      sql += ` LIMIT $${paramCount}`;
      values.push(limit);
      paramCount++;
    }

    if (offset) {
      sql += ` OFFSET $${paramCount}`;
      values.push(offset);
      paramCount++;
    }

    const result = await query(sql, values);
    return result.rows.map(row => new Theme(row));
  }

  // Get deleted themes (soft deleted)
  static async getDeleted(filters = {}, searchSql = '', searchValues = [], limit = null, offset = null) {
    let sql = 'SELECT * FROM themes WHERE is_active = false';
    const values = [];
    let paramCount = 1;

    if (filters.platform) {
      sql += ` AND platform = $${paramCount}`;
      values.push(filters.platform);
      paramCount++;
    }

    // Add search conditions
    if (searchSql) {
      sql += searchSql;
      values.push(...searchValues);
      paramCount += searchValues.length;
    }

    sql += ' ORDER BY updated_at DESC';

    // Add pagination
    if (limit) {
      sql += ` LIMIT $${paramCount}`;
      values.push(limit);
      paramCount++;
    }

    if (offset) {
      sql += ` OFFSET $${paramCount}`;
      values.push(offset);
      paramCount++;
    }

    const result = await query(sql, values);
    return result.rows.map(row => new Theme(row));
  }

  // Update theme
  async update(updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Track status changes for history
    const oldStatus = this.status;
    const newStatus = updateData.status;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return this;

    values.push(this.id);
    const sql = `UPDATE themes SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);

    // Update status history if status changed
    if (newStatus && oldStatus !== newStatus) {
      await this.addStatusHistoryEntry(newStatus, updateData.adminId || updateData.approved_by || updateData.rejected_by, updateData.rejection_reason);
    }

    return this;
  }

  // Delete theme (soft delete by setting is_active to false)
  async delete() {
    return await this.update({ is_active: false });
  }

  // Add status history entry
  async addStatusHistoryEntry(newStatus, adminId, rejectionReason = null) {
    const historyEntry = {
      status: newStatus,
      changed_at: new Date().toISOString(),
      changed_by: adminId,
      rejection_reason: rejectionReason
    };

    const currentHistory = Array.isArray(this.status_history) ? this.status_history : [];
    currentHistory.push(historyEntry);

    const sql = 'UPDATE themes SET status_history = $1 WHERE id = $2';
    await query(sql, [JSON.stringify(currentHistory), this.id]);

    this.status_history = currentHistory;
  }

  // Approve theme
  async approve(adminId) {
    const updateData = {
      status: 'approved',
      approved_at: new Date(),
      approved_by: adminId,
      rejected_at: null,
      rejected_by: null,
      rejection_reason: null
    };

    return await this.update(updateData);
  }

  // Reject theme
  async reject(adminId, reason) {
    const updateData = {
      status: 'rejected',
      rejected_at: new Date(),
      rejected_by: adminId,
      rejection_reason: reason,
      approved_at: null,
      approved_by: null
    };

    return await this.update(updateData);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      platform: this.platform,
      username: this.username,
      page_name: this.page_name,
      no_of_followers: this.no_of_followers,
      collaboration: this.collaboration,
      category: this.category,
      location: this.location,
      price_reel_without_tagging_collaboration: this.price_reel_without_tagging_collaboration,
      price_reel_with_tagging_collaboration: this.price_reel_with_tagging_collaboration,
      price_reel_with_tagging: this.price_reel_with_tagging,
      video_minute_allowed: this.video_minute_allowed,
      pin_post_charges_week: this.pin_post_charges_week,
      story_charges: this.story_charges,
      story_with_reel_charges: this.story_with_reel_charges,
      page_website: this.page_website,
      submitted_by: this.submitted_by,
      submitted_by_admin: this.submitted_by_admin,
      status: this.status,
      is_active: this.is_active,
      status_history: this.status_history,
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

module.exports = Theme;