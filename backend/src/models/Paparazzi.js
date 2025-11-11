const { query } = require('../config/database');

class Paparazzi {
  constructor(data) {
    this.id = data.id;
    this.platform = data.platform || 'Instagram';
    this.username = data.username;
    this.page_name = data.page_name;
    this.followers_count = data.followers_count;
    this.collaboration = data.collaboration;
    this.category = data.category;
    this.location = data.location;
    this.price_reel_no_tag_no_collab = data.price_reel_no_tag_no_collab;
    this.price_reel_with_tag_no_collab = data.price_reel_with_tag_no_collab;
    this.price_reel_with_tag = data.price_reel_with_tag;
    this.video_minutes_allowed = data.video_minutes_allowed;
    this.pin_post_weekly_charge = data.pin_post_weekly_charge;
    this.story_charge = data.story_charge;
    this.story_with_reel_charge = data.story_with_reel_charge;
    this.page_website = data.page_website;
    this.status = data.status || 'pending';
    this.user_id = data.user_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.approved_by = data.approved_by;
    this.approved_at = data.approved_at;
    this.rejection_reason = data.rejection_reason;
  }

  // Create a new paparazzi entry
  static async create(paparazziData) {
    const {
      platform = 'Instagram',
      username,
      page_name,
      followers_count,
      collaboration,
      category,
      location,
      price_reel_no_tag_no_collab,
      price_reel_with_tag_no_collab,
      price_reel_with_tag,
      video_minutes_allowed,
      pin_post_weekly_charge,
      story_charge,
      story_with_reel_charge,
      page_website,
      user_id
    } = paparazziData;

    const sql = `
      INSERT INTO paparazzi (
        platform, username, page_name, followers_count, collaboration, category, location,
        price_reel_no_tag_no_collab, price_reel_with_tag_no_collab, price_reel_with_tag,
        video_minutes_allowed, pin_post_weekly_charge, story_charge, story_with_reel_charge,
        page_website, user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const values = [
      platform, username, page_name, followers_count, collaboration, category, location,
      price_reel_no_tag_no_collab, price_reel_with_tag_no_collab, price_reel_with_tag,
      video_minutes_allowed, pin_post_weekly_charge, story_charge, story_with_reel_charge,
      page_website, user_id
    ];

    const result = await query(sql, values);
    return new Paparazzi(result.rows[0]);
  }

  // Find paparazzi by ID
  static async findById(id) {
    const sql = 'SELECT * FROM paparazzi WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Paparazzi(result.rows[0]) : null;
  }

  // Find all paparazzi entries
  static async findAll() {
    const sql = 'SELECT * FROM paparazzi ORDER BY created_at DESC';
    const result = await query(sql);
    return result.rows.map(row => new Paparazzi(row));
  }

  // Find paparazzi by user ID
  static async findByUserId(userId) {
    const sql = 'SELECT * FROM paparazzi WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await query(sql, [userId]);
    return result.rows.map(row => new Paparazzi(row));
  }

  // Find paparazzi by status
  static async findByStatus(status) {
    const sql = 'SELECT * FROM paparazzi WHERE status = $1 ORDER BY created_at DESC';
    const result = await query(sql, [status]);
    return result.rows.map(row => new Paparazzi(row));
  }

  // Update paparazzi entry
  async update(updateData) {
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
    const sql = `UPDATE paparazzi SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Approve paparazzi entry
  async approve(adminId) {
    await this.update({
      status: 'approved',
      approved_by: adminId,
      approved_at: new Date(),
      rejection_reason: null
    });
  }

  // Reject paparazzi entry
  async reject(adminId, reason) {
    await this.update({
      status: 'rejected',
      approved_by: null,
      approved_at: null,
      rejection_reason: reason
    });
  }

  // Delete paparazzi entry
  async delete() {
    const sql = 'DELETE FROM paparazzi WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Convert to JSON (exclude sensitive data if any)
  toJSON() {
    return {
      id: this.id,
      platform: this.platform,
      username: this.username,
      page_name: this.page_name,
      followers_count: this.followers_count,
      collaboration: this.collaboration,
      category: this.category,
      location: this.location,
      price_reel_no_tag_no_collab: this.price_reel_no_tag_no_collab,
      price_reel_with_tag_no_collab: this.price_reel_with_tag_no_collab,
      price_reel_with_tag: this.price_reel_with_tag,
      video_minutes_allowed: this.video_minutes_allowed,
      pin_post_weekly_charge: this.pin_post_weekly_charge,
      story_charge: this.story_charge,
      story_with_reel_charge: this.story_with_reel_charge,
      page_website: this.page_website,
      status: this.status,
      user_id: this.user_id,
      created_at: this.created_at,
      updated_at: this.updated_at,
      approved_by: this.approved_by,
      approved_at: this.approved_at,
      rejection_reason: this.rejection_reason
    };
  }
}

module.exports = Paparazzi;