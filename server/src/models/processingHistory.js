// models/processingHistory.js
// This model represents the 'ProcessingHistory' table,
// which tracks the processing actions performed on applications.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProcessingHistory = sequelize.define('ProcessingHistory', {
  HistoryID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  ApplicationID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  StaffID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ActionTaken: {
    type: DataTypes.STRING,
  },
  ActionDate: {
    type: DataTypes.DATE,
  },
  Notes: {
    type: DataTypes.TEXT,
  },
  IsDelayed: {
    type: DataTypes.BOOLEAN,
  }
}, {
  tableName: 'ProcessingHistory',
  timestamps: false,
});

module.exports = ProcessingHistory;
