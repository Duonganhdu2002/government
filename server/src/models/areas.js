// models/areas.js
// This model represents the 'areas' table.
// Each area can have a parent area (self-referencing relationship).

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Area = sequelize.define('Area', {
  areacode: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  areaname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parentareacode: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'areas',
  timestamps: false, 
});

module.exports = Area;
