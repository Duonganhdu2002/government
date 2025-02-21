// controllers/agencyDelaysController.js
const pool = require('../config/database');
const redisClient = require('../config/redis');

const agencyDelaysController = {
  // GET ALL AGENCY DELAYS (with Redis caching)
  getAllAgencyDelays: async (req, res) => {
    try {
      const cached = await redisClient.get('all_agencydelays');
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query('SELECT * FROM agencydelays;');
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No agency delays found' });
      }
      await redisClient.set('all_agencydelays', JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching agency delays:', error.message);
      res.status(500).json({ error: 'Failed to fetch agency delays' });
    }
  },

  // GET AGENCY DELAY BY ID (with Redis caching)
  getAgencyDelayById: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid delay ID' });
    }
    try {
      const redisKey = `agencydelay_${id}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(
        'SELECT * FROM agencydelays WHERE delayid = $1;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Agency delay not found' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching agency delay by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch agency delay' });
    }
  },

  // CREATE AGENCY DELAY
  createAgencyDelay: async (req, res) => {
    const { agencyid, applicationid, delayduration, reason, recordeddate } = req.body;
    if (!agencyid || !applicationid) {
      return res.status(400).json({ error: 'agencyid and applicationid are required' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO agencydelays (agencyid, applicationid, delayduration, reason, recordeddate)
         VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [agencyid, applicationid, delayduration, reason, recordeddate]
      );
      await redisClient.del('all_agencydelays');
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating agency delay:', error.message);
      res.status(500).json({ error: 'Failed to create agency delay' });
    }
  },

  // UPDATE AGENCY DELAY
  updateAgencyDelay: async (req, res) => {
    const { id } = req.params;
    const { agencyid, applicationid, delayduration, reason, recordeddate } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid delay ID' });
    }
    try {
      const result = await pool.query(
        `UPDATE agencydelays
         SET agencyid = $1, applicationid = $2, delayduration = $3, reason = $4, recordeddate = $5
         WHERE delayid = $6 RETURNING *;`,
        [agencyid, applicationid, delayduration, reason, recordeddate, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Agency delay not found' });
      }
      await redisClient.del('all_agencydelays');
      const redisKey = `agencydelay_${id}`;
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating agency delay:', error.message);
      res.status(500).json({ error: 'Failed to update agency delay' });
    }
  },

  // DELETE AGENCY DELAY
  deleteAgencyDelay: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid delay ID' });
    }
    try {
      const result = await pool.query(
        'DELETE FROM agencydelays WHERE delayid = $1 RETURNING *;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Agency delay not found' });
      }
      await redisClient.del('all_agencydelays');
      await redisClient.del(`agencydelay_${id}`);
      res.status(200).json({ message: 'Agency delay deleted successfully' });
    } catch (error) {
      console.error('Error deleting agency delay:', error.message);
      res.status(500).json({ error: 'Failed to delete agency delay' });
    }
  },
};

module.exports = agencyDelaysController;
