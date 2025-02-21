// controllers/processingHistoryController.js
const pool = require('../config/database');
const redisClient = require('../config/redis');

const processingHistoryController = {
  // GET ALL PROCESSING HISTORY RECORDS (with Redis caching)
  getAllProcessingHistory: async (req, res) => {
    try {
      const cached = await redisClient.get('all_processinghistory');
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query('SELECT * FROM processinghistory;');
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No processing history records found' });
      }
      await redisClient.set('all_processinghistory', JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching processing history:', error.message);
      res.status(500).json({ error: 'Failed to fetch processing history' });
    }
  },

  // GET PROCESSING HISTORY RECORD BY ID (with Redis caching)
  getProcessingHistoryById: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid history ID' });
    }
    try {
      const redisKey = `processinghistory_${id}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(
        'SELECT * FROM processinghistory WHERE historyid = $1;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Processing history record not found' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching processing history by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch processing history record' });
    }
  },

  // CREATE PROCESSING HISTORY RECORD
  createProcessingHistory: async (req, res) => {
    const { applicationid, staffid, actiontaken, actiondate, notes, isdelayed } = req.body;
    if (!applicationid || !staffid) {
      return res.status(400).json({ error: 'applicationid and staffid are required' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO processinghistory (applicationid, staffid, actiontaken, actiondate, notes, isdelayed)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
        [applicationid, staffid, actiontaken, actiondate, notes, isdelayed]
      );
      await redisClient.del('all_processinghistory');
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating processing history record:', error.message);
      res.status(500).json({ error: 'Failed to create processing history record' });
    }
  },

  // UPDATE PROCESSING HISTORY RECORD
  updateProcessingHistory: async (req, res) => {
    const { id } = req.params;
    const { applicationid, staffid, actiontaken, actiondate, notes, isdelayed } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid history ID' });
    }
    try {
      const result = await pool.query(
        `UPDATE processinghistory
         SET applicationid = $1, staffid = $2, actiontaken = $3, actiondate = $4, notes = $5, isdelayed = $6
         WHERE historyid = $7 RETURNING *;`,
        [applicationid, staffid, actiontaken, actiondate, notes, isdelayed, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Processing history record not found' });
      }
      await redisClient.del('all_processinghistory');
      const redisKey = `processinghistory_${id}`;
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating processing history record:', error.message);
      res.status(500).json({ error: 'Failed to update processing history record' });
    }
  },

  // DELETE PROCESSING HISTORY RECORD
  deleteProcessingHistory: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid history ID' });
    }
    try {
      const result = await pool.query(
        'DELETE FROM processinghistory WHERE historyid = $1 RETURNING *;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Processing history record not found' });
      }
      await redisClient.del('all_processinghistory');
      await redisClient.del(`processinghistory_${id}`);
      res.status(200).json({ message: 'Processing history record deleted successfully' });
    } catch (error) {
      console.error('Error deleting processing history record:', error.message);
      res.status(500).json({ error: 'Failed to delete processing history record' });
    }
  },
};

module.exports = processingHistoryController;
