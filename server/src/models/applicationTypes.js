// models/applicationTypes.js
// This model represents the 'ApplicationTypes' table.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ApplicationType = sequelize.define('ApplicationType', {
  ApplicationTypeID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  TypeName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Description: {
    type: DataTypes.TEXT,
  },
  ProcessingTimeLimit: {
    type: DataTypes.INTEGER,
  }
}, {
  tableName: 'ApplicationTypes',
  timestamps: false,
});

module.exports = ApplicationType;
