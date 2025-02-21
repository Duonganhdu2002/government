// models/agencyDelays.js
// This model represents the 'AgencyDelays' table,
// which logs any delays incurred by agencies in processing applications.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AgencyDelay = sequelize.define('AgencyDelay', {
  DelayID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  AgencyID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ApplicationID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  DelayDuration: {
    type: DataTypes.INTEGER,
  },
  Reason: {
    type: DataTypes.TEXT,
  },
  RecordedDate: {
    type: DataTypes.DATE,
  }
}, {
  tableName: 'AgencyDelays',
  timestamps: false,
});

module.exports = AgencyDelay;
