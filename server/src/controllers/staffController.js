// controllers/staffController.js
const pool = require('../config/database');
const redisClient = require('../config/redis');

const staffController = {
  // GET ALL STAFF (with Redis caching)
  getAllStaff: async (req, res) => {
    try {
      const cached = await redisClient.get('all_staff');
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query('SELECT * FROM staff;');
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No staff members found' });
      }
      await redisClient.set('all_staff', JSON.stringify(result.rows), { EX: 60 });
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching staff:', error.message);
      res.status(500).json({ error: 'Failed to fetch staff' });
    }
  },

  // GET STAFF BY ID (with Redis caching)
  getStaffById: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid staff ID' });
    }
    try {
      const redisKey = `staff_${id}`;
      const cached = await redisClient.get(redisKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      const result = await pool.query(
        'SELECT * FROM staff WHERE staffid = $1;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Staff member not found' });
      }
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching staff by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch staff member' });
    }
  },

  // CREATE STAFF
  createStaff: async (req, res) => {
    const { agencyid, fullname, role, passwordhash } = req.body;
    
    if (!agencyid || !fullname || !role || !passwordhash) {
      return res.status(400).json({ error: 'Missing required fields for staff creation' });
    }
    
    try {
      // Create new staff member
      const result = await pool.query(
        `INSERT INTO staff(agencyid, fullname, role, passwordhash)
         VALUES($1, $2, $3, $4) RETURNING *`,
        [agencyid, fullname, role, passwordhash]
      );
      
      await redisClient.del('all_staff');
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating staff:', error.message);
      res.status(500).json({ error: 'Failed to create staff member' });
    }
  },

  // UPDATE STAFF
  updateStaff: async (req, res) => {
    const { id } = req.params;
    const { agencyid, fullname, role, passwordhash } = req.body;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid staff ID' });
    }
    
    try {
      // Build update query dynamically based on provided fields
      let updateFields = [];
      let queryParams = [];
      let paramIndex = 1;
      
      if (agencyid !== undefined) {
        updateFields.push(`agencyid = $${paramIndex++}`);
        queryParams.push(agencyid);
      }
      
      if (fullname !== undefined) {
        updateFields.push(`fullname = $${paramIndex++}`);
        queryParams.push(fullname);
      }
      
      if (role !== undefined) {
        updateFields.push(`role = $${paramIndex++}`);
        queryParams.push(role);
      }
      
      if (passwordhash !== undefined) {
        updateFields.push(`passwordhash = $${paramIndex++}`);
        queryParams.push(passwordhash);
      }
      
      // If no fields to update
      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }
      
      // Add the ID parameter
      queryParams.push(id);
      
      const updateQuery = `
        UPDATE staff
        SET ${updateFields.join(', ')}
        WHERE staffid = $${paramIndex}
        RETURNING *;
      `;
      
      console.log('Update Query:', updateQuery);
      console.log('Query Params:', queryParams);
      
      const result = await pool.query(updateQuery, queryParams);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Staff member not found' });
      }
      
      await redisClient.del('all_staff');
      const redisKey = `staff_${id}`;
      await redisClient.set(redisKey, JSON.stringify(result.rows[0]), { EX: 60 });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating staff:', error.message);
      res.status(500).json({ error: 'Failed to update staff member' });
    }
  },

  // DELETE STAFF
  deleteStaff: async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid staff ID' });
    }
    try {
      const result = await pool.query(
        'DELETE FROM staff WHERE staffid = $1 RETURNING *;',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Staff member not found' });
      }
      await redisClient.del('all_staff');
      await redisClient.del(`staff_${id}`);
      res.status(200).json({ message: 'Staff deleted successfully' });
    } catch (error) {
      console.error('Error deleting staff:', error.message);
      res.status(500).json({ error: 'Failed to delete staff member' });
    }
  },

  // GET ADMIN DASHBOARD STATS
  getAdminDashboardStats: async (req, res) => {
    const { userId } = req.params;
    
    try {
      // Use Redis caching for dashboard stats
      const cacheKey = 'admin_dashboard_stats';
      const cachedStats = await redisClient.get(cacheKey);
      
      if (cachedStats && !userId) {
        return res.status(200).json(JSON.parse(cachedStats));
      }
      
      // Default stats với giá trị an toàn
      let totalStaff = 0;
      let totalApplications = 0;
      let totalAgencies = 0;
      
      try {
        // Get total staff count
        const staffCountQuery = await pool.query('SELECT COUNT(*) as total_staff FROM staff');
        totalStaff = parseInt(staffCountQuery.rows[0].total_staff) || 0;
      } catch (staffError) {
        console.error('Error counting staff:', staffError.message);
      }
      
      try {
        // Get total applications count
        const applicationsCountQuery = await pool.query('SELECT COUNT(*) as total_applications FROM applications');
        totalApplications = parseInt(applicationsCountQuery.rows[0].total_applications) || 0;
      } catch (appError) {
        console.error('Error counting applications:', appError.message);
      }
      
      try {
        // Get total agencies count - Sửa tên bảng từ agency thành agencies
        const agenciesCountQuery = await pool.query('SELECT COUNT(*) as total_agencies FROM agencies');
        totalAgencies = parseInt(agenciesCountQuery.rows[0].total_agencies) || 0;
      } catch (agencyError) {
        console.error('Error counting agencies:', agencyError.message);
      }
      
      // Stats object to return
      const stats = {
        totalStaff,
        totalApplications,
        totalAgencies
      };
      
      // Get user's last login info if userId is provided
      if (userId) {
        try {
          const lastLoginQuery = await pool.query(
            `SELECT login_time FROM staff_login_history 
             WHERE staffid = $1 
             ORDER BY login_time DESC 
             LIMIT 1`,
            [userId]
          );
          
          if (lastLoginQuery.rows.length > 0) {
            stats.lastLogin = lastLoginQuery.rows[0].login_time || new Date().toISOString();
          } else {
            // If no login history found, use current time
            stats.lastLogin = new Date().toISOString();
          }
        } catch (loginHistoryError) {
          console.error('Error fetching login history:', loginHistoryError.message);
          stats.lastLogin = new Date().toISOString();
        }
      }
      
      // Cache the stats (without user-specific data)
      if (!userId) {
        await redisClient.set(cacheKey, JSON.stringify(stats), { EX: 300 }); // Cache for 5 minutes
      }
      
      return res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error.message);
      
      // Return fallback data even on error
      return res.status(200).json({ 
        status: 'success',
        data: {
          totalStaff: 0,
          totalApplications: 0,
          totalAgencies: 0,
          lastLogin: new Date().toISOString()
        }
      });
    }
  },

  // GET STAFF LOGIN HISTORY
  getStaffLoginHistory: async (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid staff ID' });
    }
    
    try {
      // Check if the staff_login_history table exists
      const tableCheckQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'staff_login_history'
        );
      `;
      const tableCheck = await pool.query(tableCheckQuery);
      
      if (!tableCheck.rows[0].exists) {
        return res.status(200).json({ 
          status: 'success',
          data: {
            history: [],
            lastLogin: new Date().toISOString()
          }
        });
      }
      
      // Get login history for the staff member
      const result = await pool.query(
        `SELECT id, login_time, ip_address, user_agent
         FROM staff_login_history
         WHERE staffid = $1
         ORDER BY login_time DESC
         LIMIT 10;`,
        [id]
      );
      
      // Get the most recent login time
      const lastLoginResult = await pool.query(
        `SELECT login_time 
         FROM staff_login_history 
         WHERE staffid = $1 
         ORDER BY login_time DESC 
         LIMIT 1;`,
        [id]
      );
      
      const lastLogin = lastLoginResult.rows.length > 0 
        ? lastLoginResult.rows[0].login_time 
        : new Date().toISOString();
      
      return res.status(200).json({
        status: 'success',
        data: {
          history: result.rows,
          lastLogin
        }
      });
    } catch (error) {
      console.error('Error fetching staff login history:', error.message);
      return res.status(500).json({ 
        status: 'error',
        error: 'Failed to fetch staff login history',
        message: error.message
      });
    }
  }
};

module.exports = staffController;
