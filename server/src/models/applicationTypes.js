// models/applicationTypes.js
// This model represents the 'applicationtypes' table.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ApplicationType = sequelize.define('ApplicationType', {
  applicationtypeid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  typename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  processingtimelimit: {
    type: DataTypes.INTEGER,
  }
}, {
  tableName: 'applicationtypes',
  timestamps: false,
});

module.exports = ApplicationType;
