// models/processingHistory.js
// This model represents the 'processinghistory' table,
// which tracks the processing actions performed on applications.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProcessingHistory = sequelize.define('ProcessingHistory', {
  historyid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  applicationid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  staffid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  actiontaken: {
    type: DataTypes.STRING,
  },
  actiondate: {
    type: DataTypes.DATE,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  isdelayed: {
    type: DataTypes.BOOLEAN,
  }
}, {
  tableName: 'processinghistory',
  timestamps: false,
});

module.exports = ProcessingHistory;
