// models/publicNotifications.js
// This model represents the 'PublicNotifications' table,
// used for broadcasting notifications to the public by agencies.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PublicNotification = sequelize.define('PublicNotification', {
  NotificationID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  AgencyID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Content: {
    type: DataTypes.TEXT,
  },
  TargetArea: {
    type: DataTypes.INTEGER,
  },
  SentDate: {
    type: DataTypes.DATE,
  }
}, {
  tableName: 'PublicNotifications',
  timestamps: false,
});

module.exports = PublicNotification;
