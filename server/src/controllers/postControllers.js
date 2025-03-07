// controllers/postControllers.js
const pool = require('../config/database');
const redisClient = require('../config/redis');

const postControllers = {
  // GET ALL POSTS (với Redis caching)
  getAllPosts: async (req, res) => {
    try {
      const cached = await redisClient.get('all_posts');
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query('SELECT * FROM posts;');
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No posts found' });
      }
      await redisClient.set('all_posts', JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  },

  // GET POST BY ID (với Redis caching)
  getPostById: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    try {
      const redisKey = `post_${id}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query('SELECT * FROM posts WHERE postid = $1;', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching post by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  },

  // GET POSTS BY CATEGORY ID (với Redis caching)
  getPostsByCategoryId: async (req, res) => {
    const { categoryId } = req.params;
    if (!categoryId || isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    try {
      const redisKey = `posts_category_${categoryId}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query('SELECT * FROM posts WHERE categoryid = $1;', [categoryId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No posts found for this category' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching posts by category ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch posts by category' });
    }
  },

  // CREATE POST
  createPost: async (req, res) => {
    const { categoryid, title, content } = req.body;
    if (!categoryid || !title || !content) {
      return res.status(400).json({ error: 'categoryid, title, and content are required' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO posts (categoryid, title, content, createdat, updatedat)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *;`,
        [categoryid, title, content]
      );
      // Xóa cache liên quan
      await redisClient.del('all_posts');
      await redisClient.del(`posts_category_${categoryid}`);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating post:', error.message);
      res.status(500).json({ error: 'Failed to create post' });
    }
  },

  // UPDATE POST
  updatePost: async (req, res) => {
    const { id } = req.params;
    const { categoryid, title, content } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    try {
      const result = await pool.query(
        `UPDATE posts
         SET categoryid = $1, title = $2, content = $3, updatedat = CURRENT_TIMESTAMP
         WHERE postid = $4
         RETURNING *;`,
        [categoryid, title, content, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }
      await redisClient.del('all_posts');
      await redisClient.del(`post_${id}`);
      await redisClient.del(`posts_category_${categoryid}`);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating post:', error.message);
      res.status(500).json({ error: 'Failed to update post' });
    }
  },

  // DELETE POST
  deletePost: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    try {
      // Lấy thông tin categoryid của bài viết cần xóa để xóa cache liên quan
      const postResult = await pool.query('SELECT categoryid FROM posts WHERE postid = $1;', [id]);
      if (postResult.rows.length === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }
      const catId = postResult.rows[0].categoryid;

      const result = await pool.query(
        'DELETE FROM posts WHERE postid = $1 RETURNING *;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }
      await redisClient.del('all_posts');
      await redisClient.del(`post_${id}`);
      await redisClient.del(`posts_category_${catId}`);
      res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting post:', error.message);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  },
};

module.exports = postControllers;
