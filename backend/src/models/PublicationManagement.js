const { query } = require('../config/database');

class PublicationManagement {
  constructor(data) {
    this.id = data.id;
    this.region = data.region;
    this.publication_name = data.publication_name;
    this.publication_url = data.publication_url;
    this.da = data.da;
    this.article_reference_link = data.article_reference_link;
    this.committed_tat = data.committed_tat;
    this.language = data.language;
    this.publication_primary_focus = data.publication_primary_focus;
    this.practical_tat = data.practical_tat;
    this.price_usd = data.price_usd;
    this.do_follow = data.do_follow || false;
    this.dr = data.dr;
    this.remarks = data.remarks;
    this.word_limit = data.word_limit;
    this.needs_images = data.needs_images || false;
    this.image_count = data.image_count;
    this.image = data.image;
    this.rating_type = data.rating_type;
    this.instagram = data.instagram;
    this.facebook = data.facebook;
    this.twitter = data.twitter;
    this.linkedin = data.linkedin;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new publication management entry
  static async create(data) {
    const {
      region,
      publication_name,
      publication_url,
      da,
      article_reference_link,
      committed_tat,
      language,
      publication_primary_focus,
      practical_tat,
      price_usd,
      do_follow,
      dr,
      remarks,
      word_limit,
      needs_images,
      image_count,
      image,
      rating_type,
      instagram,
      facebook,
      twitter,
      linkedin
    } = data;

    const sql = `
      INSERT INTO publication_managements (
        region, publication_name, publication_url, da, article_reference_link,
        committed_tat, language, publication_primary_focus, practical_tat,
        price_usd, do_follow, dr, remarks, word_limit, needs_images, image_count,
        image, rating_type, instagram, facebook, twitter, linkedin
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *
    `;

    const values = [
      region, publication_name, publication_url, da, article_reference_link,
      committed_tat, language, publication_primary_focus, practical_tat,
      price_usd, do_follow, dr, remarks, word_limit, needs_images, image_count,
      image, rating_type, instagram, facebook, twitter, linkedin
    ];

    const result = await query(sql, values);
    return new PublicationManagement(result.rows[0]);
  }

  // Find by ID
  static async findById(id) {
    const sql = 'SELECT * FROM publication_managements WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new PublicationManagement(result.rows[0]) : null;
  }

  // Find by publication name
  static async findByPublicationName(publication_name) {
    const sql = 'SELECT * FROM publication_managements WHERE publication_name = $1';
    const result = await query(sql, [publication_name]);
    return result.rows[0] ? new PublicationManagement(result.rows[0]) : null;
  }

  // Find all with filters, sorting, and count
  static async findAndCountAll({ where = {}, limit = null, offset = null, order = [['created_at', 'DESC']] }) {
    let sql = 'SELECT * FROM publication_managements';
    let countSql = 'SELECT COUNT(*) FROM publication_managements';
    const values = [];
    const whereClauses = [];

    // Construct WHERE clause
    Object.keys(where).forEach((key) => {
      const condition = where[key];
      if (condition && typeof condition === 'object' && key === 'search') {
        if (condition.val) {
          whereClauses.push(`(publication_name ILIKE $${values.length + 1} OR region ILIKE $${values.length + 2} OR language ILIKE $${values.length + 3} OR publication_primary_focus ILIKE $${values.length + 4})`);
          values.push(`%${condition.val}%`, `%${condition.val}%`, `%${condition.val}%`, `%${condition.val}%`);
        }
      } else if (key === 'price_min') {
        whereClauses.push(`price_usd >= $${values.length + 1}`);
        values.push(condition);
      } else if (key === 'price_max') {
        whereClauses.push(`price_usd <= $${values.length + 1}`);
        values.push(condition);
      } else if (key === 'da_min') {
        whereClauses.push(`da >= $${values.length + 1}`);
        values.push(condition);
      } else if (key === 'da_max') {
        whereClauses.push(`da <= $${values.length + 1}`);
        values.push(condition);
      } else if (key === 'dr_min') {
        whereClauses.push(`dr >= $${values.length + 1}`);
        values.push(condition);
      } else if (key === 'dr_max') {
        whereClauses.push(`dr <= $${values.length + 1}`);
        values.push(condition);
      } else if (key === 'tat_min') {
        // Since tat is VARCHAR, we cast it to INTEGER for comparison
        whereClauses.push(`NULLIF(committed_tat, '')::INTEGER >= $${values.length + 1}`);
        values.push(condition);
      } else if (key === 'tat_max') {
        whereClauses.push(`NULLIF(committed_tat, '')::INTEGER <= $${values.length + 1}`);
        values.push(condition);
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
      // Basic validation for column name to prevent SQL injection
      const allowedCols = ['id', 'publication_name', 'region', 'language', 'publication_primary_focus', 'da', 'dr', 'price_usd', 'committed_tat', 'created_at', 'updated_at'];
      const safeCol = allowedCols.includes(col) ? col : 'created_at';

      const safeDir = dir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      sql += ` ORDER BY ${safeCol} ${safeDir}`;
    } else {
      sql += ` ORDER BY created_at DESC`;
    }

    // Handle Limit and Offset
    if (limit !== null) {
      sql += ` LIMIT $${values.length + 1}`;
      values.push(parseInt(limit));
    }
    if (offset !== null) {
      sql += ` OFFSET $${values.length + 1}`;
      values.push(parseInt(offset));
    }

    const countValues = limit !== null ? (offset !== null ? values.slice(0, values.length - 2) : values.slice(0, values.length - 1)) : values;

    const [result, countResult] = await Promise.all([
      query(sql, values),
      query(countSql, countValues)
    ]);

    return {
      rows: result.rows.map(row => new PublicationManagement(row)),
      count: parseInt(countResult.rows[0].count)
    };
  }

  // Find all
  static async findAll(limit = null, offset = null) {
    let sql = 'SELECT * FROM publication_managements ORDER BY created_at DESC';
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
    return result.rows.map(row => new PublicationManagement(row));
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
    const sql = `UPDATE publication_managements SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);

    return this;
  }

  // Delete
  async delete() {
    const sql = 'DELETE FROM publication_managements WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      region: this.region,
      publication_name: this.publication_name,
      publication_url: this.publication_url,
      da: this.da,
      article_reference_link: this.article_reference_link,
      committed_tat: this.committed_tat,
      language: this.language,
      publication_primary_focus: this.publication_primary_focus,
      practical_tat: this.practical_tat,
      price_usd: this.price_usd,
      do_follow: this.do_follow,
      dr: this.dr,
      word_limit: this.word_limit,
      needs_images: this.needs_images,
      image_count: this.image_count,
      image: this.image,
      rating_type: this.rating_type,
      instagram: this.instagram,
      facebook: this.facebook,
      twitter: this.twitter,
      linkedin: this.linkedin,
      remarks: this.remarks,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = PublicationManagement;