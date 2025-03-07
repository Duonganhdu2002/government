const pool = require('../config/database');
const redisClient = require('../config/redis');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/posts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept images, documents, and common file types
    const acceptedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
    const extname = acceptedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = acceptedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image, document, and common file types are allowed'));
  }
}).array('files', 5); // Allow up to 5 files

const mediaPostFilesController = {
  // Upload file handler - uses middleware to process files before saving to db
  uploadPostFiles: (req, res) => {
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Multer error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { postid } = req.body;
      if (!postid || isNaN(postid)) {
        // Delete uploaded files if postid is invalid
        if (req.files) {
          req.files.forEach(file => {
            fs.unlinkSync(file.path);
          });
        }
        return res.status(400).json({ error: 'Post ID is required' });
      }

      try {
        const uploadResults = [];
        
        // Process each uploaded file
        for (const file of req.files) {
          const fileType = path.extname(file.originalname).substr(1);
          const filePath = `/uploads/posts/${file.filename}`;
          const fileSize = file.size;
          
          const result = await pool.query(
            `INSERT INTO mediapostfiles (postid, filetype, filepath, filesize, uploaddate)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *;`,
            [postid, fileType, filePath, fileSize]
          );
          
          uploadResults.push(result.rows[0]);
        }
        
        await redisClient.del(`post_media_${postid}`);
        await redisClient.del('all_mediapostfiles');
        
        res.status(201).json({
          message: 'Files uploaded successfully',
          files: uploadResults
        });
      } catch (error) {
        console.error('Error uploading post files:', error.message);
        // Delete uploaded files on database error
        if (req.files) {
          req.files.forEach(file => {
            fs.unlinkSync(file.path);
          });
        }
        res.status(500).json({ error: 'Failed to upload files' });
      }
    });
  },

  // GET ALL MEDIA POST FILES (with Redis caching)
  getAllMediaPostFiles: async (req, res) => {
    try {
      const cached = await redisClient.get('all_mediapostfiles');
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(`
        SELECT m.*, p.title as posttitle
        FROM mediapostfiles m
        JOIN posts p ON m.postid = p.postid;
      `);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No media post files found' });
      }
      await redisClient.set('all_mediapostfiles', JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching media post files:', error.message);
      res.status(500).json({ error: 'Failed to fetch media post files' });
    }
  },

  // GET MEDIA POST FILE BY ID (with Redis caching)
  getMediaPostFileById: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid media post file ID' });
    }
    try {
      const redisKey = `mediapostfile_${id}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(
        `SELECT m.*, p.title as posttitle
         FROM mediapostfiles m
         JOIN posts p ON m.postid = p.postid
         WHERE m.mediapostfileid = $1;`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Media post file not found' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching media post file by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch media post file' });
    }
  },

  // GET MEDIA FILES BY POST ID
  getMediaFilesByPostId: async (req, res) => {
    const { postId } = req.params;
    if (!postId || isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    try {
      const redisKey = `post_media_${postId}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(
        'SELECT * FROM mediapostfiles WHERE postid = $1;',
        [postId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No media files found for this post' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching media files by post ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch media files' });
    }
  },

  // DELETE MEDIA POST FILE
  deleteMediaPostFile: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid media post file ID' });
    }
    try {
      // Get the file information before deleting
      const fileInfo = await pool.query(
        'SELECT postid, filepath FROM mediapostfiles WHERE mediapostfileid = $1;',
        [id]
      );
      if (fileInfo.rows.length === 0) {
        return res.status(404).json({ message: 'Media post file not found' });
      }
      
      const { postid, filepath } = fileInfo.rows[0];
      
      // Delete from database
      const result = await pool.query(
        'DELETE FROM mediapostfiles WHERE mediapostfileid = $1 RETURNING *;',
        [id]
      );
      
      // Delete the physical file
      const filePath = path.join(__dirname, '../..', filepath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Invalidate caches
      await redisClient.del('all_mediapostfiles');
      await redisClient.del(`mediapostfile_${id}`);
      await redisClient.del(`post_media_${postid}`);
      
      res.status(200).json({ message: 'Media post file deleted successfully' });
    } catch (error) {
      console.error('Error deleting media post file:', error.message);
      res.status(500).json({ error: 'Failed to delete media post file' });
    }
  },
};

module.exports = mediaPostFilesController; 