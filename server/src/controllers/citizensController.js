// controllers/citizensController.js
const pool = require('../config/database');
const redisClient = require('../config/redis');

const citizensController = {
  // GET ALL CITIZENS (with Redis caching)
  getAllCitizens: async (req, res) => {
    try {
      console.log('Attempting to fetch citizens from Redis cache...');
      // 1) Attempt to get data from Redis
      const cachedCitizens = await redisClient.get('all_citizens');

      // If cache hit, return data
      if (cachedCitizens) {
        console.log('Cache hit! Returning data from Redis');
        return res.status(200).json(JSON.parse(cachedCitizens));
      }

      // 2) If not found in Redis, fetch from PostgreSQL using lowercase table name
      console.log('Cache miss. Fetching citizens from database...');
      const result = await pool.query('SELECT * FROM citizens;');
      console.log('Query result:', result.rows);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No citizens found' });
      }

      // 3) Store data in Redis (set an expiration, e.g. 60s)
      await redisClient.set('all_citizens', JSON.stringify(result.rows), {
        EX: 60, // expires in 60 seconds
      });

      // 4) Return the data
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching citizens:', error);
      res.status(500).json({ error: 'Failed to fetch citizens' });
    }
  },

  // GET CITIZEN BY ID (with Redis caching)
  getCitizenById: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid Citizen ID' });
    }
    try {
      // 1) Check Redis first
      const redisKey = `citizen_${id}`;
      const cachedCitizen = await redisClient.get(redisKey);

      if (cachedCitizen) {
        console.log(`Cache hit for Citizen ID=${id}`);
        return res.status(200).json(JSON.parse(cachedCitizen));
      }

      // 2) Not in cache -> query DB (table and column names in lowercase)
      console.log(`Cache miss for Citizen ID=${id}. Querying database...`);
      const result = await pool.query(
        'SELECT * FROM citizens WHERE citizenid = $1;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Citizen not found' });
      }

      // 3) Store in Redis
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), {
        EX: 60, // expires in 60 seconds
      });

      // 4) Return the data
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching citizen by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch citizen' });
    }
  },

  // CREATE CITIZEN
  createCitizen: async (req, res) => {
    const {
      fullname,
      identificationnumber,
      address,
      phonenumber,
      email,
      username,
      passwordhash,
      areacode,
    } = req.body;

    // Input validation
    if (!fullname || !identificationnumber || !username || !passwordhash || !areacode) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO citizens (fullname, identificationnumber, address, phonenumber, email, username, passwordhash, areacode)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
        [fullname, identificationnumber, address, phonenumber, email, username, passwordhash, areacode]
      );

      // Invalidate cache for citizens list
      await redisClient.del('all_citizens');

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating citizen:', error.message);
      res.status(500).json({ error: 'Failed to create citizen' });
    }
  },

  // UPDATE CITIZEN
  updateCitizen: async (req, res) => {
    const { id } = req.params;
    const {
      fullname,
      identificationnumber,
      address,
      phonenumber,
      email,
      username,
      passwordhash,
      areacode,
    } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid Citizen ID' });
    }

    try {
      const result = await pool.query(
        `UPDATE citizens
         SET fullname = $1, identificationnumber = $2, address = $3, phonenumber = $4, email = $5,
             username = $6, passwordhash = $7, areacode = $8
         WHERE citizenid = $9 RETURNING *;`,
        [fullname, identificationnumber, address, phonenumber, email, username, passwordhash, areacode, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Citizen not found' });
      }

      // Invalidate/update cache
      await redisClient.del('all_citizens');
      const redisKey = `citizen_${id}`;
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating citizen:', error.message);
      res.status(500).json({ error: 'Failed to update citizen' });
    }
  },

  // DELETE CITIZEN
  deleteCitizen: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid Citizen ID' });
    }
    try {
      const result = await pool.query(
        'DELETE FROM citizens WHERE citizenid = $1 RETURNING *;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Citizen not found' });
      }

      // Invalidate caches
      await redisClient.del('all_citizens');
      await redisClient.del(`citizen_${id}`);

      res.status(200).json({ message: 'Citizen deleted successfully' });
    } catch (error) {
      console.error('Error deleting citizen:', error.message);
      res.status(500).json({ error: 'Failed to delete citizen' });
    }
  },
};

module.exports = citizensController;
