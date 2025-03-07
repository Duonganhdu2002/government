/**
 * citizen.js
 * 
 * Sequelize model for the 'citizens' table
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
    citizenid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: 'Unique identifier for the citizen'
    },
    fullname: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      },
      comment: 'Full name of the citizen'
    },
    identificationnumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [9, 20]
      },
      comment: 'National ID number or identification document number'
    },
    address: {
      type: DataTypes.STRING(255),
      comment: 'Residential address of the citizen'
    },
    phonenumber: {
      type: DataTypes.STRING(20),
      validate: {
        is: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/
      },
      comment: 'Contact phone number'
    },
    email: {
      type: DataTypes.STRING(100),
      validate: {
        isEmail: true
      },
      comment: 'Email address for communication'
    },
    username: {
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
    passwordhash: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment: 'Bcrypt-hashed password'
    },
    areacode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Areas',
        key: 'AreaCode'
      },
      comment: 'Reference to the area where the citizen resides'
    },
    imagelink: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'URL or path to profile image'
    },
    createdat: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when record was created'
    },
    updatedat: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'Timestamp when record was last updated'
    }
  },
  {
    tableName: 'citizens',
    timestamps: true,
    createdAt: 'createdat',
    updatedAt: 'updatedat',
    
    // Model hooks (lifecycle events)
    hooks: {
      // Hash password before saving if changed
      beforeSave: async (citizen) => {
        if (citizen.changed('passwordhash')) {
          // Only hash if not already hashed
          if (!citizen.passwordhash.startsWith('$2b$') && !citizen.passwordhash.startsWith('$2a$')) {
            const saltRounds = 10;
            citizen.passwordhash = await bcrypt.hash(citizen.passwordhash, saltRounds);
          }
        }
      }
    },
    
    // Instance methods
    instanceMethods: {
      // Method to validate password
      validatePassword: async function(password) {
        return await bcrypt.compare(password, this.passwordhash);
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
    where: { username: username }
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
    where: { identificationnumber: idNumber }
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
    where: { areacode: areaCode }
  });
};

// Define associations
Citizen.associate = (models) => {
  Citizen.belongsTo(models.Area, {
    foreignKey: 'areacode',
    targetKey: 'areacode'
  });
  
  Citizen.hasMany(models.Application, {
    foreignKey: 'citizenid',
    sourceKey: 'citizenid'
  });
  
  Citizen.hasMany(models.Notification, {
    foreignKey: 'citizenid',
    sourceKey: 'citizenid'
  });
};

module.exports = Citizen;
