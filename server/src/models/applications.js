// models/applications.js
// This model represents the 'applications' table.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Application = sequelize.define('Application', {
  applicationid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  citizenid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  applicationtypeid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  specialapplicationtypeid: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  submissiondate: {
    type: DataTypes.DATEONLY,
  },
  status: {
    type: DataTypes.STRING,
  },
  currentagencyid: {
    type: DataTypes.INTEGER,
  },
  lastupdated: {
    type: DataTypes.DATE,
  },
  duedate: {
    type: DataTypes.DATEONLY,
  },
  isoverdue: {
    type: DataTypes.BOOLEAN,
  },
  hasmedia: {
    type: DataTypes.BOOLEAN,
  },
  eventdate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(500),
    allowNull: true,
  }
}, {
  tableName: 'applications',
  timestamps: false,
});

module.exports = Application;
