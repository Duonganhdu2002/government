/**
 * citizen.js
 * 
 * Sequelize model for the 'Citizens' table
 * Defines structure and validations for citizen data
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * Citizen Model
 * Represents citizens/users of the government services platform
 */
const Citizen = sequelize.define(
  'Citizen',
  {
    CitizenID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Unique identifier for the citizen'
    },
    FullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      },
      comment: 'Full name of the citizen'
    },
    IdentificationNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [9, 20]
      },
      comment: 'National ID number or identification document number'
    },
    Address: {
      type: DataTypes.STRING(255),
      comment: 'Residential address of the citizen'
    },
    PhoneNumber: {
      type: DataTypes.STRING(20),
      validate: {
        is: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/
      },
      comment: 'Contact phone number'
    },
    Email: {
      type: DataTypes.STRING(100),
      validate: {
        isEmail: true
      },
      comment: 'Email address for communication'
    },
    Username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [4, 50],
        isAlphanumeric: true
      },
      comment: 'Username for authentication'
    },
    PasswordHash: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment: 'Bcrypt-hashed password'
    },
    AreaCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Areas',
        key: 'AreaCode'
      },
      comment: 'Reference to the area where the citizen resides'
    },
    ImageLink: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'URL or path to profile image'
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when record was created'
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when record was last updated'
    }
  },
  {
    tableName: 'Citizens',
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt',
    
    // Model hooks (lifecycle events)
    hooks: {
      // Hash password before saving if changed
      beforeSave: async (citizen) => {
        if (citizen.changed('PasswordHash')) {
          // Only hash if not already hashed
          if (!citizen.PasswordHash.startsWith('$2b$') && !citizen.PasswordHash.startsWith('$2a$')) {
            const saltRounds = 10;
            citizen.PasswordHash = await bcrypt.hash(citizen.PasswordHash, saltRounds);
          }
        }
      }
    },
    
    // Instance methods
    instanceMethods: {
      // Method to validate password
      validatePassword: async function(password) {
        return await bcrypt.compare(password, this.PasswordHash);
      }
    }
  }
);

/**
 * Class methods added to the model
 */

/**
 * Find citizen by username
 * 
 * @param {string} username - Username to search for
 * @returns {Promise<Object>} Citizen record
 */
Citizen.findByUsername = async function(username) {
  return await this.findOne({
    where: { Username: username }
  });
};

/**
 * Find citizen by identification number
 * 
 * @param {string} idNumber - Identification number to search for
 * @returns {Promise<Object>} Citizen record
 */
Citizen.findByIdNumber = async function(idNumber) {
  return await this.findOne({
    where: { IdentificationNumber: idNumber }
  });
};

/**
 * Find citizens by area code
 * 
 * @param {number} areaCode - Area code to filter by
 * @returns {Promise<Array>} Array of citizen records
 */
Citizen.findByAreaCode = async function(areaCode) {
  return await this.findAll({
    where: { AreaCode: areaCode }
  });
};

// Define associations
Citizen.associate = (models) => {
  Citizen.belongsTo(models.Area, {
    foreignKey: 'AreaCode',
    targetKey: 'AreaCode'
  });
  
  Citizen.hasMany(models.Application, {
    foreignKey: 'CitizenID',
    sourceKey: 'CitizenID'
  });
  
  Citizen.hasMany(models.Notification, {
    foreignKey: 'CitizenID',
    sourceKey: 'CitizenID'
  });
};

module.exports = Citizen;
