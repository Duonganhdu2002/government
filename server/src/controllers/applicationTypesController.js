// controllers/applicationTypesController.js
const pool = require('../config/database');
const redisClient = require('../config/redis');

const applicationTypesController = {
  // GET ALL APPLICATION TYPES (with Redis caching)
  getAllApplicationTypes: async (req, res) => {
    try {
      const cached = await redisClient.get('all_applicationtypes');
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query('SELECT * FROM applicationtypes;');
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No application types found' });
      }
      await redisClient.set('all_applicationtypes', JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching application types:', error.message);
      res.status(500).json({ error: 'Failed to fetch application types' });
    }
  },

  // GET APPLICATION TYPE BY ID (with Redis caching)
  getApplicationTypeById: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid application type ID' });
    }
    try {
      const redisKey = `applicationtype_${id}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(
        'SELECT * FROM applicationtypes WHERE applicationtypeid = $1;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Application type not found' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching application type by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch application type' });
    }
  },

  // CREATE APPLICATION TYPE
  createApplicationType: async (req, res) => {
    const { typename, description, processingtimelimit } = req.body;
    if (!typename) {
      return res.status(400).json({ error: 'typename is required' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO applicationtypes (typename, description, processingtimelimit)
         VALUES ($1, $2, $3) RETURNING *;`,
        [typename, description, processingtimelimit]
      );
      await redisClient.del('all_applicationtypes');
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating application type:', error.message);
      res.status(500).json({ error: 'Failed to create application type' });
    }
  },

  // UPDATE APPLICATION TYPE
  updateApplicationType: async (req, res) => {
    const { id } = req.params;
    const { typename, description, processingtimelimit } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid application type ID' });
    }
    try {
      const result = await pool.query(
        `UPDATE applicationtypes
         SET typename = $1, description = $2, processingtimelimit = $3
         WHERE applicationtypeid = $4 RETURNING *;`,
        [typename, description, processingtimelimit, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Application type not found' });
      }
      await redisClient.del('all_applicationtypes');
      const redisKey = `applicationtype_${id}`;
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating application type:', error.message);
      res.status(500).json({ error: 'Failed to update application type' });
    }
  },

  // DELETE APPLICATION TYPE
  deleteApplicationType: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid application type ID' });
    }
    try {
      const result = await pool.query(
        'DELETE FROM applicationtypes WHERE applicationtypeid = $1 RETURNING *;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Application type not found' });
      }
      await redisClient.del('all_applicationtypes');
      await redisClient.del(`applicationtype_${id}`);
      res.status(200).json({ message: 'Application type deleted successfully' });
    } catch (error) {
      console.error('Error deleting application type:', error.message);
      res.status(500).json({ error: 'Failed to delete application type' });
    }
  },
};

module.exports = applicationTypesController;
