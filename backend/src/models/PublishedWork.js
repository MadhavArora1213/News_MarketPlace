const { query } = require('../config/database');

class PublishedWork {
  constructor(data) {
    this.id = data.id;
    this.sn = data.sn;
    this.publication_name = data.publication_name;
    this.publication_website = data.publication_website;
    this.article_link = data.article_link;
    this.article_year = data.article_year;
    this.article_date = data.article_date;
    this.company_name = data.company_name;
    this.person_name = data.person_name;
    this.industry = data.industry;
    this.company_country = data.company_country;
    this.individual_country = data.individual_country;
    this.description = data.description;
    this.tags = data.tags;
    this.is_featured = data.is_featured || false;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new published work
  static async create(publishedWorkData) {
    const {
      sn,
      publication_name,
      publication_website,
      article_link,
      article_year,
      article_date,
      company_name,
      person_name,
      industry,
      company_country,
      individual_country,
      description,
      tags,
      is_featured,
      is_active
    } = publishedWorkData;

    const sql = `
      INSERT INTO published_works (
        sn, publication_name, publication_website, article_link, article_year,
        article_date, company_name, person_name, industry, company_country,
        individual_country, description, tags, is_featured, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      sn, publication_name, publication_website, article_link, article_year,
      article_date, company_name, person_name, industry, company_country,
      individual_country, description, tags, is_featured || false, is_active !== undefined ? is_active : true
    ];

    const result = await query(sql, values);
    return new PublishedWork(result.rows[0]);
  }

  // Find published work by ID
  static async findById(id) {
    const sql = 'SELECT * FROM published_works WHERE id = $1 AND is_active = true';
    const result = await query(sql, [id]);
    return result.rows[0] ? new PublishedWork(result.rows[0]) : null;
  }

  // Find published work by SN
  static async findBySN(sn) {
    const sql = 'SELECT * FROM published_works WHERE sn = $1 AND is_active = true';
    const result = await query(sql, [sn]);
    return result.rows[0] ? new PublishedWork(result.rows[0]) : null;
  }

  // Find all published works with search and pagination
  static async findAll(filters = {}, searchSql = '', searchValues = [], limit = null, offset = null) {
    let sql = 'SELECT * FROM published_works WHERE is_active = true';
    const values = [];
    let paramCount = 1;

    if (filters.is_featured !== undefined) {
      sql += ` AND is_featured = $${paramCount}`;
      values.push(filters.is_featured);
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
    return result.rows.map(row => new PublishedWork(row));
  }

  // Get featured published works
  static async getFeatured(limit = 10) {
    const sql = 'SELECT * FROM published_works WHERE is_featured = true AND is_active = true ORDER BY created_at DESC LIMIT $1';
    const result = await query(sql, [limit]);
    return result.rows.map(row => new PublishedWork(row));
  }

  // Search published works
  static async search(searchTerm, filters = {}, limit = null, offset = null) {
    let sql = 'SELECT * FROM published_works WHERE is_active = true';
    const values = [];
    let paramCount = 1;

    // Add search term
    if (searchTerm) {
      sql += ` AND (
        publication_name ILIKE $${paramCount} OR
        company_name ILIKE $${paramCount} OR
        person_name ILIKE $${paramCount} OR
        industry ILIKE $${paramCount} OR
        company_country ILIKE $${paramCount} OR
        individual_country ILIKE $${paramCount}
      )`;
      values.push(`%${searchTerm}%`);
      paramCount++;
    }

    // Add filters
    if (filters.article_year) {
      sql += ` AND article_year = $${paramCount}`;
      values.push(filters.article_year);
      paramCount++;
    }

    if (filters.industry) {
      sql += ` AND industry ILIKE $${paramCount}`;
      values.push(`%${filters.industry}%`);
      paramCount++;
    }

    if (filters.company_country) {
      sql += ` AND company_country ILIKE $${paramCount}`;
      values.push(`%${filters.company_country}%`);
      paramCount++;
    }

    if (filters.individual_country) {
      sql += ` AND individual_country ILIKE $${paramCount}`;
      values.push(`%${filters.individual_country}%`);
      paramCount++;
    }

    if (filters.publication_name) {
      sql += ` AND publication_name ILIKE $${paramCount}`;
      values.push(`%${filters.publication_name}%`);
      paramCount++;
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
    return result.rows.map(row => new PublishedWork(row));
  }

  // Update published work
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
    const sql = `UPDATE published_works SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);

    return this;
  }

  // Delete published work (soft delete)
  async delete() {
    return await this.update({ is_active: false });
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      sn: this.sn,
      publication_name: this.publication_name,
      publication_website: this.publication_website,
      article_link: this.article_link,
      article_year: this.article_year,
      article_date: this.article_date,
      company_name: this.company_name,
      person_name: this.person_name,
      industry: this.industry,
      company_country: this.company_country,
      individual_country: this.individual_country,
      description: this.description,
      tags: this.tags,
      is_featured: this.is_featured,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = PublishedWork;