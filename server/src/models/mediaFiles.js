// models/mediaFiles.js
// This model represents the 'MediaFiles' table,
// which stores media files associated with applications.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MediaFile = sequelize.define('MediaFile', {
  MediaFileID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  ApplicationID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  FileType: {
    type: DataTypes.STRING,
  },
  FilePath: {
    type: DataTypes.STRING,
  },
  FileSize: {
    type: DataTypes.INTEGER,
  },
  UploadDate: {
    type: DataTypes.DATE,
  }
}, {
  tableName: 'MediaFiles',
  timestamps: false,
});

module.exports = MediaFile;
