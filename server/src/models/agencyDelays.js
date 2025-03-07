// models/agencyDelays.js
// This model represents the 'agencydelays' table,
// which logs any delays incurred by agencies in processing applications.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AgencyDelay = sequelize.define('AgencyDelay', {
  delayid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  agencyid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  applicationid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  delayduration: {
    type: DataTypes.INTEGER,
  },
  reason: {
    type: DataTypes.TEXT,
  },
  recordeddate: {
    type: DataTypes.DATE,
  }
}, {
  tableName: 'agencydelays',
  timestamps: false,
});

module.exports = AgencyDelay;
