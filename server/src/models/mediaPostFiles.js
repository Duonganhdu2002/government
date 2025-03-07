/**
 * mediaPostFiles.js
 * 
 * Sequelize model for the 'mediapostfiles' table
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
    mediapostfileid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Unique identifier for the media post file'
    },
    postid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'postid'
      },
      comment: 'Reference to the associated post'
    },
    filetype: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Type of the file (image, document, video, etc.)'
    },
    filepath: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Path to the stored file'
    },
    filesize: {
      type: DataTypes.INTEGER,
      comment: 'Size of the file in bytes'
    },
    uploaddate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when the file was uploaded'
    }
  },
  {
    tableName: 'mediapostfiles',
    timestamps: false
  }
);

// Define associations
MediaPostFile.associate = (models) => {
  MediaPostFile.belongsTo(models.Post, {
    foreignKey: 'postid',
    targetKey: 'postid'
  });
};

module.exports = MediaPostFile; 