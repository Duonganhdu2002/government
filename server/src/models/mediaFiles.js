// models/mediaFiles.js
// This model represents the 'mediafiles' table,
// which stores media files associated with applications.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MediaFile = sequelize.define('MediaFile', {
  mediafileid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  applicationid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  filetype: {
    type: DataTypes.STRING,
  },
  filepath: {
    type: DataTypes.STRING,
  },
  filesize: {
    type: DataTypes.INTEGER,
  },
  uploaddate: {
    type: DataTypes.DATE,
  }
}, {
  tableName: 'mediafiles',
  timestamps: false,
});

module.exports = MediaFile;
