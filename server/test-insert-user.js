/**
 * test-insert-user.js
 * 
 * Script to create a test user for login testing
 */

const bcrypt = require('bcrypt');
const pool = require('./src/config/database');

const SALT_ROUNDS = 10;

async function createTestUser() {
  try {
    // Generate hashed password for '1010101'
    const passwordHash = await bcrypt.hash('1010101', SALT_ROUNDS);
    
    // Check if staff with ID 2 exists
    const checkResult = await pool.query('SELECT staffid FROM staff WHERE staffid = 2');
    
    if (checkResult.rows.length > 0) {
      // Update existing staff
      const updateResult = await pool.query(
        `UPDATE staff 
         SET passwordhash = $1
         WHERE staffid = 2
         RETURNING staffid, fullname, role`,
        [passwordHash]
      );
      console.log('Updated existing test user:', updateResult.rows[0]);
    } else {
      // Insert new staff
      const insertResult = await pool.query(
        `INSERT INTO staff (staffid, agencyid, fullname, employeecode, role, username, passwordhash)
         VALUES (2, 1, 'Test User', 'TEST001', 'staff', 'testuser', $1)
         RETURNING staffid, fullname, role`,
        [passwordHash]
      );
      console.log('Created new test user:', insertResult.rows[0]);
    }
    
    console.log('Test user ready. You can login with:');
    console.log('- Staff ID: 2');
    console.log('- Password: 1010101');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    pool.end();
  }
}

createTestUser(); 