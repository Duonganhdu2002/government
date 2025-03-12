// debug controller to help diagnose API issues
const pool = require('../config/database');

const debugController = {
  // Get staff information for debugging
  getStaffDebugInfo: async (req, res) => {
    try {
      // Get the user ID from the request
      const userId = req.userId;
      
      if (!userId) {
        return res.status(400).json({
          status: 'error',
          message: 'No user ID found in request'
        });
      }
      
      // Query staff details
      const staffResult = await pool.query(
        'SELECT staffid, agencyid, role, fullname, email FROM staff WHERE staffid = $1',
        [userId]
      );
      
      if (staffResult.rows.length === 0) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Staff not found',
          requestUserId: userId
        });
      }
      
      const staffInfo = staffResult.rows[0];
      
      // Get agency information if agencyid exists
      let agencyInfo = null;
      if (staffInfo.agencyid) {
        const agencyResult = await pool.query(
          'SELECT * FROM agencies WHERE agencyid = $1',
          [staffInfo.agencyid]
        );
        
        if (agencyResult.rows.length > 0) {
          agencyInfo = agencyResult.rows[0];
        }
      }
      
      // Return results
      res.status(200).json({
        status: 'success',
        data: {
          staff: staffInfo,
          agency: agencyInfo
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error retrieving staff debug info',
        error: error.message
      });
    }
  },
  
  // Test the pending applications query
  testPendingApplicationsQuery: async (req, res) => {
    try {
      // Get the user ID from the request
      const userId = req.userId;
      
      if (!userId) {
        return res.status(400).json({
          status: 'error',
          message: 'No user ID found in request'
        });
      }
      
      // First, get the staff's agency ID
      const staffResult = await pool.query(
        'SELECT agencyid, role FROM staff WHERE staffid = $1',
        [userId]
      );
      
      if (staffResult.rows.length === 0) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Staff not found',
          requestUserId: userId
        });
      }
      
      const { agencyid, role } = staffResult.rows[0];
      
      if (!agencyid) {
        return res.status(400).json({
          status: 'error',
          message: 'Staff does not have an agency ID assigned',
          staffRecord: staffResult.rows[0]
        });
      }
      
      // Try running the simplified version of the query
      const result = await pool.query(
        `SELECT COUNT(*) FROM applications 
         WHERE agencyid = $1 
         AND (status = 'Submitted' OR LOWER(status) IN ('pending', 'in_review'))`,
        [agencyid]
      );
      
      // Return results
      res.status(200).json({
        status: 'success',
        debug: {
          staffId: userId,
          agencyId: agencyid,
          role: role,
          queryResult: result.rows[0],
          fullQuery: `SELECT COUNT(*) FROM applications WHERE agencyid = ${agencyid} AND (status = 'Submitted' OR LOWER(status) IN ('pending', 'in_review'))`
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error testing pending applications query',
        error: error.message
      });
    }
  },

  // Get direct applications data for debugging
  getApplicationsDebugData: async (req, res) => {
    try {
      // Get the user ID from the request
      const userId = req.userId;
      
      if (!userId) {
        return res.status(400).json({
          status: 'error',
          message: 'No user ID found in request'
        });
      }
      
      // First, get the staff's agency ID
      const staffResult = await pool.query(
        'SELECT staffid, agencyid, role, fullname FROM staff WHERE staffid = $1',
        [userId]
      );
      
      if (staffResult.rows.length === 0) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Staff not found',
          requestUserId: userId
        });
      }
      
      const { staffid, agencyid, role, fullname } = staffResult.rows[0];
      
      // Get all agencies for reference
      const agenciesResult = await pool.query('SELECT agencyid, agencyname FROM agencies');
      
      // Get applications data
      const applicationsResult = await pool.query(
        `SELECT applicationid, agencyid, status FROM applications
         ORDER BY submissiondate DESC
         LIMIT 20`
      );
      
      // Return results
      res.status(200).json({
        status: 'success',
        debug: {
          staff: {
            staffId: staffid,
            fullName: fullname,
            agencyId: agencyid,
            role: role
          },
          agencies: agenciesResult.rows,
          applications: applicationsResult.rows,
          filterTest: {
            agencyMatches: applicationsResult.rows.filter(app => app.agencyid === agencyid).length,
            statusMatches: applicationsResult.rows.filter(app => 
              app.status === 'Submitted' || 
              app.status.toLowerCase() === 'pending' || 
              app.status.toLowerCase() === 'in_review'
            ).length,
            fullMatchCount: applicationsResult.rows.filter(app => 
              app.agencyid === agencyid && 
              (app.status === 'Submitted' || 
               app.status.toLowerCase() === 'pending' || 
               app.status.toLowerCase() === 'in_review')
            ).length
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error getting applications debug data',
        error: error.message
      });
    }
  }
};

module.exports = debugController; 