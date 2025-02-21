// controllers/notificationsController.js
const pool = require('../config/database');
const redisClient = require('../config/redis');

const notificationsController = {
  // GET ALL NOTIFICATIONS (with Redis caching)
  getAllNotifications: async (req, res) => {
    try {
      const cached = await redisClient.get('all_notifications');
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query('SELECT * FROM notifications;');
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No notifications found' });
      }
      await redisClient.set('all_notifications', JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  },

  // GET NOTIFICATION BY ID (with Redis caching)
  getNotificationById: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }
    try {
      const redisKey = `notification_${id}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(
        'SELECT * FROM notifications WHERE notificationid = $1;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching notification by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch notification' });
    }
  },

  // CREATE NOTIFICATION
  createNotification: async (req, res) => {
    const { citizenid, applicationid, content, notificationtype, sentdate } = req.body;
    if (!citizenid || !applicationid) {
      return res.status(400).json({ error: 'citizenid and applicationid are required' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO notifications (citizenid, applicationid, content, notificationtype, sentdate)
         VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [citizenid, applicationid, content, notificationtype, sentdate]
      );
      await redisClient.del('all_notifications');
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating notification:', error.message);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  },

  // UPDATE NOTIFICATION
  updateNotification: async (req, res) => {
    const { id } = req.params;
    const { citizenid, applicationid, content, notificationtype, sentdate } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }
    try {
      const result = await pool.query(
        `UPDATE notifications
         SET citizenid = $1, applicationid = $2, content = $3, notificationtype = $4, sentdate = $5
         WHERE notificationid = $6 RETURNING *;`,
        [citizenid, applicationid, content, notificationtype, sentdate, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      await redisClient.del('all_notifications');
      const redisKey = `notification_${id}`;
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating notification:', error.message);
      res.status(500).json({ error: 'Failed to update notification' });
    }
  },

  // DELETE NOTIFICATION
  deleteNotification: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }
    try {
      const result = await pool.query(
        'DELETE FROM notifications WHERE notificationid = $1 RETURNING *;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      await redisClient.del('all_notifications');
      await redisClient.del(`notification_${id}`);
      res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Error deleting notification:', error.message);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  },
};

module.exports = notificationsController;
