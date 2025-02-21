// models/notifications.js
// This model represents the 'Notifications' table.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  NotificationID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  CitizenID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ApplicationID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Content: {
    type: DataTypes.TEXT,
  },
  NotificationType: {
    type: DataTypes.STRING,
  },
  SentDate: {
    type: DataTypes.DATE,
  }
}, {
  tableName: 'Notifications',
  timestamps: false,
});

module.exports = Notification;
