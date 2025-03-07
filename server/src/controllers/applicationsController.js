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
      const result = await pool.query('SELECT * FROM applications ORDER BY submissiondate DESC;');
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
        `SELECT a.*, 
          at.typename as applicationtypename, 
          sat.typename as specialapplicationtypename,
          c.fullname as citizenname
        FROM applications a
        LEFT JOIN applicationtypes at ON a.applicationtypeid = at.applicationtypeid
        LEFT JOIN specialapplicationtypes sat ON a.specialapplicationtypeid = sat.specialapplicationtypeid
        LEFT JOIN citizens c ON a.citizenid = c.citizenid
        WHERE a.applicationid = $1;`,
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

  // GET APPLICATIONS BY CITIZEN ID
  getApplicationsByCitizenId: async (req, res) => {
    const { citizenId } = req.params;
    if (!citizenId || isNaN(citizenId)) {
      return res.status(400).json({ error: 'Invalid Citizen ID' });
    }
    try {
      const redisKey = `citizen_applications_${citizenId}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      
      const result = await pool.query(
        `SELECT a.*, 
          at.typename as applicationtypename, 
          sat.typename as specialapplicationtypename 
        FROM applications a
        LEFT JOIN applicationtypes at ON a.applicationtypeid = at.applicationtypeid
        LEFT JOIN specialapplicationtypes sat ON a.specialapplicationtypeid = sat.specialapplicationtypeid
        WHERE a.citizenid = $1
        ORDER BY a.submissiondate DESC;`,
        [citizenId]
      );
      
      await redisClient.set(redisKey, JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching applications by citizen ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  },

  // CREATE APPLICATION
  createApplication: async (req, res) => {
    const {
      citizenid,
      applicationtypeid,
      specialapplicationtypeid,
      title,
      description,
      submissiondate,
      status,
      currentagencyid,
      lastupdated,
      duedate,
      isoverdue,
      hasmedia,
      eventdate,
      location,
    } = req.body;

    if (!citizenid || !applicationtypeid || !title) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO applications 
         (citizenid, applicationtypeid, specialapplicationtypeid, title, description, 
          submissiondate, status, currentagencyid, lastupdated, duedate, 
          isoverdue, hasmedia, eventdate, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *;`,
        [citizenid, applicationtypeid, specialapplicationtypeid, title, description, 
         submissiondate, status || 'Submitted', currentagencyid, lastupdated || new Date(), 
         duedate, isoverdue || false, hasmedia || false, eventdate, location]
      );
      
      // Invalidate relevant caches
      await redisClient.del('all_applications');
      await redisClient.del(`citizen_applications_${citizenid}`);
      
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
      specialapplicationtypeid,
      title,
      description,
      submissiondate,
      status,
      currentagencyid,
      lastupdated,
      duedate,
      isoverdue,
      hasmedia,
      eventdate,
      location,
    } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid Application ID' });
    }

    try {
      // First get the current application to know which citizen's cache to invalidate
      const currentApp = await pool.query(
        'SELECT citizenid FROM applications WHERE applicationid = $1',
        [id]
      );
      
      if (currentApp.rows.length === 0) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      const currentCitizenId = currentApp.rows[0].citizenid;
      
      const result = await pool.query(
        `UPDATE applications
         SET citizenid = $1, applicationtypeid = $2, specialapplicationtypeid = $3, 
             title = $4, description = $5, submissiondate = $6, status = $7, 
             currentagencyid = $8, lastupdated = $9, duedate = $10, isoverdue = $11, 
             hasmedia = $12, eventdate = $13, location = $14
         WHERE applicationid = $15 RETURNING *;`,
        [citizenid, applicationtypeid, specialapplicationtypeid, title, description, 
         submissiondate, status, currentagencyid, lastupdated || new Date(), 
         duedate, isoverdue, hasmedia, eventdate, location, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      // Invalidate caches
      await redisClient.del('all_applications');
      await redisClient.del(`application_${id}`);
      await redisClient.del(`citizen_applications_${currentCitizenId}`);
      
      // If citizen ID changed, invalidate the new citizen's cache too
      if (citizenid && citizenid !== currentCitizenId) {
        await redisClient.del(`citizen_applications_${citizenid}`);
      }
      
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
      // First get the application to know which citizen's cache to invalidate
      const app = await pool.query(
        'SELECT citizenid FROM applications WHERE applicationid = $1',
        [id]
      );
      
      if (app.rows.length === 0) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      const citizenId = app.rows[0].citizenid;
      
      const result = await pool.query(
        'DELETE FROM applications WHERE applicationid = $1 RETURNING *;',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      // Invalidate caches
      await redisClient.del('all_applications');
      await redisClient.del(`application_${id}`);
      await redisClient.del(`citizen_applications_${citizenId}`);
      
      res.status(200).json({ message: 'Application deleted successfully' });
    } catch (error) {
      console.error('Error deleting application:', error.message);
      res.status(500).json({ error: 'Failed to delete application' });
    }
  },
  
  // GET APPLICATION STATISTICS
  getApplicationStatistics: async (req, res) => {
    try {
      const redisKey = 'application_statistics';
      const cached = await redisClient.get(redisKey);
      
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      
      // Get total counts by status
      const statusResult = await pool.query(`
        SELECT status, COUNT(*) as count 
        FROM applications 
        GROUP BY status;
      `);
      
      // Get monthly submissions for the last 6 months
      const monthlyResult = await pool.query(`
        SELECT 
          DATE_TRUNC('month', submissiondate) as month,
          COUNT(*) as count
        FROM applications
        WHERE submissiondate >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', submissiondate)
        ORDER BY month;
      `);
      
      // Get counts by application type
      const typeResult = await pool.query(`
        SELECT 
          at.typename, 
          COUNT(*) as count
        FROM applications a
        JOIN applicationtypes at ON a.applicationtypeid = at.applicationtypeid
        GROUP BY at.typename;
      `);
      
      const statistics = {
        byStatus: statusResult.rows,
        monthly: monthlyResult.rows,
        byType: typeResult.rows,
        total: statusResult.rows.reduce((sum, item) => sum + parseInt(item.count), 0)
      };
      
      await redisClient.set(redisKey, JSON.stringify(statistics), { EX: 300 }); // Cache for 5 minutes
      
      res.status(200).json(statistics);
    } catch (error) {
      console.error('Error fetching application statistics:', error.message);
      res.status(500).json({ error: 'Failed to fetch application statistics' });
    }
  }
};

module.exports = applicationsController;
