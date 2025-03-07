// controllers/postCategoriesController.js

const pool = require('../config/database');
const redisClient = require('../config/redis');

const postCategoriesController = {
  // GET ALL POST CATEGORIES (with Redis caching)
  getAllPostCategories: async (req, res) => {
    try {
      const cached = await redisClient.get('all_post_categories');
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query('SELECT * FROM postcategories;');
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No post categories found' });
      }
      // Lưu kết quả vào Redis, với thời gian hết hạn (EX) là 60 giây
      await redisClient.set('all_post_categories', JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching post categories:', error.message);
      res.status(500).json({ error: 'Failed to fetch post categories' });
    }
  },

  // GET POST CATEGORY BY ID (with Redis caching)
  getPostCategoryById: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid post category ID' });
    }
    try {
      const redisKey = `post_category_${id}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(
        'SELECT * FROM postcategories WHERE categoryid = $1;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Post category not found' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching post category by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch post category' });
    }
  },

  // CREATE POST CATEGORY
  createPostCategory: async (req, res) => {
    const { categoryname, description } = req.body;
    if (!categoryname) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO postcategories (categoryname, description)
         VALUES ($1, $2) RETURNING *;`,
        [categoryname, description]
      );
      // Clear related cache
      await redisClient.del('all_post_categories');
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating post category:', error.message);
      res.status(500).json({ error: 'Failed to create post category' });
    }
  },

  // UPDATE POST CATEGORY
  updatePostCategory: async (req, res) => {
    const { id } = req.params;
    const { categoryname, description } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid post category ID' });
    }
    if (!categoryname) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    try {
      const result = await pool.query(
        `UPDATE postcategories
         SET categoryname = $1, description = $2
         WHERE categoryid = $3
         RETURNING *;`,
        [categoryname, description, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Post category not found' });
      }
      // Clear related cache
      await redisClient.del('all_post_categories');
      await redisClient.del(`post_category_${id}`);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating post category:', error.message);
      res.status(500).json({ error: 'Failed to update post category' });
    }
  },

  // DELETE POST CATEGORY
  deletePostCategory: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid post category ID' });
    }
    try {
      const result = await pool.query(
        'DELETE FROM postcategories WHERE categoryid = $1 RETURNING *;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Post category not found' });
      }
      // Clear related cache
      await redisClient.del('all_post_categories');
      await redisClient.del(`post_category_${id}`);
      res.status(200).json({ message: 'Post category deleted successfully' });
    } catch (error) {
      console.error('Error deleting post category:', error.message);
      res.status(500).json({ error: 'Failed to delete post category' });
    }
  }
};

module.exports = postCategoriesController;
