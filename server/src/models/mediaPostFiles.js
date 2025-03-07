/**
 * mediaPostFiles.js
 * 
 * Sequelize model for the 'MediaPostFiles' table
 * Defines structure for media files associated with posts
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * MediaPostFile Model
 * Represents media files (images, documents, etc.) associated with posts
 */
const MediaPostFile = sequelize.define(
  'MediaPostFile',
  {
    MediaPostFileID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Unique identifier for the media post file'
    },
    PostID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Posts',
        key: 'PostID'
      },
      comment: 'Reference to the associated post'
    },
    FileType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Type of the file (image, document, video, etc.)'
    },
    FilePath: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Path to the stored file'
    },
    FileSize: {
      type: DataTypes.INTEGER,
      comment: 'Size of the file in bytes'
    },
    UploadDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the file was uploaded'
    }
  },
  {
    tableName: 'MediaPostFiles',
    timestamps: false
  }
);

// Define associations
MediaPostFile.associate = (models) => {
  MediaPostFile.belongsTo(models.Post, {
    foreignKey: 'PostID',
    targetKey: 'PostID'
  });
};

module.exports = MediaPostFile; 