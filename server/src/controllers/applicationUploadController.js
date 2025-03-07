const pool = require('../config/database');
const redisClient = require('../config/redis');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// In ra thông tin môi trường để debug
console.log('Environment variables:');
console.log('- UPLOAD_DIR:', path.join(__dirname, '../../public/uploads'));
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- DATABASE:', process.env.DB_DATABASE);
console.log('- DB CONNECTION:', process.env.DB_HOST ? `${process.env.DB_HOST}:${process.env.DB_PORT}` : 'Not configured');

// Define storage for uploaded files with simpler implementation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store files directly in public/uploads without date subfolder
    const uploadDir = path.join(__dirname, '../../public/uploads');
    
    console.log('Upload directory:', uploadDir);
    
    // Create directory if it doesn't exist
    try {
      if (!fs.existsSync(uploadDir)) {
        console.log('Creating upload directory');
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (err) {
      console.error('Error creating upload directory:', err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    // Simple unique filename
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname) || '';
    cb(null, uniquePrefix + extension);
  }
});

// Define simple file filter
const fileFilter = (req, file, cb) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  }
});

const applicationUploadController = {
  // Upload middleware - to be used in routes
  uploadFiles: upload.array('files', 10), // Allow up to 10 files
  
  // Test database schema
  testDatabaseSchema: async (req, res) => {
    try {
      console.log('Testing database schema...');
      
      // Check if we can connect to the database
      try {
        await pool.query('SELECT NOW()');
        console.log('Database connection successful');
      } catch (error) {
        console.error('Database connection error:', error);
        return res.status(500).json({ 
          error: 'Database connection failed',
          details: error.message
        });
      }
      
      // Check applications table schema
      try {
        const result = await pool.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'applications'
          ORDER BY ordinal_position;
        `);
        
        console.log('Applications table schema:', result.rows);
        
        return res.status(200).json({
          message: 'Database schema test successful',
          applicationsSchema: result.rows
        });
      } catch (error) {
        console.error('Error fetching schema:', error);
        return res.status(500).json({
          error: 'Failed to fetch schema information',
          details: error.message
        });
      }
    } catch (error) {
      console.error('Schema test error:', error);
      return res.status(500).json({
        error: 'Schema test failed',
        details: error.message
      });
    }
  },
  
  // Handle application submission with files - simplified for debugging
  submitApplication: async (req, res) => {
    try {
      console.log('== APPLICATION SUBMISSION STARTED ==');
      
      // Log auth information
      console.log('Auth info:', {
        userId: req.userId || 'Not available',
        hasAuthHeader: !!req.headers.authorization
      });
      
      // Get the uploaded files from multer
      const files = req.files || [];
      console.log(`Files received: ${files.length}`);
      
      // Get application data from request body
      console.log('Request body:', req.body);
      
      // Validate minimal required fields
      if (!req.userId) {
        console.error('No user ID available');
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!req.body.applicationtypeid || !req.body.title) {
        console.error('Missing required fields');
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      
      // STEP 1: Try to connect to database
      try {
        console.log('Testing database connection...');
        await pool.query('SELECT NOW()');
        console.log('Database connection successful');
      } catch (dbError) {
        console.error('Database connection error:', dbError);
        return res.status(500).json({ error: 'Database connection failed', details: dbError.message });
      }
      
      // STEP 2: Try a simple database transaction
      try {
        console.log('Starting transaction...');
        await pool.query('BEGIN');
        console.log('Transaction started');
        
        // Parse data
        const applicationTypeId = parseInt(req.body.applicationtypeid, 10);
        const specialApplicationTypeId = req.body.specialapplicationtypeid ? 
          parseInt(req.body.specialapplicationtypeid, 10) : null;
        
        // Tính toán ngày đến hạn mặc định (7 ngày sau ngày nộp)
        const submissionDate = new Date();
        const dueDateDefault = new Date(submissionDate);
        dueDateDefault.setDate(dueDateDefault.getDate() + 7);
        
        console.log('Creating application record with data:', {
          citizenid: req.userId,
          applicationtypeid: applicationTypeId,
          specialapplicationtypeid: specialApplicationTypeId,
          title: req.body.title,
          // Thêm trường duedate mặc định
          duedate: dueDateDefault.toISOString().split('T')[0]
        });
        
        // Insert minimal application record với thêm trường duedate
        const applicationResult = await pool.query(
          `INSERT INTO applications 
           (citizenid, applicationtypeid, specialapplicationtypeid, title, description, 
            submissiondate, status, lastupdated, hasmedia, duedate)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;`,
          [
            req.userId, 
            applicationTypeId, 
            specialApplicationTypeId, 
            req.body.title, 
            req.body.description || null, 
            submissionDate,
            'Submitted',
            new Date(),
            files.length > 0,
            dueDateDefault // Thêm giá trị cho duedate
          ]
        );
        
        console.log('Application created successfully');
        const newApplication = applicationResult.rows[0];
        const applicationId = newApplication.applicationid;
        
        // STEP 3: Process files if any
        if (files.length > 0) {
          console.log(`Processing ${files.length} files for application ID ${applicationId}`);
          
          for (const file of files) {
            const filetype = file.mimetype.startsWith('image/') ? 'image' : 'video';
            const filepath = '/uploads/' + path.basename(file.path);
            
            console.log(`Adding media file: ${filepath} (${filetype})`);
            
            await pool.query(
              `INSERT INTO mediafiles (applicationid, filetype, filepath, filesize, uploaddate)
               VALUES ($1, $2, $3, $4, $5);`,
              [applicationId, filetype, filepath, file.size, new Date()]
            );
          }
          
          console.log('All files processed successfully');
        }
        
        // Commit transaction
        await pool.query('COMMIT');
        console.log('Transaction committed');
        
        // Success response
        return res.status(201).json({
          message: 'Application submitted successfully',
          application: newApplication,
          filesUploaded: files.length
        });
      } catch (error) {
        // Handle transaction error
        console.error('Transaction error:', error);
        
        try {
          await pool.query('ROLLBACK');
          console.log('Transaction rolled back');
        } catch (rollbackError) {
          console.error('Rollback error:', rollbackError);
        }
        
        return res.status(500).json({ 
          error: 'Failed to submit application', 
          details: error.message 
        });
      }
    } catch (error) {
      // Handle outer error
      console.error('Outer error in submit application:', error);
      return res.status(500).json({ 
        error: 'Failed to submit application',
        details: error.message
      });
    }
  }
};

module.exports = applicationUploadController; 