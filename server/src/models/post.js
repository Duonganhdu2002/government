// models/post.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  PostID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  CategoryID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  Content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  UpdatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'Posts',
  timestamps: true, 
});

module.exports = Post;
