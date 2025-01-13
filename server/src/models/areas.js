const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Area = sequelize.define('Area', {
  AreaCode: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  AreaName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ParentAreaCode: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Areas', 
      key: 'AreaCode',
    },
    allowNull: true,
  },
});

module.exports = Area;
