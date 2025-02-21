// models/areas.js
// This model represents the 'Areas' table.
// Each area can have a parent area (self-referencing relationship).

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Area = sequelize.define('Area', {
  AreaCode: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  AreaName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ParentAreaCode: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  tableName: 'Areas',
  timestamps: false, 
});

module.exports = Area;
