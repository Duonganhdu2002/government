// controllers/mediaFilesController.js
const pool = require('../config/database');
const redisClient = require('../config/redis');
const path = require('path');
const fs = require('fs');
const util = require('util');
const mkdir = util.promisify(fs.mkdir);
const { executeQuery } = require('../utils/db.util');
const { sendSuccess, sendError } = require('../utils/response.util');
const logger = require('../utils/logger.util');

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

  // GET MEDIA FILES BY APPLICATION ID
  getMediaFilesByApplicationId: async (req, res) => {
    const { applicationId } = req.params;
    if (!applicationId || isNaN(applicationId)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }
    try {
      const redisKey = `mediafiles_by_app_${applicationId}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        console.log(`Returning cached media files for application ${applicationId}`);
        return res.status(200).json(JSON.parse(cached));
      }
      
      console.log(`Fetching media files from database for application ${applicationId}`);
      const result = await pool.query(
        'SELECT * FROM mediafiles WHERE applicationid = $1 ORDER BY uploaddate DESC;',
        [applicationId]
      );
      
      // Không trả về 404 nếu không có tệp đính kèm, chỉ trả về mảng rỗng
      const mediaFiles = result.rows;
      
      // Kiểm tra các đường dẫn file
      if (mediaFiles.length > 0) {
        console.log('Media files found:', mediaFiles.length);
        // Log 3 file đầu tiên để debug
        mediaFiles.slice(0, 3).forEach((file, index) => {
          console.log(`File ${index + 1}:`, {
            id: file.mediafileid,
            filepath: file.filepath,
            type: file.filetype || file.mimetype
          });
          
          // Kiểm tra file có tồn tại không
          const path = require('path');
          const fs = require('fs');
          const filename = file.filepath.split('/').pop();
          const realFilePath = path.join(__dirname, '../../public/uploads', filename);
          
          const fileExists = fs.existsSync(realFilePath);
          console.log(`File ${index + 1} exists on disk:`, fileExists, `(${realFilePath})`);
        });
      } else {
        console.log('No media files found for application', applicationId);
      }
      
      // Cache kết quả trong 60 giây
      await redisClient.set(redisKey, JSON.stringify(mediaFiles), { EX: 60 });
      
      res.status(200).json(mediaFiles);
    } catch (error) {
      console.error(`Error fetching media files for application ${applicationId}:`, error.message);
      res.status(500).json({ error: 'Failed to fetch media files for this application' });
    }
  },

  // SERVE MEDIA FILE DIRECTLY
  serveMediaFile: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid mediafile ID' });
    }
    
    try {
      // Tìm file trong database
      const result = await pool.query(
        'SELECT filepath FROM mediafiles WHERE mediafileid = $1;',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Media file not found' });
      }
      
      const { filepath } = result.rows[0];
      
      // Xây dựng đường dẫn thực tế đến file
      const path = require('path');
      const fs = require('fs');
      
      // Lấy đường dẫn thực từ tên file trong database
      // filepath thường có dạng "/uploads/filename.ext"
      const filename = filepath.split('/').pop(); // Lấy tên file từ đường dẫn
      const realFilePath = path.join(__dirname, '../../public/uploads', filename);
      
      // Kiểm tra xem file có tồn tại không
      if (!fs.existsSync(realFilePath)) {
        console.error(`File không tồn tại tại đường dẫn: ${realFilePath}`);
        return res.status(404).json({ message: 'File not found on disk' });
      }
      
      // Gửi file trực tiếp đến client
      console.log(`Serving file: ${realFilePath}`);
      return res.sendFile(realFilePath);
      
    } catch (error) {
      console.error('Error serving media file:', error.message);
      res.status(500).json({ error: 'Failed to serve media file' });
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
      // Xóa cache liên quan đến application này
      await redisClient.del(`mediafiles_by_app_${applicationid}`);
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
      // Xóa cache liên quan đến application này
      await redisClient.del(`mediafiles_by_app_${applicationid}`);
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
      // Trước tiên lấy thông tin tệp để biết application ID
      const fileQuery = await pool.query(
        'SELECT applicationid FROM mediafiles WHERE mediafileid = $1',
        [id]
      );
      
      if (fileQuery.rows.length === 0) {
        return res.status(404).json({ message: 'Media file not found' });
      }
      
      const { applicationid } = fileQuery.rows[0];
      
      const result = await pool.query(
        'DELETE FROM mediafiles WHERE mediafileid = $1 RETURNING *;',
        [id]
      );
      
      await redisClient.del('all_mediafiles');
      await redisClient.del(`mediafile_${id}`);
      // Xóa cache liên quan đến application này
      await redisClient.del(`mediafiles_by_app_${applicationid}`);
      
      res.status(200).json({ message: 'Media file deleted successfully' });
    } catch (error) {
      console.error('Error deleting media file:', error.message);
      res.status(500).json({ error: 'Failed to delete media file' });
    }
  },

  // UPLOAD PROFILE IMAGE
  uploadProfileImage: async (req, res) => {
    try {
      // Check if file exists
      if (!req.file) {
        return sendError(res, 'No file uploaded', 400);
      }

      // Check if user ID is provided
      const { userid, usertype = 'citizen' } = req.body;
      if (!userid || isNaN(userid)) {
        return sendError(res, 'Invalid user ID', 400);
      }

      // Get file information
      const file = req.file;
      const originalFileName = file.originalname;
      const fileSize = file.size;
      const mimeType = file.mimetype;

      // Validate file type (only allow image files)
      if (!mimeType.startsWith('image/')) {
        return sendError(res, 'Only image files are allowed', 400);
      }

      // Create date-based directory structure for organized storage
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      const uploadDir = path.join('public', 'uploads', 'profiles', `${year}-${month}-${day}`);
      const fullUploadPath = path.join(process.cwd(), uploadDir);
      
      // Create directory if it doesn't exist
      try {
        await mkdir(fullUploadPath, { recursive: true });
      } catch (err) {
        logger.error('Error creating upload directory:', err);
        // If directory already exists, continue
        if (err.code !== 'EEXIST') {
          return sendError(res, 'Failed to create upload directory', 500);
        }
      }

      // Generate relative file path for database storage (using forward slashes for URLs)
      const relativePath = `/uploads/profiles/${year}-${month}-${day}/${file.filename}`;
      
      // Determine table based on user type
      const table = usertype === 'staff' ? 'staff' : 'citizens';
      const idField = usertype === 'staff' ? 'staffid' : 'citizenid';
      
      // Update user's profile image link in database
      const updateQuery = `UPDATE ${table} SET imagelink = $1 WHERE ${idField} = $2 RETURNING *`;
      const result = await executeQuery(updateQuery, [relativePath, userid]);
      
      if (result.rows.length === 0) {
        return sendError(res, 'User not found', 404);
      }
      
      // Record file in mediafiles table for tracking
      const mediaQuery = `
        INSERT INTO mediafiles 
          (userid, usertype, originalfilename, filesize, mimetype, filepath)
        VALUES 
          ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const mediaResult = await executeQuery(mediaQuery, [
        userid,
        usertype,
        originalFileName,
        fileSize,
        mimeType,
        relativePath
      ]);
      
      // Clear any cached user data to ensure fresh data is retrieved
      await redisClient.del(`user_${usertype}_${userid}`);
      
      // Return success with updated user info
      return sendSuccess(res, {
        message: 'Profile image updated successfully',
        imageUrl: relativePath,
        mediaFile: mediaResult.rows[0]
      });
    } catch (error) {
      logger.error('Error uploading profile image:', error);
      return sendError(res, `Failed to upload profile image: ${error.message}`, 500);
    }
  },
};

module.exports = mediaFilesController;
