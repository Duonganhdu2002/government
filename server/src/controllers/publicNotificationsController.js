// controllers/publicNotificationsController.js
const pool = require('../config/database');
const redisClient = require('../config/redis');

const publicNotificationsController = {
  // GET ALL PUBLIC NOTIFICATIONS (with Redis caching)
  getAllPublicNotifications: async (req, res) => {
    try {
      const cached = await redisClient.get('all_publicnotifications');
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query('SELECT * FROM publicnotifications;');
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No public notifications found' });
      }
      await redisClient.set('all_publicnotifications', JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching public notifications:', error.message);
      res.status(500).json({ error: 'Failed to fetch public notifications' });
    }
  },

  // GET PUBLIC NOTIFICATION BY ID (with Redis caching)
  getPublicNotificationById: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }
    try {
      const redisKey = `publicnotification_${id}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(
        'SELECT * FROM publicnotifications WHERE notificationid = $1;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Public notification not found' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching public notification by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch public notification' });
    }
  },

  // CREATE PUBLIC NOTIFICATION
  createPublicNotification: async (req, res) => {
    const { agencyid, title, content, targetarea, sentdate } = req.body;
    if (!agencyid || !title) {
      return res.status(400).json({ error: 'agencyid and title are required' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO publicnotifications (agencyid, title, content, targetarea, sentdate)
         VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [agencyid, title, content, targetarea, sentdate]
      );
      await redisClient.del('all_publicnotifications');
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating public notification:', error.message);
      res.status(500).json({ error: 'Failed to create public notification' });
    }
  },

  // UPDATE PUBLIC NOTIFICATION
  updatePublicNotification: async (req, res) => {
    const { id } = req.params;
    const { agencyid, title, content, targetarea, sentdate } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }
    try {
      const result = await pool.query(
        `UPDATE publicnotifications
         SET agencyid = $1, title = $2, content = $3, targetarea = $4, sentdate = $5
         WHERE notificationid = $6 RETURNING *;`,
        [agencyid, title, content, targetarea, sentdate, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Public notification not found' });
      }
      await redisClient.del('all_publicnotifications');
      const redisKey = `publicnotification_${id}`;
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating public notification:', error.message);
      res.status(500).json({ error: 'Failed to update public notification' });
    }
  },

  // DELETE PUBLIC NOTIFICATION
  deletePublicNotification: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }
    try {
      const result = await pool.query(
        'DELETE FROM publicnotifications WHERE notificationid = $1 RETURNING *;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Public notification not found' });
      }
      await redisClient.del('all_publicnotifications');
      await redisClient.del(`publicnotification_${id}`);
      res.status(200).json({ message: 'Public notification deleted successfully' });
    } catch (error) {
      console.error('Error deleting public notification:', error.message);
      res.status(500).json({ error: 'Failed to delete public notification' });
    }
  },
};

module.exports = publicNotificationsController;
