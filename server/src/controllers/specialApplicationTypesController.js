const pool = require('../config/database');
const redisClient = require('../config/redis');

const specialApplicationTypesController = {
  // GET ALL SPECIAL APPLICATION TYPES (with Redis caching)
  getAllSpecialApplicationTypes: async (req, res) => {
    try {
      const cached = await redisClient.get('all_specialapplicationtypes');
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(`
        SELECT s.*, a.typename as applicationtypename 
        FROM specialapplicationtypes s
        JOIN applicationtypes a ON s.applicationtypeid = a.applicationtypeid;
      `);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No special application types found' });
      }
      await redisClient.set('all_specialapplicationtypes', JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching special application types:', error.message);
      res.status(500).json({ error: 'Failed to fetch special application types' });
    }
  },

  // GET SPECIAL APPLICATION TYPE BY ID (with Redis caching)
  getSpecialApplicationTypeById: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid special application type ID' });
    }
    try {
      const redisKey = `specialapplicationtype_${id}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(
        `SELECT s.*, a.typename as applicationtypename 
         FROM specialapplicationtypes s
         JOIN applicationtypes a ON s.applicationtypeid = a.applicationtypeid
         WHERE s.specialapplicationtypeid = $1;`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Special application type not found' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching special application type by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch special application type' });
    }
  },

  // GET SPECIAL APPLICATION TYPES BY APPLICATION TYPE ID
  getSpecialApplicationTypesByAppTypeId: async (req, res) => {
    const { applicationTypeId } = req.params;
    if (!applicationTypeId || isNaN(applicationTypeId)) {
      return res.status(400).json({ error: 'Invalid application type ID' });
    }
    try {
      const redisKey = `specialapptypes_byapptype_${applicationTypeId}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(
        `SELECT s.*, a.typename as applicationtypename 
         FROM specialapplicationtypes s
         JOIN applicationtypes a ON s.applicationtypeid = a.applicationtypeid
         WHERE s.applicationtypeid = $1;`,
        [applicationTypeId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No special application types found for this application type' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching special application types by application type ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch special application types' });
    }
  },

  // CREATE SPECIAL APPLICATION TYPE
  createSpecialApplicationType: async (req, res) => {
    const { applicationtypeid, typename, processingtimelimit } = req.body;
    if (!applicationtypeid || !typename || !processingtimelimit) {
      return res.status(400).json({ error: 'applicationtypeid, typename, and processingtimelimit are required' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO specialapplicationtypes (applicationtypeid, typename, processingtimelimit)
         VALUES ($1, $2, $3) RETURNING *;`,
        [applicationtypeid, typename, processingtimelimit]
      );
      await redisClient.del('all_specialapplicationtypes');
      await redisClient.del(`specialapptypes_byapptype_${applicationtypeid}`);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating special application type:', error.message);
      res.status(500).json({ error: 'Failed to create special application type' });
    }
  },

  // UPDATE SPECIAL APPLICATION TYPE
  updateSpecialApplicationType: async (req, res) => {
    const { id } = req.params;
    const { applicationtypeid, typename, processingtimelimit } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid special application type ID' });
    }
    try {
      const result = await pool.query(
        `UPDATE specialapplicationtypes
         SET applicationtypeid = $1, typename = $2, processingtimelimit = $3
         WHERE specialapplicationtypeid = $4 RETURNING *;`,
        [applicationtypeid, typename, processingtimelimit, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Special application type not found' });
      }
      await redisClient.del('all_specialapplicationtypes');
      await redisClient.del(`specialapptypes_byapptype_${applicationtypeid}`);
      const redisKey = `specialapplicationtype_${id}`;
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating special application type:', error.message);
      res.status(500).json({ error: 'Failed to update special application type' });
    }
  },

  // DELETE SPECIAL APPLICATION TYPE
  deleteSpecialApplicationType: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid special application type ID' });
    }
    try {
      // Get the application type ID before deleting for cache invalidation
      const appTypeResult = await pool.query(
        'SELECT applicationtypeid FROM specialapplicationtypes WHERE specialapplicationtypeid = $1;',
        [id]
      );
      if (appTypeResult.rows.length === 0) {
        return res.status(404).json({ message: 'Special application type not found' });
      }
      const { applicationtypeid } = appTypeResult.rows[0];
      
      const result = await pool.query(
        'DELETE FROM specialapplicationtypes WHERE specialapplicationtypeid = $1 RETURNING *;',
        [id]
      );
      
      await redisClient.del('all_specialapplicationtypes');
      await redisClient.del(`specialapptypes_byapptype_${applicationtypeid}`);
      await redisClient.del(`specialapplicationtype_${id}`);
      res.status(200).json({ message: 'Special application type deleted successfully' });
    } catch (error) {
      console.error('Error deleting special application type:', error.message);
      res.status(500).json({ error: 'Failed to delete special application type' });
    }
  },
};

module.exports = specialApplicationTypesController; 