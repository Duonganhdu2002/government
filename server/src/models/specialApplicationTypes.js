/**
 * specialApplicationTypes.js
 * 
 * Sequelize model for the 'SpecialApplicationTypes' table
 * Defines structure for special application types with processing time limits
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * SpecialApplicationType Model
 * Represents specialized application types with specific processing time limits
 */
const SpecialApplicationType = sequelize.define(
  'SpecialApplicationType',
  {
    SpecialApplicationTypeID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Unique identifier for the special application type'
    },
    ApplicationTypeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ApplicationTypes',
        key: 'ApplicationTypeID'
      },
      comment: 'Reference to the parent application type'
    },
    TypeName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Name of the special application type'
    },
    ProcessingTimeLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Processing time limit in days'
    }
  },
  {
    tableName: 'SpecialApplicationTypes',
    timestamps: false
  }
);

// Define associations
SpecialApplicationType.associate = (models) => {
  SpecialApplicationType.belongsTo(models.ApplicationType, {
    foreignKey: 'ApplicationTypeID',
    targetKey: 'ApplicationTypeID'
  });
};

module.exports = SpecialApplicationType; 