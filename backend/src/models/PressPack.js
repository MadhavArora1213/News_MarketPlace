const { query } = require('../config/database');

class PressPack {
  constructor(data) {
    this.id = data.id;
    this.distribution_package = data.distribution_package;
    this.region = data.region;
    this.price = data.price;
    this.industry = data.industry;
    this.news = data.news;
    this.indexed = data.indexed;
    this.disclaimer = data.disclaimer;
    this.no_of_indexed_websites = data.no_of_indexed_websites;
    this.no_of_non_indexed_websites = data.no_of_non_indexed_websites;
    this.image = data.image;
    this.link = data.link;
    this.words_limit = data.words_limit;
    this.language = data.language;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new press pack
  static async create(pressPackData) {
    const {
      distribution_package,
      region,
      price,
      industry,
      news,
      indexed,
      disclaimer,
      no_of_indexed_websites,
      no_of_non_indexed_websites,
      image,
      link,
      words_limit,
      language
    } = pressPackData;

    const sql = `
      INSERT INTO press_packs (
        distribution_package, region, price, industry, news, indexed, disclaimer,
        no_of_indexed_websites, no_of_non_indexed_websites, image, link, words_limit, language
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      distribution_package, region, price, industry, news, indexed, disclaimer,
      no_of_indexed_websites, no_of_non_indexed_websites, image, link, words_limit, language
    ];

    const result = await query(sql, values);
    return new PressPack(result.rows[0]);
  }

  // Find press pack by ID
  static async findById(id) {
    const sql = 'SELECT * FROM press_packs WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new PressPack(result.rows[0]) : null;
  }

  // Find all press packs with search and pagination
  static async findAll(filters = {}, searchSql = '', searchValues = [], limit = null, offset = null) {
    let sql = 'SELECT * FROM press_packs WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.region) {
      sql += ` AND region = $${paramCount}`;
      values.push(filters.region);
      paramCount++;
    }

    if (filters.industry) {
      sql += ` AND industry = $${paramCount}`;
      values.push(filters.industry);
      paramCount++;
    }

    if (filters.indexed !== undefined) {
      sql += ` AND indexed = $${paramCount}`;
      values.push(filters.indexed);
      paramCount++;
    }

    if (filters.language) {
      sql += ` AND language = $${paramCount}`;
      values.push(filters.language);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      sql += ` AND is_active = $${paramCount}`;
      values.push(filters.is_active);
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
    return result.rows.map(row => new PressPack(row));
  }

  // Update press pack
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
    const sql = `UPDATE press_packs SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete press pack (hard delete)
  async delete() {
    const sql = 'DELETE FROM press_packs WHERE id = $1';
    await query(sql, [this.id]);
    return true;
  }

  // Get associated publications
  async getPublications() {
    const sql = `
      SELECT pub.* FROM publications pub
      INNER JOIN press_pack_publications ppp ON pub.id = ppp.publication_id
      WHERE ppp.press_pack_id = $1 AND pub.is_active = true
      ORDER BY ppp.created_at DESC
    `;
    const result = await query(sql, [this.id]);
    const Publication = require('./Publication');
    return result.rows.map(row => new Publication(row));
  }

  // Add publication association
  async addPublication(publicationId) {
    const sql = 'INSERT INTO press_pack_publications (press_pack_id, publication_id) VALUES ($1, $2) ON CONFLICT DO NOTHING';
    await query(sql, [this.id, publicationId]);
  }

  // Remove publication association
  async removePublication(publicationId) {
    const sql = 'DELETE FROM press_pack_publications WHERE press_pack_id = $1 AND publication_id = $2';
    await query(sql, [this.id, publicationId]);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      distribution_package: this.distribution_package,
      region: this.region,
      price: this.price,
      industry: this.industry,
      news: this.news,
      indexed: this.indexed,
      disclaimer: this.disclaimer,
      no_of_indexed_websites: this.no_of_indexed_websites,
      no_of_non_indexed_websites: this.no_of_non_indexed_websites,
      image: this.image,
      link: this.link,
      words_limit: this.words_limit,
      language: this.language,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = PressPack;