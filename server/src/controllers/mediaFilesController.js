// controllers/mediaFilesController.js
const pool = require('../config/database');
const redisClient = require('../config/redis');

const mediaFilesController = {
  // GET ALL MEDIA FILES (with Redis caching)
  getAllMediaFiles: async (req, res) => {
    try {
      const cached = await redisClient.get('all_mediafiles');
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query('SELECT * FROM mediafiles;');
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No media files found' });
      }
      await redisClient.set('all_mediafiles', JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching media files:', error.message);
      res.status(500).json({ error: 'Failed to fetch media files' });
    }
  },

  // GET MEDIA FILE BY ID (with Redis caching)
  getMediaFileById: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid mediafile ID' });
    }
    try {
      const redisKey = `mediafile_${id}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(
        'SELECT * FROM mediafiles WHERE mediafileid = $1;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Media file not found' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching media file by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch media file' });
    }
  },

  // CREATE MEDIA FILE
  createMediaFile: async (req, res) => {
    const { applicationid, filetype, filepath, filesize, uploaddate } = req.body;
    if (!applicationid || !filepath) {
      return res.status(400).json({ error: 'applicationid and filepath are required' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO mediafiles (applicationid, filetype, filepath, filesize, uploaddate)
         VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [applicationid, filetype, filepath, filesize, uploaddate]
      );
      await redisClient.del('all_mediafiles');
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating media file:', error.message);
      res.status(500).json({ error: 'Failed to create media file' });
    }
  },

  // UPDATE MEDIA FILE
  updateMediaFile: async (req, res) => {
    const { id } = req.params;
    const { applicationid, filetype, filepath, filesize, uploaddate } = req.body;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid mediafile ID' });
    }
    try {
      const result = await pool.query(
        `UPDATE mediafiles
         SET applicationid = $1, filetype = $2, filepath = $3, filesize = $4, uploaddate = $5
         WHERE mediafileid = $6 RETURNING *;`,
        [applicationid, filetype, filepath, filesize, uploaddate, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Media file not found' });
      }
      await redisClient.del('all_mediafiles');
      const redisKey = `mediafile_${id}`;
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating media file:', error.message);
      res.status(500).json({ error: 'Failed to update media file' });
    }
  },

  // DELETE MEDIA FILE
  deleteMediaFile: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid mediafile ID' });
    }
    try {
      const result = await pool.query(
        'DELETE FROM mediafiles WHERE mediafileid = $1 RETURNING *;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Media file not found' });
      }
      await redisClient.del('all_mediafiles');
      await redisClient.del(`mediafile_${id}`);
      res.status(200).json({ message: 'Media file deleted successfully' });
    } catch (error) {
      console.error('Error deleting media file:', error.message);
      res.status(500).json({ error: 'Failed to delete media file' });
    }
  },
};

module.exports = mediaFilesController;
