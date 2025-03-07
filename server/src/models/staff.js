// models/staff.js
// This model represents the 'staff' table.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Staff = sequelize.define('Staff', {
  staffid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  agencyid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employeecode: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.STRING,
  },
  username: {
    type: DataTypes.STRING,
  },
  passwordhash: {
    type: DataTypes.STRING,
  }
}, {
  tableName: 'staff',
  timestamps: false,
});

module.exports = Staff;
