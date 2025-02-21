// models/staff.js
// This model represents the 'Staff' table.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Staff = sequelize.define('Staff', {
  StaffID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  AgencyID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  FullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  EmployeeCode: {
    type: DataTypes.STRING,
  },
  Role: {
    type: DataTypes.STRING,
  },
  Username: {
    type: DataTypes.STRING,
  },
  PasswordHash: {
    type: DataTypes.STRING,
  }
}, {
  tableName: 'Staff',
  timestamps: false,
});

module.exports = Staff;
