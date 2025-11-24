const { query } = require('../config/database');

class Blog {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.image = data.image;
    this.category = data.category;
    this.author = data.author;
    this.tags = data.tags;
    this.publishDate = data.publish_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validate blog data
  static validate(blogData) {
    const errors = [];

    if (!blogData.title || typeof blogData.title !== 'string' || blogData.title.trim().length === 0) {
      errors.push('Title is required and must be a non-empty string');
    }

    if (!blogData.content || typeof blogData.content !== 'string' || blogData.content.trim().length === 0) {
      errors.push('Content is required and must be a non-empty string');
    }

    if (!blogData.publishDate) {
      errors.push('Publish date is required');
    }

    if (blogData.image !== undefined && blogData.image !== null && typeof blogData.image !== 'string') {
      errors.push('Image must be a string or null');
    }

    if (blogData.category !== undefined && typeof blogData.category !== 'string') {
      errors.push('Category must be a string');
    }

    if (blogData.author !== undefined && typeof blogData.author !== 'string') {
      errors.push('Author must be a string');
    }

    if (blogData.tags !== undefined && typeof blogData.tags !== 'string') {
      errors.push('Tags must be a string');
    }

    return errors;
  }

  // Create a new blog
  static async create(blogData) {
    const validationErrors = this.validate(blogData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    const sql = `
      INSERT INTO blogs (title, content, image, category, author, tags, publish_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      blogData.title,
      blogData.content,
      blogData.image || null,
      blogData.category || null,
      blogData.author || null,
      blogData.tags || null,
      blogData.publishDate
    ];

    const result = await query(sql, values);
    return new Blog(result.rows[0]);
  }

  // Find blog by ID
  static async findById(id) {
    const sql = 'SELECT * FROM blogs WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] ? new Blog(result.rows[0]) : null;
  }

  // Find all blogs with filtering
  static async findAll(options = {}) {
    const { where = {}, limit, offset, order = [['created_at', 'DESC']] } = options;
    let sql = 'SELECT * FROM blogs WHERE 1=1';
    const values = [];
    let paramCount = 1;

    // Add where conditions
    Object.keys(where).forEach(key => {
      if (where[key] !== undefined) {
        if (typeof where[key] === 'object' && where[key].$or) {
          // Handle $or conditions
          const orConditions = where[key].$or.map(condition => {
            const field = Object.keys(condition)[0];
            const value = condition[field];
            if (typeof value === 'object' && value.$iLike) {
              values.push(`%${value.$iLike.replace(/%/g, '')}%`);
              return `${field} ILIKE $${paramCount++}`;
            }
            return `${field} = $${paramCount++}`;
          });
          sql += ` AND (${orConditions.join(' OR ')})`;
        } else {
          sql += ` AND ${key} = $${paramCount}`;
          values.push(where[key]);
          paramCount++;
        }
      }
    });

    // Add order
    if (order && order.length > 0) {
      sql += ` ORDER BY ${order.map(o => `${o[0]} ${o[1]}`).join(', ')}`;
    }

    // Add limit and offset
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
    return result.rows.map(row => new Blog(row));
  }

  // Find and count all blogs
  static async findAndCountAll(options = {}) {
    const { where = {}, limit, offset, order = [['created_at', 'DESC']] } = options;
    let sql = 'SELECT * FROM blogs WHERE 1=1';
    const values = [];
    let paramCount = 1;

    // Add where conditions
    Object.keys(where).forEach(key => {
      if (where[key] !== undefined) {
        if (typeof where[key] === 'object' && where[key].$or) {
          // Handle $or conditions
          const orConditions = where[key].$or.map(condition => {
            const field = Object.keys(condition)[0];
            const value = condition[field];
            if (typeof value === 'object' && value.$iLike) {
              values.push(`%${value.$iLike.replace(/%/g, '')}%`);
              return `${field} ILIKE $${paramCount++}`;
            }
            return `${field} = $${paramCount++}`;
          });
          sql += ` AND (${orConditions.join(' OR ')})`;
        } else {
          sql += ` AND ${key} = $${paramCount}`;
          values.push(where[key]);
          paramCount++;
        }
      }
    });

    // Get count
    const countSql = `SELECT COUNT(*) as count FROM (${sql}) as subquery`;
    const countResult = await query(countSql, values);
    const count = parseInt(countResult.rows[0].count);

    // Add order
    if (order && order.length > 0) {
      sql += ` ORDER BY ${order.map(o => `${o[0]} ${o[1]}`).join(', ')}`;
    }

    // Add limit and offset
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
    return {
      count: count,
      rows: result.rows.map(row => new Blog(row))
    };
  }

  // Update blog
  async update(updateData) {
    const validationErrors = Blog.validate({ ...this, ...updateData });
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
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
    const sql = `UPDATE blogs SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    Object.assign(this, result.rows[0]);
    return this;
  }

  // Delete blog
  async delete() {
    const sql = 'DELETE FROM blogs WHERE id = $1';
    await query(sql, [this.id]);
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      image: this.image,
      category: this.category,
      author: this.author,
      tags: this.tags,
      publishDate: this.publishDate,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    };
  }
}

module.exports = Blog;