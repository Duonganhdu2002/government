// models/agencies.js
// This model represents the 'agencies' table.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Agency = sequelize.define('Agency', {
  agencyid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  agencyname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
  },
  phonenumber: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  specializedfields: {
    type: DataTypes.TEXT,
  },
  areacode: {
    type: DataTypes.INTEGER,
  }
}, {
  tableName: 'agencies',
  timestamps: false,
});

module.exports = Agency;
