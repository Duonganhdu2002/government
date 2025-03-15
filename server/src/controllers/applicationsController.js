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
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  },

  // GET PENDING APPLICATIONS FOR STAFF AGENCY
  getPendingApplicationsForStaffAgency: async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ 
          status: 'error',
          message: 'Authentication failed - no user ID found'
        });
      }
      
      // Get the staff's agency ID
      try {
        const staffResult = await pool.query(
          'SELECT agencyid, role, fullname FROM staff WHERE staffid = $1',
          [req.userId]
        );
        
        if (staffResult.rows.length === 0) {
          return res.status(404).json({ 
            status: 'error',
            message: 'Staff not found',
            userId: req.userId
          });
        }
        
        const { agencyid, role, fullname } = staffResult.rows[0];
        
        // Check if agencyId is null or undefined
        if (!agencyid) {
          return res.status(400).json({
            status: 'error',
            message: 'Staff does not have an agency assigned',
            staffId: req.userId
          });
        }
        
        // Check if we have cached results for this agency
        const redisKey = `pending_applications_agency_${agencyid}`;
        let cached;
        try {
          cached = await redisClient.get(redisKey);
        } catch (redisError) {
          // Continue without cache on Redis error
        }
        
        if (cached) {
          try {
            const parsedData = JSON.parse(cached);
            return res.status(200).json({
              status: 'success',
              data: parsedData
            });
          } catch (parseError) {
            // Continue without using cache
          }
        }
        
        // Query applications that need approval at this agency
        try {
          const result = await pool.query(
            `SELECT a.*, 
              at.typename as applicationtypename, 
              sat.typename as specialapplicationtypename,
              c.fullname as citizenname,
              (SELECT agencyname FROM agencies WHERE agencyid = a.agencyid) as agencyname
            FROM applications a
            LEFT JOIN applicationtypes at ON a.applicationtypeid = at.applicationtypeid
            LEFT JOIN specialapplicationtypes sat ON a.specialapplicationtypeid = sat.specialapplicationtypeid
            LEFT JOIN citizens c ON a.citizenid = c.citizenid
            WHERE a.agencyid = $1
            AND (a.status = 'Submitted' OR LOWER(a.status) IN ('pending', 'in_review'))
            ORDER BY 
              CASE WHEN a.isoverdue = true THEN 0 ELSE 1 END,
              a.duedate ASC,
              a.submissiondate DESC;`,
            [agencyid]
          );
          
          // Cache the results for 5 minutes
          try {
            await redisClient.set(redisKey, JSON.stringify(result.rows), { EX: 300 });
          } catch (redisError) {
            // Continue without caching on Redis error
          }
          
          return res.status(200).json({
            status: 'success',
            data: result.rows
          });
        } catch (dbQueryError) {
          return res.status(500).json({ 
            status: 'error',
            message: 'Failed to query applications',
            details: dbQueryError.message
          });
        }
      } catch (staffQueryError) {
        return res.status(500).json({ 
          status: 'error',
          message: 'Failed to fetch staff information',
          details: staffQueryError.message
        });
      }
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to fetch pending applications',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // GET APPLICATION DETAIL FOR STAFF
  getApplicationDetailForStaff: async (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid Application ID' 
      });
    }
    
    try {
      // Get the staff's agency ID
      const staffResult = await pool.query(
        'SELECT agencyid, role FROM staff WHERE staffid = $1',
        [req.userId]
      );
      
      if (staffResult.rows.length === 0) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Staff not found' 
        });
      }
      
      const { agencyid, role } = staffResult.rows[0];
      
      // Check if we have cached results for this application for staff view
      const redisKey = `application_staff_view_${id}`;
      const cached = await redisClient.get(redisKey);
      
      if (cached) {
        const cachedData = JSON.parse(cached);
        // Only return cached data if the application belongs to the staff's agency
        // or if the staff has an admin role
        if (cachedData.agencyid === agencyid || role === 'admin') {
          return res.status(200).json(cachedData);
        }
      }
      
      // Query application details with additional information for staff
      const result = await pool.query(
        `SELECT a.*, 
          at.typename as applicationtypename, 
          sat.typename as specialapplicationtypename,
          c.fullname as citizenname,
          c.email as citizenemail,
          c.phone as citizenphone,
          c.address as citizenaddress,
          (SELECT agencyname FROM agencies WHERE agencyid = a.agencyid) as agencyname,
          (SELECT json_agg(
            json_build_object(
              'historyid', ph.historyid,
              'applicationid', ph.applicationid,
              'actiontaken', ph.actiontaken,
              'notes', ph.notes,
              'actiondate', ph.actiondate,
              'isdelayed', ph.isdelayed,
              'staffid', ph.staffid,
              'staffname', (SELECT fullname FROM staff WHERE staffid = ph.staffid)
            )
          ) FROM processinghistory ph WHERE ph.applicationid = a.applicationid) as processing_history,
          (SELECT json_agg(
            json_build_object(
              'mediafileid', mf.mediafileid,
              'filename', mf.filename,
              'filetype', mf.filetype,
              'filesize', mf.filesize,
              'uploaddate', mf.uploaddate,
              'filepath', mf.filepath
            )
          ) FROM mediafiles mf WHERE mf.applicationid = a.applicationid) as media_files
        FROM applications a
        LEFT JOIN applicationtypes at ON a.applicationtypeid = at.applicationtypeid
        LEFT JOIN specialapplicationtypes sat ON a.specialapplicationtypeid = sat.specialapplicationtypeid
        LEFT JOIN citizens c ON a.citizenid = c.citizenid
        WHERE a.applicationid = $1;`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Application not found' 
        });
      }
      
      const applicationData = result.rows[0];
      
      // Check if the staff has permission to view this application
      // Staff can only view applications assigned to their agency or if they have admin role
      if (applicationData.agencyid !== agencyid && role !== 'admin') {
        return res.status(403).json({ 
          status: 'error',
          message: 'You do not have permission to view this application' 
        });
      }
      
      // Cache the results for 5 minutes
      await redisClient.set(redisKey, JSON.stringify(applicationData), { EX: 300 });
      
      res.status(200).json({
        status: 'success',
        data: applicationData
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to fetch application details' 
      });
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
      agencyid,
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
          submissiondate, status, agencyid, lastupdated, duedate, 
          isoverdue, hasmedia, eventdate, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *;`,
        [citizenid, applicationtypeid, specialapplicationtypeid, title, description, 
         submissiondate, status || 'Submitted', agencyid, lastupdated || new Date(), 
         duedate, isoverdue || false, hasmedia || false, eventdate, location]
      );
      
      // Invalidate relevant caches
      await redisClient.del('all_applications');
      await redisClient.del(`citizen_applications_${citizenid}`);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
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
      agencyid,
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
             agencyid = $8, lastupdated = $9, duedate = $10, isoverdue = $11, 
             hasmedia = $12, eventdate = $13, location = $14
         WHERE applicationid = $15 RETURNING *;`,
        [citizenid, applicationtypeid, specialapplicationtypeid, title, description, 
         submissiondate, status, agencyid, lastupdated || new Date(), 
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
      res.status(500).json({ error: 'Failed to fetch application statistics' });
    }
  },

  // GET APPLICATIONS FOR CURRENT USER
  getCurrentUserApplications: async (req, res) => {
    try {
      // Lấy ID của người dùng hiện tại từ token (đã được xử lý bởi middleware verifyToken)
      const citizenId = req.userId;
      
      if (!citizenId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
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
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  },

  // UPDATE APPLICATION STATUS BY STAFF (uses PATCH for partial update)
  updateApplicationStatus: async (req, res) => {
    const { id } = req.params;
    const { status, comments } = req.body;
    
    console.log('PATCH update-status called for application ID:', id, 'with data:', { 
      status, 
      commentsLength: comments ? comments.length : 0
    });
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid Application ID' 
      });
    }
    
    // Validate status
    const validStatuses = ['in_review', 'approved', 'rejected', 'pending_additional_info'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid status value. Must be one of: ' + validStatuses.join(', ')
      });
    }
    
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get the staff information
      const staffResult = await client.query(
        'SELECT staffid, agencyid, fullname, role FROM staff WHERE staffid = $1',
        [req.userId]
      );
      
      if (staffResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ 
          status: 'error',
          message: 'Staff not found' 
        });
      }
      
      const { staffid, agencyid, fullname, role } = staffResult.rows[0];
      console.log('Staff info:', { staffid, agencyid, role });
      
      // Get the application
      const applicationResult = await client.query(
        'SELECT * FROM applications WHERE applicationid = $1',
        [id]
      );
      
      if (applicationResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ 
          status: 'error',
          message: 'Application not found' 
        });
      }
      
      const application = applicationResult.rows[0];
      console.log('Current application status:', application.status);
      
      // Check if the staff has permission to update this application
      // Staff can only update applications assigned to their agency or if they have admin role
      if (application.agencyid !== agencyid && role !== 'admin') {
        await client.query('ROLLBACK');
        return res.status(403).json({ 
          status: 'error',
          message: 'You do not have permission to update this application' 
        });
      }
      
      // Update the application status (PATCH - only update what changed)
      console.log('Updating application status to:', status);
      const updateResult = await client.query(
        `UPDATE applications 
        SET status = $1, 
            lastupdated = NOW()
        WHERE applicationid = $2
        RETURNING *`,
        [status, id]
      );
      
      // Add entry to processing history
      await client.query(
        `INSERT INTO processinghistory 
          (applicationid, staffid, actiontaken, actiondate, notes, isdelayed)
        VALUES ($1, $2, $3, NOW(), $4, $5)`,
        [id, staffid, status, comments || null, false]
      );
      
      // Commit the transaction
      await client.query('COMMIT');
      
      // Clear any cached data for this application
      try {
        await redisClient.del(`application_${id}`);
        await redisClient.del(`application_staff_view_${id}`);
        await redisClient.del(`pending_applications_agency_${agencyid}`);
        console.log('Cache cleared for application ID:', id);
      } catch (cacheError) {
        console.error('Error clearing cache:', cacheError);
        // Continue without failing - cache errors shouldn't cause the whole operation to fail
      }
      
      console.log('Application status updated successfully');
      res.status(200).json({
        status: 'success',
        message: `Application status updated to ${status}`,
        data: updateResult.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating application status:', error.message, error.stack);
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to update application status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    } finally {
      client.release();
    }
  },

  // SEARCH APPLICATIONS FOR STAFF
  searchApplications: async (req, res) => {
    try {
      // Get the staff's agency ID and role
      const staffResult = await pool.query(
        'SELECT agencyid, role FROM staff WHERE staffid = $1',
        [req.userId]
      );
      
      if (staffResult.rows.length === 0) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Staff not found' 
        });
      }
      
      const { agencyid, role } = staffResult.rows[0];
      
      // Extract query parameters
      const {
        status,
        applicationTypeId,
        specialApplicationTypeId,
        citizenId,
        searchTerm,
        startDate,
        endDate,
        isOverdue,
        sortBy = 'submissiondate',
        sortOrder = 'DESC',
        page = 1,
        limit = 10
      } = req.query;
      
      // Build the query
      let query = `
        SELECT a.*, 
          at.typename as applicationtypename, 
          sat.typename as specialapplicationtypename,
          c.fullname as citizenname,
          (SELECT agencyname FROM agencies WHERE agencyid = a.agencyid) as agencyname
        FROM applications a
        LEFT JOIN applicationtypes at ON a.applicationtypeid = at.applicationtypeid
        LEFT JOIN specialapplicationtypes sat ON a.specialapplicationtypeid = sat.specialapplicationtypeid
        LEFT JOIN citizens c ON a.citizenid = c.citizenid
        WHERE 1=1
      `;
      
      const queryParams = [];
      let paramIndex = 1;
      
      // Only admin can see all applications, regular staff can only see applications for their agency
      if (role !== 'admin') {
        query += ` AND a.agencyid = $${paramIndex}`;
        queryParams.push(agencyid);
        paramIndex++;
      }
      
      // Add filters
      if (status) {
        query += ` AND a.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }
      
      if (applicationTypeId) {
        query += ` AND a.applicationtypeid = $${paramIndex}`;
        queryParams.push(applicationTypeId);
        paramIndex++;
      }
      
      if (specialApplicationTypeId) {
        query += ` AND a.specialapplicationtypeid = $${paramIndex}`;
        queryParams.push(specialApplicationTypeId);
        paramIndex++;
      }
      
      if (citizenId) {
        query += ` AND a.citizenid = $${paramIndex}`;
        queryParams.push(citizenId);
        paramIndex++;
      }
      
      if (searchTerm) {
        query += ` AND (
          a.title ILIKE $${paramIndex} OR 
          a.description ILIKE $${paramIndex} OR 
          c.fullname ILIKE $${paramIndex}
        )`;
        queryParams.push(`%${searchTerm}%`);
        paramIndex++;
      }
      
      if (startDate) {
        query += ` AND a.submissiondate >= $${paramIndex}`;
        queryParams.push(startDate);
        paramIndex++;
      }
      
      if (endDate) {
        query += ` AND a.submissiondate <= $${paramIndex}`;
        queryParams.push(endDate);
        paramIndex++;
      }
      
      if (isOverdue !== undefined) {
        query += ` AND a.isoverdue = $${paramIndex}`;
        queryParams.push(isOverdue === 'true');
        paramIndex++;
      }
      
      // Add sorting
      const validSortColumns = ['submissiondate', 'duedate', 'lastupdated', 'title', 'status'];
      const validSortOrders = ['ASC', 'DESC'];
      
      const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'submissiondate';
      const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
      
      query += ` ORDER BY a.${finalSortBy} ${finalSortOrder}`;
      
      // Add pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(parseInt(limit), offset);
      
      // Execute the query
      const result = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) 
        FROM applications a
        LEFT JOIN citizens c ON a.citizenid = c.citizenid
        WHERE 1=1
      `;
      
      // Reuse the same WHERE conditions but without ORDER BY, LIMIT, and OFFSET
      const countParams = queryParams.slice(0, -2);
      let countParamIndex = 1;
      
      if (role !== 'admin') {
        countQuery += ` AND a.agencyid = $${countParamIndex}`;
        countParamIndex++;
      }
      
      if (status) {
        countQuery += ` AND a.status = $${countParamIndex}`;
        countParamIndex++;
      }
      
      if (applicationTypeId) {
        countQuery += ` AND a.applicationtypeid = $${countParamIndex}`;
        countParamIndex++;
      }
      
      if (specialApplicationTypeId) {
        countQuery += ` AND a.specialapplicationtypeid = $${countParamIndex}`;
        countParamIndex++;
      }
      
      if (citizenId) {
        countQuery += ` AND a.citizenid = $${countParamIndex}`;
        countParamIndex++;
      }
      
      if (searchTerm) {
        countQuery += ` AND (
          a.title ILIKE $${countParamIndex} OR 
          a.description ILIKE $${countParamIndex} OR 
          c.fullname ILIKE $${countParamIndex}
        )`;
        countParamIndex++;
      }
      
      if (startDate) {
        countQuery += ` AND a.submissiondate >= $${countParamIndex}`;
        countParamIndex++;
      }
      
      if (endDate) {
        countQuery += ` AND a.submissiondate <= $${countParamIndex}`;
        countParamIndex++;
      }
      
      if (isOverdue !== undefined) {
        countQuery += ` AND a.isoverdue = $${countParamIndex}`;
        countParamIndex++;
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalCount / parseInt(limit));
      
      res.status(200).json({
        status: 'success',
        count: result.rows.length,
        totalCount,
        totalPages,
        currentPage: parseInt(page),
        data: result.rows,
        filters: {
          status,
          applicationTypeId,
          specialApplicationTypeId,
          citizenId,
          searchTerm,
          startDate,
          endDate,
          isOverdue
        },
        sorting: {
          sortBy: finalSortBy,
          sortOrder: finalSortOrder
        }
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to search applications' 
      });
    }
  },

  // GET ALL APPLICATIONS FOR STAFF (including forwarded applications)
  getAllApplicationsForStaff: async (req, res) => {
    try {
      console.log(`[getAllApplicationsForStaff] Request received from user ID: ${req.userId}`);
      
      // Get the staff's agency ID and role
      const staffResult = await pool.query(
        'SELECT staffid, agencyid, role FROM staff WHERE staffid = $1',
        [req.userId]
      );
      
      if (staffResult.rows.length === 0) {
        console.log(`[getAllApplicationsForStaff] Staff not found for user ID: ${req.userId}`);
        return res.status(404).json({ 
          status: 'error',
          message: 'Staff not found' 
        });
      }
      
      const { agencyid, role } = staffResult.rows[0];
      console.log(`[getAllApplicationsForStaff] Staff found: Agency=${agencyid}, Role=${role}`);
      
      // Check if we have cached results
      const redisKey = `all_applications_staff_${req.userId}`;
      let cached;
      try {
        cached = await redisClient.get(redisKey);
      } catch (redisError) {
        console.error('[getAllApplicationsForStaff] Redis error:', redisError);
        // Continue without cache if Redis has an issue
      }
      
      if (cached) {
        console.log(`[getAllApplicationsForStaff] Returning cached results for user ${req.userId}`);
        return res.status(200).json(JSON.parse(cached));
      }
      
      // Construct base query - SIMPLIFIED: only include applications assigned to this agency
      let query = `
        SELECT a.*, 
          at.typename as applicationtypename, 
          sat.typename as specialapplicationtypename,
          c.fullname as citizenname,
          (SELECT agencyname FROM agencies WHERE agencyid = a.agencyid) as agencyname
        FROM applications a
        LEFT JOIN applicationtypes at ON a.applicationtypeid = at.applicationtypeid
        LEFT JOIN specialapplicationtypes sat ON a.specialapplicationtypeid = sat.specialapplicationtypeid
        LEFT JOIN citizens c ON a.citizenid = c.citizenid
      `;
      
      const params = [];
      
      // If not admin, limit results to applications that are currently assigned to their agency
      if (role !== 'admin') {
        query += ` WHERE a.agencyid = $1`;
        params.push(agencyid);
      }
      
      query += ` ORDER BY a.submissiondate DESC`;
      
      console.log(`[getAllApplicationsForStaff] Executing simple query with params: ${params.join(', ')}`);
      const result = await pool.query(query, params);
      console.log(`[getAllApplicationsForStaff] Query returned ${result.rows.length} applications`);
      
      // Cache results for 2 minutes
      try {
        await redisClient.set(redisKey, JSON.stringify({
          status: 'success',
          data: result.rows
        }), { EX: 120 });
      } catch (redisError) {
        console.error('[getAllApplicationsForStaff] Redis caching error:', redisError);
        // Continue without caching if Redis has an issue
      }
      
      res.status(200).json({
        status: 'success',
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching all applications for staff:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to fetch applications',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // GET STAFF DASHBOARD DATA
  getStaffDashboardData: async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ 
          status: 'error',
          message: 'Authentication failed - no user ID found'
        });
      }
      
      // Get the staff's agency ID
      const staffResult = await pool.query(
        'SELECT agencyid, role, fullname FROM staff WHERE staffid = $1',
        [req.userId]
      );
      
      if (staffResult.rows.length === 0) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Staff not found',
          userId: req.userId
        });
      }
      
      const { agencyid, role, fullname } = staffResult.rows[0];
      
      // Check if agencyId is null or undefined
      if (!agencyid) {
        return res.status(400).json({
          status: 'error',
          message: 'Staff does not have an agency assigned',
          staffId: req.userId
        });
      }

      // Check if we have cached results for this agency's dashboard
      const redisKey = `dashboard_agency_${agencyid}_staff_${req.userId}`;
      let cached;
      try {
        cached = await redisClient.get(redisKey);
        if (cached) {
          const parsedData = JSON.parse(cached);
          return res.status(200).json({
            status: 'success',
            data: parsedData
          });
        }
      } catch (redisError) {
        console.error('Redis error:', redisError);
        // Continue without cache on Redis error
      }
      
      // Get today's date for today's submissions
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      // Format dates for PostgreSQL
      const todayStartFormatted = todayStart.toISOString().split('T')[0];
      const todayEndFormatted = todayEnd.toISOString().split('T')[0];
      
      // Get all statistics in a single query
      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status IN ('Submitted', 'pending', 'in_review') THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN submissiondate >= $1 AND submissiondate < $2 THEN 1 ELSE 0 END) as today,
          SUM(CASE WHEN isoverdue = true THEN 1 ELSE 0 END) as overdue
        FROM applications
        WHERE agencyid = $3;
      `;
      
      const statsResult = await pool.query(statsQuery, [todayStartFormatted, todayEndFormatted, agencyid]);
      
      // Get pending applications for this agency
      const applicationsQuery = `
        SELECT a.*, 
          at.typename as applicationtypename, 
          sat.typename as specialapplicationtypename,
          c.fullname as citizenname,
          ag.agencyname as agencyname
        FROM applications a
        LEFT JOIN applicationtypes at ON a.applicationtypeid = at.applicationtypeid
        LEFT JOIN specialapplicationtypes sat ON a.specialapplicationtypeid = sat.specialapplicationtypeid
        LEFT JOIN citizens c ON a.citizenid = c.citizenid
        LEFT JOIN agencies ag ON a.agencyid = ag.agencyid
        WHERE a.agencyid = $1
        AND (LOWER(a.status) IN ('submitted', 'pending', 'in_review'))
        ORDER BY 
          CASE WHEN a.isoverdue = true THEN 0 ELSE 1 END,
          a.duedate ASC,
          a.submissiondate DESC
        LIMIT 20;
      `;
      
      const applicationsResult = await pool.query(applicationsQuery, [agencyid]);
      
      // Get recent processing history for analytics
      const processingHistoryQuery = `
        SELECT ph.*, a.title as application_title
        FROM processinghistory ph
        JOIN applications a ON ph.applicationid = a.applicationid
        WHERE ph.staffid = $1
        ORDER BY ph.actiondate DESC
        LIMIT 10;
      `;
      
      const processingHistoryResult = await pool.query(processingHistoryQuery, [req.userId]);
      
      // Get staff performance metrics
      const performanceQuery = `
        SELECT 
          COUNT(*) as processed_applications,
          AVG(EXTRACT(DAY FROM (ph.actiondate - a.submissiondate))) as avg_processing_time
        FROM processinghistory ph
        JOIN applications a ON ph.applicationid = a.applicationid
        WHERE ph.staffid = $1
        AND ph.actiondate >= NOW() - INTERVAL '30 days';
      `;
      
      const performanceResult = await pool.query(performanceQuery, [req.userId]);
      
      // Calculate efficiency based on average processing time compared to the agency average
      const agencyAvgQuery = `
        SELECT 
          AVG(EXTRACT(DAY FROM (ph.actiondate - a.submissiondate))) as agency_avg_time
        FROM processinghistory ph
        JOIN applications a ON ph.applicationid = a.applicationid
        JOIN staff s ON ph.staffid = s.staffid
        WHERE s.agencyid = $1
        AND ph.actiondate >= NOW() - INTERVAL '30 days';
      `;
      
      const agencyAvgResult = await pool.query(agencyAvgQuery, [agencyid]);
      
      const staffAvgTime = parseFloat(performanceResult.rows[0]?.avg_processing_time || 0);
      const agencyAvgTime = parseFloat(agencyAvgResult.rows[0]?.agency_avg_time || 0);
      
      // Higher efficiency if staff is faster than agency average
      let efficiency = 50; // Default medium efficiency
      if (agencyAvgTime > 0) {
        if (staffAvgTime <= agencyAvgTime) {
          // Staff is faster than agency average
          efficiency = 80 - (staffAvgTime / agencyAvgTime * 20);
        } else {
          // Staff is slower than agency average
          efficiency = 60 - (staffAvgTime / agencyAvgTime * 20);
        }
        // Keep efficiency between 0-100
        efficiency = Math.max(0, Math.min(100, efficiency));
      }
      
      // Generate daily tasks based on current applications and statistics
      const dailyTasks = [];
      
      // Lấy ngày hôm nay để tính số hồ sơ đã xử lý ngày hôm nay
      const todayStr = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      // Đếm số hồ sơ đã xử lý trong ngày hôm nay
      const todayProcessedQuery = `
        SELECT COUNT(*) as processed_today
        FROM processinghistory
        WHERE staffid = $1
        AND DATE(actiondate) = $2;
      `;
      
      const todayProcessedResult = await pool.query(todayProcessedQuery, [req.userId, todayStr]);
      const todayProcessed = parseInt(todayProcessedResult.rows[0]?.processed_today || 0);
      
      // Đếm chính xác số đơn mới được nộp HOẶC có hạn xử lý là hôm nay
      const actualTodayApplicationsQuery = `
        SELECT COUNT(*) as actual_today_count
        FROM applications
        WHERE agencyid = $1
        AND (LOWER(status) IN ('submitted', 'pending', 'in_review'))
        AND (
          (DATE(submissiondate) = $2) OR 
          (DATE(duedate) = $2)
        );
      `;
      
      const actualTodayApplicationsResult = await pool.query(actualTodayApplicationsQuery, [agencyid, todayStr]);
      const actualTodayCount = parseInt(actualTodayApplicationsResult.rows[0]?.actual_today_count || 0);
      
      // Truy vấn đơn cần xử lý hôm nay (CHỈ những đơn mới nộp hoặc có hạn là NGÀY HÔM NAY)
      const todaysTasksQuery = `
        SELECT a.*, 
          at.typename as applicationtypename, 
          sat.typename as specialapplicationtypename,
          c.fullname as citizenname
        FROM applications a
        LEFT JOIN applicationtypes at ON a.applicationtypeid = at.applicationtypeid
        LEFT JOIN specialapplicationtypes sat ON a.specialapplicationtypeid = sat.specialapplicationtypeid
        LEFT JOIN citizens c ON a.citizenid = c.citizenid
        WHERE a.agencyid = $1
        AND (a.status = 'Submitted' OR LOWER(a.status) IN ('pending', 'in_review'))
        AND (
          (DATE(a.submissiondate) = $2) OR
          (DATE(a.duedate) = $2)
        )
        ORDER BY 
          a.duedate ASC,
          a.submissiondate DESC
        LIMIT 10;
      `;
      
      const todaysTasksResult = await pool.query(todaysTasksQuery, [agencyid, todayStr]);
      const todaysTasksCount = todaysTasksResult.rows.length;
      
      // Task 1: Xử lý các đơn thực sự của ngày hôm nay (mới nộp hoặc đến hạn hôm nay)
      dailyTasks.push({
        taskId: 1,
        title: 'Xử lý các đơn mới nộp hoặc đến hạn hôm nay',
        status: todayProcessed >= actualTodayCount ? 'completed' : actualTodayCount > 0 ? 'in-progress' : 'completed',
        progress: actualTodayCount > 0 ? (todayProcessed / actualTodayCount) * 100 : 100,
        target: actualTodayCount > 0 ? actualTodayCount : 1,
        current: Math.min(todayProcessed, actualTodayCount > 0 ? actualTodayCount : 1)
      });
      
      // Task 2: Handle overdue applications
      const overdueAppsTarget = 3;
      const overdueCount = parseInt(statsResult.rows[0]?.overdue || 0);
      const overdueStatus = overdueCount === 0 ? 'completed' : 'priority';
      
      dailyTasks.push({
        taskId: 2,
        title: 'Xử lý hồ sơ quá hạn',
        status: overdueStatus,
        progress: overdueCount === 0 ? 100 : 0,
        target: overdueAppsTarget,
        current: Math.min(overdueAppsTarget - overdueCount, overdueAppsTarget)
      });
      
      // Task 3: Review pending applications
      const pendingReviewTarget = 5;
      const pendingReviewProgress = (processingHistoryResult.rows.length / pendingReviewTarget) * 100;
      
      dailyTasks.push({
        taskId: 3,
        title: 'Xem xét hồ sơ đang chờ',
        status: pendingReviewProgress >= 100 ? 'completed' : 'in-progress',
        progress: pendingReviewProgress,
        target: pendingReviewTarget,
        current: Math.min(processingHistoryResult.rows.length, pendingReviewTarget)
      });
      
      // Combine all data
      const dashboardData = {
        stats: statsResult.rows[0] || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          today: 0,
          overdue: 0
        },
        applications: applicationsResult.rows || [],
        recentActivity: processingHistoryResult.rows || [],
        dailyTasks: dailyTasks,
        todaysTasks: todaysTasksResult.rows || [], // Danh sách đơn cần xử lý hôm nay theo định nghĩa mới
        performance: {
          avgProcessingTime: parseFloat(performanceResult.rows[0]?.avg_processing_time || 0),
          processedApplications: parseInt(performanceResult.rows[0]?.processed_applications || 0),
          efficiency: efficiency
        },
        staffInfo: {
          id: req.userId,
          name: fullname,
          role: role,
          agencyId: agencyid
        }
      };
      
      // Cache the dashboard data
      try {
        await redisClient.set(redisKey, JSON.stringify(dashboardData), { EX: 300 }); // Cache for 5 minutes
      } catch (redisCacheError) {
        console.error('Redis cache error:', redisCacheError);
        // Continue without caching
      }
      
      return res.status(200).json({
        status: 'success',
        data: dashboardData
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch dashboard data',
        error: error.message
      });
    }
  }
};

module.exports = applicationsController;
