// models/agencies.js
// This model represents the 'Agencies' table.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Agency = sequelize.define('Agency', {
  AgencyID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  AgencyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Address: {
    type: DataTypes.STRING,
  },
  PhoneNumber: {
    type: DataTypes.STRING,
  },
  Email: {
    type: DataTypes.STRING,
  },
  SpecializedFields: {
    type: DataTypes.TEXT,
  },
  AreaCode: {
    type: DataTypes.INTEGER,
  }
}, {
  tableName: 'Agencies',
  timestamps: false,
});

module.exports = Agency;
