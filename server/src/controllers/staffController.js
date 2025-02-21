// controllers/staffController.js
const pool = require('../config/database');
const redisClient = require('../config/redis');

const staffController = {
  // GET ALL STAFF (with Redis caching)
  getAllStaff: async (req, res) => {
    try {
      const cached = await redisClient.get('all_staff');
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query('SELECT * FROM staff;');
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No staff members found' });
      }
      await redisClient.set('all_staff', JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching staff:', error.message);
      res.status(500).json({ error: 'Failed to fetch staff' });
    }
  },

  // GET STAFF BY ID (with Redis caching)
  getStaffById: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid staff ID' });
    }
    try {
      const redisKey = `staff_${id}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(
        'SELECT * FROM staff WHERE staffid = $1;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Staff member not found' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching staff by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch staff member' });
    }
  },

  // CREATE STAFF
  createStaff: async (req, res) => {
    const { agencyid, fullname, employeecode, role, username, passwordhash } = req.body;
    if (!agencyid || !fullname) {
      return res.status(400).json({ error: 'agencyid and fullname are required' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO staff (agencyid, fullname, employeecode, role, username, passwordhash)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
        [agencyid, fullname, employeecode, role, username, passwordhash]
      );
      await redisClient.del('all_staff');
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating staff:', error.message);
      res.status(500).json({ error: 'Failed to create staff member' });
    }
  },

  // UPDATE STAFF
  updateStaff: async (req, res) => {
    const { id } = req.params;
    const { agencyid, fullname, employeecode, role, username, passwordhash } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid staff ID' });
    }
    try {
      const result = await pool.query(
        `UPDATE staff
         SET agencyid = $1, fullname = $2, employeecode = $3, role = $4, username = $5, passwordhash = $6
         WHERE staffid = $7 RETURNING *;`,
        [agencyid, fullname, employeecode, role, username, passwordhash, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Staff member not found' });
      }
      await redisClient.del('all_staff');
      const redisKey = `staff_${id}`;
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating staff:', error.message);
      res.status(500).json({ error: 'Failed to update staff member' });
    }
  },

  // DELETE STAFF
  deleteStaff: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid staff ID' });
    }
    try {
      const result = await pool.query(
        'DELETE FROM staff WHERE staffid = $1 RETURNING *;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Staff member not found' });
      }
      await redisClient.del('all_staff');
      await redisClient.del(`staff_${id}`);
      res.status(200).json({ message: 'Staff deleted successfully' });
    } catch (error) {
      console.error('Error deleting staff:', error.message);
      res.status(500).json({ error: 'Failed to delete staff member' });
    }
  },
};

module.exports = staffController;
