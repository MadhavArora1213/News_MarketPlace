const { query } = require('../config/database');

class PaparazziCreation {
  constructor(data) {
    this.id = data.id;
    this.instagram_page_name = data.instagram_page_name;
    this.no_of_followers = data.no_of_followers;
    this.region_focused = data.region_focused;
    this.category = data.category;
    this.instagram_url = data.instagram_url;
    this.profile_dp_logo = data.profile_dp_logo;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new paparazzi creation entry
  static async create(data) {
    const {
      instagram_page_name,
      no_of_followers,
      region_focused,
      category,
      instagram_url,
      profile_dp_logo
    } = data;

    const sql = `
      INSERT INTO paparazzi_creations (
        instagram_page_name, no_of_followers, region_focused, category,
        instagram_url, profile_dp_logo
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      instagram_page_name, no_of_followers, region_focused, category,
      instagram_url, profile_dp_logo
    ];

    const result = await query(sql, values);
    return new PaparazziCreation(result.rows[0]);
  }

  // Find by ID
  static async findById(id) {
    const sql = 'SELECT * FROM paparazzi_creations WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new PaparazziCreation(result.rows[0]) : null;
  }

  // Find all with filters, sorting, and count
  static async findAndCountAll({ where = {}, limit = null, offset = null, order = [['created_at', 'DESC']] }) {
    let sql = 'SELECT * FROM paparazzi_creations';
    let countSql = 'SELECT COUNT(*) FROM paparazzi_creations';
    const values = [];
    const whereClauses = [];

    // Construct WHERE clause
    Object.keys(where).forEach((key) => {
      const condition = where[key];
      if (condition && typeof condition === 'object') {
        if (key === 'search' && condition.val) {
          whereClauses.push(`(instagram_page_name ILIKE $${values.length + 1} OR category ILIKE $${values.length + 2} OR region_focused ILIKE $${values.length + 3})`);
          values.push(`%${condition.val}%`, `%${condition.val}%`, `%${condition.val}%`);
        }
      } else if (condition !== undefined && condition !== null) {
        whereClauses.push(`${key} = $${values.length + 1}`);
        values.push(condition);
      }
    });

    if (whereClauses.length > 0) {
      const wherePart = ` WHERE ${whereClauses.join(' AND ')}`;
      sql += wherePart;
      countSql += wherePart;
    }

    // Handle ORDER BY
    if (order && order.length > 0) {
      const [col, dir] = order[0];
      sql += ` ORDER BY ${col} ${dir}`;
    }

    // Handle Limit and Offset
    if (limit !== null) {
      sql += ` LIMIT $${values.length + 1}`;
      values.push(limit);
    }
    if (offset !== null) {
      sql += ` OFFSET $${values.length + 1}`;
      values.push(offset);
    }

    const [result, countResult] = await Promise.all([
      query(sql, values),
      query(countSql, values.slice(0, values.length - (limit !== null ? (offset !== null ? 2 : 1) : 0)))
    ]);

    return {
      rows: result.rows.map(row => new PaparazziCreation(row)),
      count: parseInt(countResult.rows[0].count)
    };
  }

  // Find all
  static async findAll(limit = null, offset = null) {
    let sql = 'SELECT * FROM paparazzi_creations ORDER BY created_at DESC';
    const values = [];

    if (limit) {
      sql += ' LIMIT $1';
      values.push(limit);
    }

    if (offset) {
      sql += ` OFFSET $${values.length + 1}`;
      values.push(offset);
    }

    const result = await query(sql, values);
    return result.rows.map(row => new PaparazziCreation(row));
  }

  // Update
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
    const sql = `UPDATE paparazzi_creations SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);

    return this;
  }

  // Delete
  async delete() {
    const sql = 'DELETE FROM paparazzi_creations WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Get total count with optional filters
  static async getTotalCount(searchSql = '', searchValues = []) {
    let sql = 'SELECT COUNT(*) as total FROM paparazzi_creations WHERE 1=1';
    sql += searchSql;

    const result = await query(sql, searchValues);
    return parseInt(result.rows[0].total);
  }

  // Find all with search filters
  static async findAll(limit = null, offset = null, searchSql = '', searchValues = []) {
    let sql = 'SELECT * FROM paparazzi_creations WHERE 1=1';
    sql += searchSql;
    sql += ' ORDER BY created_at DESC';

    const values = [...searchValues];

    if (limit) {
      sql += ' LIMIT $' + (values.length + 1);
      values.push(limit);
    }

    if (offset) {
      sql += ' OFFSET $' + (values.length + 1);
      values.push(offset);
    }

    const result = await query(sql, values);
    return result.rows.map(row => new PaparazziCreation(row));
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      instagram_page_name: this.instagram_page_name,
      no_of_followers: this.no_of_followers,
      region_focused: this.region_focused,
      category: this.category,
      instagram_url: this.instagram_url,
      profile_dp_logo: this.profile_dp_logo,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = PaparazziCreation;