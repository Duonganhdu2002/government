/**
 * specialApplicationTypes.js
 * 
 * Sequelize model for the 'specialapplicationtypes' table
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
    specialapplicationtypeid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Unique identifier for the special application type'
    },
    applicationtypeid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'applicationtypes',
        key: 'applicationtypeid'
      },
      comment: 'Reference to the parent application type'
    },
    typename: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Name of the special application type'
    },
    processingtimelimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Processing time limit in days'
    }
  },
  {
    tableName: 'specialapplicationtypes',
    timestamps: false
  }
);

// Define associations
SpecialApplicationType.associate = (models) => {
  SpecialApplicationType.belongsTo(models.ApplicationType, {
    foreignKey: 'applicationtypeid',
    targetKey: 'applicationtypeid'
  });
};

module.exports = SpecialApplicationType; 