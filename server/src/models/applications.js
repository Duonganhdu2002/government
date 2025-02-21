// models/applications.js
// This model represents the 'Applications' table.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Application = sequelize.define('Application', {
  ApplicationID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  CitizenID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ApplicationTypeID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Description: {
    type: DataTypes.TEXT,
  },
  SubmissionDate: {
    type: DataTypes.DATEONLY,
  },
  Status: {
    type: DataTypes.STRING,
  },
  CurrentAgencyID: {
    type: DataTypes.INTEGER,
  },
  LastUpdated: {
    type: DataTypes.DATE,
  },
  DueDate: {
    type: DataTypes.DATEONLY,
  },
  IsOverdue: {
    type: DataTypes.BOOLEAN,
  },
  HasMedia: {
    type: DataTypes.BOOLEAN,
  }
}, {
  tableName: 'Applications',
  timestamps: false,
});

module.exports = Application;
