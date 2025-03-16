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

  // GET AREAS BY LEVEL (province, district, commune)
  getAreasByLevel: async (req, res) => {
    const { level } = req.params;
    
    // Convert level name to numeric value
    let levelValue;
    switch (level.toLowerCase()) {
      case 'province':
        levelValue = 1;
        break;
      case 'district':
        levelValue = 2;
        break;
      case 'commune':
        levelValue = 3;
        break;
      default:
        return res.status(400).json({ error: 'Invalid level. Must be province, district, or commune' });
    }
    
    try {
      const redisKey = `areas_level_${level}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      
      const result = await pool.query(
        'SELECT * FROM areas WHERE level = $1 ORDER BY areaname;',
        [levelValue]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: `No areas found for level: ${level}` });
      }
      
      await redisClient.set(redisKey, JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(`Error fetching areas by level ${level}:`, error.message);
      res.status(500).json({ error: `Failed to fetch areas by level: ${level}` });
    }
  },

  // GET CHILD AREAS BY PARENT ID
  getChildAreasByParent: async (req, res) => {
    const { parentId } = req.params;
    if (!parentId || isNaN(parentId)) {
      return res.status(400).json({ error: 'Invalid parent ID' });
    }
    
    try {
      const redisKey = `areas_parent_${parentId}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      
      const result = await pool.query(
        'SELECT * FROM areas WHERE parentareacode = $1 ORDER BY areaname;',
        [parentId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: `No child areas found for parent ID: ${parentId}` });
      }
      
      await redisClient.set(redisKey, JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(`Error fetching child areas by parent ID ${parentId}:`, error.message);
      res.status(500).json({ error: `Failed to fetch child areas for parent ID: ${parentId}` });
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
    const { areacode, areaname, parentareacode, level } = req.body;
    if (!areaname) {
      return res.status(400).json({ error: 'areaname is required' });
    }
    if (!level || isNaN(level) || level < 1 || level > 3) {
      return res.status(400).json({ error: 'level is required and must be between 1 and 3' });
    }
    if (!areacode) {
      return res.status(400).json({ error: 'areacode is required' });
    }
    
    try {
      const result = await pool.query(
        `INSERT INTO areas (areacode, areaname, parentareacode, level)
         VALUES ($1, $2, $3, $4) RETURNING *;`,
        [areacode, areaname, parentareacode, level]
      );
      
      // Invalidate related Redis caches
      await redisClient.del('all_areas');
      if (level === 1) await redisClient.del('areas_level_province');
      if (level === 2) await redisClient.del('areas_level_district');
      if (level === 3) await redisClient.del('areas_level_commune');
      if (parentareacode) await redisClient.del(`areas_parent_${parentareacode}`);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating area:', error.message);
      res.status(500).json({ error: 'Failed to create area: ' + error.message });
    }
  },

  // UPDATE AREA
  updateArea: async (req, res) => {
    const { id } = req.params;
    const { areaname, parentareacode, level } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid area code' });
    }
    
    try {
      // Get current area data for cache invalidation
      const currentArea = await pool.query(
        'SELECT level, parentareacode FROM areas WHERE areacode = $1;',
        [id]
      );
      
      if (currentArea.rows.length === 0) {
        return res.status(404).json({ message: 'Area not found' });
      }
      
      const oldLevel = currentArea.rows[0].level;
      const oldParent = currentArea.rows[0].parentareacode;
      
      const result = await pool.query(
        `UPDATE areas
         SET areaname = $1, parentareacode = $2, level = $3
         WHERE areacode = $4 RETURNING *;`,
        [areaname, parentareacode, level, id]
      );
      
      // Invalidate related Redis caches
      await redisClient.del('all_areas');
      await redisClient.del(`area_${id}`);
      
      // Invalidate level caches if level changed
      if (oldLevel !== level) {
        if (oldLevel === 1) await redisClient.del('areas_level_province');
        if (oldLevel === 2) await redisClient.del('areas_level_district');
        if (oldLevel === 3) await redisClient.del('areas_level_commune');
        
        if (level === 1) await redisClient.del('areas_level_province');
        if (level === 2) await redisClient.del('areas_level_district');
        if (level === 3) await redisClient.del('areas_level_commune');
      }
      
      // Invalidate parent caches if parent changed
      if (oldParent !== parentareacode) {
        if (oldParent) await redisClient.del(`areas_parent_${oldParent}`);
        if (parentareacode) await redisClient.del(`areas_parent_${parentareacode}`);
      }
      
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
      // Get current area data for cache invalidation
      const currentArea = await pool.query(
        'SELECT level, parentareacode FROM areas WHERE areacode = $1;',
        [id]
      );
      
      if (currentArea.rows.length === 0) {
        return res.status(404).json({ message: 'Area not found' });
      }
      
      const level = currentArea.rows[0].level;
      const parentareacode = currentArea.rows[0].parentareacode;
      
      const result = await pool.query(
        'DELETE FROM areas WHERE areacode = $1 RETURNING *;',
        [id]
      );
      
      // Invalidate related Redis caches
      await redisClient.del('all_areas');
      await redisClient.del(`area_${id}`);
      await redisClient.del(`areas_parent_${id}`); // Invalidate cache for its child areas
      
      if (level === 1) await redisClient.del('areas_level_province');
      if (level === 2) await redisClient.del('areas_level_district');
      if (level === 3) await redisClient.del('areas_level_commune');
      
      if (parentareacode) await redisClient.del(`areas_parent_${parentareacode}`);
      
      res.status(200).json({ message: 'Area deleted successfully' });
    } catch (error) {
      console.error('Error deleting area:', error.message);
      res.status(500).json({ error: 'Failed to delete area' });
    }
  },
};

module.exports = areasController;
