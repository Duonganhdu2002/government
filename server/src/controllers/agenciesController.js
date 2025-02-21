// controllers/agenciesController.js
const pool = require('../config/database');
const redisClient = require('../config/redis');

const agenciesController = {
  // GET ALL AGENCIES (with Redis caching)
  getAllAgencies: async (req, res) => {
    try {
      const cached = await redisClient.get('all_agencies');
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query('SELECT * FROM agencies;');
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No agencies found' });
      }
      await redisClient.set('all_agencies', JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching agencies:', error.message);
      res.status(500).json({ error: 'Failed to fetch agencies' });
    }
  },

  // GET AGENCY BY ID (with Redis caching)
  getAgencyById: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid agency ID' });
    }
    try {
      const redisKey = `agency_${id}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(
        'SELECT * FROM agencies WHERE agencyid = $1;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Agency not found' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching agency by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch agency' });
    }
  },

  // CREATE AGENCY
  createAgency: async (req, res) => {
    const { agencyname, address, phonenumber, email, specializedfields, areacode } = req.body;
    if (!agencyname || !areacode) {
      return res.status(400).json({ error: 'agencyname and areacode are required' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO agencies (agencyname, address, phonenumber, email, specializedfields, areacode)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
        [agencyname, address, phonenumber, email, specializedfields, areacode]
      );
      await redisClient.del('all_agencies');
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating agency:', error.message);
      res.status(500).json({ error: 'Failed to create agency' });
    }
  },

  // UPDATE AGENCY
  updateAgency: async (req, res) => {
    const { id } = req.params;
    const { agencyname, address, phonenumber, email, specializedfields, areacode } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid agency ID' });
    }
    try {
      const result = await pool.query(
        `UPDATE agencies
         SET agencyname = $1, address = $2, phonenumber = $3, email = $4, specializedfields = $5, areacode = $6
         WHERE agencyid = $7 RETURNING *;`,
        [agencyname, address, phonenumber, email, specializedfields, areacode, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Agency not found' });
      }
      await redisClient.del('all_agencies');
      const redisKey = `agency_${id}`;
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating agency:', error.message);
      res.status(500).json({ error: 'Failed to update agency' });
    }
  },

  // DELETE AGENCY
  deleteAgency: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid agency ID' });
    }
    try {
      const result = await pool.query(
        'DELETE FROM agencies WHERE agencyid = $1 RETURNING *;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Agency not found' });
      }
      await redisClient.del('all_agencies');
      await redisClient.del(`agency_${id}`);
      res.status(200).json({ message: 'Agency deleted successfully' });
    } catch (error) {
      console.error('Error deleting agency:', error.message);
      res.status(500).json({ error: 'Failed to delete agency' });
    }
  },
};

module.exports = agenciesController;
