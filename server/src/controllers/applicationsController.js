// controllers/applicationsController.js
const pool = require('../config/database');
const redisClient = require('../config/redis');

const applicationsController = {
  // GET ALL APPLICATIONS (with Redis caching)
  getAllApplications: async (req, res) => {
    try {
      const cached = await redisClient.get('all_applications');
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query('SELECT * FROM applications;');
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No applications found' });
      }
      await redisClient.set('all_applications', JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching applications:', error.message);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  },

  // GET APPLICATION BY ID (with Redis caching)
  getApplicationById: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid Application ID' });
    }
    try {
      const redisKey = `application_${id}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(
        'SELECT * FROM applications WHERE applicationid = $1;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Application not found' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching application by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch application' });
    }
  },

  // CREATE APPLICATION
  createApplication: async (req, res) => {
    const {
      citizenid,
      applicationtypeid,
      title,
      description,
      submissiondate,
      status,
      currentagencyid,
      lastupdated,
      duedate,
      isoverdue,
      hasmedia,
    } = req.body;

    if (!citizenid || !applicationtypeid || !title) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO applications 
         (citizenid, applicationtypeid, title, description, submissiondate, status, currentagencyid, lastupdated, duedate, isoverdue, hasmedia)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;`,
        [citizenid, applicationtypeid, title, description, submissiondate, status, currentagencyid, lastupdated, duedate, isoverdue, hasmedia]
      );
      await redisClient.del('all_applications');
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating application:', error.message);
      res.status(500).json({ error: 'Failed to create application' });
    }
  },

  // UPDATE APPLICATION
  updateApplication: async (req, res) => {
    const { id } = req.params;
    const {
      citizenid,
      applicationtypeid,
      title,
      description,
      submissiondate,
      status,
      currentagencyid,
      lastupdated,
      duedate,
      isoverdue,
      hasmedia,
    } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid Application ID' });
    }

    try {
      const result = await pool.query(
        `UPDATE applications
         SET citizenid = $1, applicationtypeid = $2, title = $3, description = $4, submissiondate = $5,
             status = $6, currentagencyid = $7, lastupdated = $8, duedate = $9, isoverdue = $10, hasmedia = $11
         WHERE applicationid = $12 RETURNING *;`,
        [citizenid, applicationtypeid, title, description, submissiondate, status, currentagencyid, lastupdated, duedate, isoverdue, hasmedia, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Application not found' });
      }
      await redisClient.del('all_applications');
      const redisKey = `application_${id}`;
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating application:', error.message);
      res.status(500).json({ error: 'Failed to update application' });
    }
  },

  // DELETE APPLICATION
  deleteApplication: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid Application ID' });
    }
    try {
      const result = await pool.query(
        'DELETE FROM applications WHERE applicationid = $1 RETURNING *;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Application not found' });
      }
      await redisClient.del('all_applications');
      await redisClient.del(`application_${id}`);
      res.status(200).json({ message: 'Application deleted successfully' });
    } catch (error) {
      console.error('Error deleting application:', error.message);
      res.status(500).json({ error: 'Failed to delete application' });
    }
  },
};

module.exports = applicationsController;
