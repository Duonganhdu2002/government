// models/postCategories.js
// This model represents the 'post_categories' table.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostCategory = sequelize.define('PostCategory', {
  category_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'post_categories',
  timestamps: false
});

module.exports = PostCategory;
