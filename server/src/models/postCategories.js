// models/postCategories.js
// This model represents the 'postcategories' table.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostCategory = sequelize.define('PostCategory', {
  categoryid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  categoryname: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'postcategories',
  timestamps: false
});

module.exports = PostCategory;
