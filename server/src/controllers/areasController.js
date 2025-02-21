// controllers/areasController.js
const pool = require('../config/database');
const redisClient = require('../config/redis');

const areasController = {
  // GET ALL AREAS (with Redis caching)
  getAllAreas: async (req, res) => {
    try {
      const cached = await redisClient.get('all_areas');
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query('SELECT * FROM areas;');
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No areas found' });
      }
      await redisClient.set('all_areas', JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching areas:', error.message);
      res.status(500).json({ error: 'Failed to fetch areas' });
    }
  },

  // GET AREA BY ID (with Redis caching)
  getAreaById: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid area code' });
    }
    try {
      const redisKey = `area_${id}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(
        'SELECT * FROM areas WHERE areacode = $1;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Area not found' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching area by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch area' });
    }
  },

  // CREATE AREA
  createArea: async (req, res) => {
    const { areaname, parentareacode } = req.body;
    if (!areaname) {
      return res.status(400).json({ error: 'areaname is required' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO areas (areaname, parentareacode)
         VALUES ($1, $2) RETURNING *;`,
        [areaname, parentareacode]
      );
      await redisClient.del('all_areas');
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating area:', error.message);
      res.status(500).json({ error: 'Failed to create area' });
    }
  },

  // UPDATE AREA
  updateArea: async (req, res) => {
    const { id } = req.params;
    const { areaname, parentareacode } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid area code' });
    }
    try {
      const result = await pool.query(
        `UPDATE areas
         SET areaname = $1, parentareacode = $2
         WHERE areacode = $3 RETURNING *;`,
        [areaname, parentareacode, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Area not found' });
      }
      await redisClient.del('all_areas');
      const redisKey = `area_${id}`;
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating area:', error.message);
      res.status(500).json({ error: 'Failed to update area' });
    }
  },

  // DELETE AREA
  deleteArea: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid area code' });
    }
    try {
      const result = await pool.query(
        'DELETE FROM areas WHERE areacode = $1 RETURNING *;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Area not found' });
      }
      await redisClient.del('all_areas');
      await redisClient.del(`area_${id}`);
      res.status(200).json({ message: 'Area deleted successfully' });
    } catch (error) {
      console.error('Error deleting area:', error.message);
      res.status(500).json({ error: 'Failed to delete area' });
    }
  },
};

module.exports = areasController;
