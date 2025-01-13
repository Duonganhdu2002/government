const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const Citizen = sequelize.define('Citizen', {
  CitizenID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  FullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  IdentificationNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  Address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  PhoneNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  Email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  Username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  PasswordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  AreaCode: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Areas',
      key: 'AreaCode',
    },
  },
});

module.exports = Citizen;
