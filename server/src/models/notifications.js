// models/notifications.js
// This model represents the 'notifications' table.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  notificationid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  citizenid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  applicationid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
  },
  notificationtype: {
    type: DataTypes.STRING,
  },
  sentdate: {
    type: DataTypes.DATE,
  }
}, {
  tableName: 'notifications',
  timestamps: false,
});

module.exports = Notification;
