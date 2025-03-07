// models/publicNotifications.js
// This model represents the 'publicnotifications' table,
// used for broadcasting notifications to the public by agencies.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PublicNotification = sequelize.define('PublicNotification', {
  notificationid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  agencyid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
  },
  targetarea: {
    type: DataTypes.INTEGER,
  },
  sentdate: {
    type: DataTypes.DATE,
  }
}, {
  tableName: 'publicnotifications',
  timestamps: false,
});

module.exports = PublicNotification;
