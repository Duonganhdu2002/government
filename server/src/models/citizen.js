// models/citizen.js
// This model represents the 'Citizens' table.

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Citizen = sequelize.define(
  "Citizen",
  {
    CitizenID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    FullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    IdentificationNumber: {
      type: DataTypes.STRING,
    },
    Address: {
      type: DataTypes.STRING,
    },
    PhoneNumber: {
      type: DataTypes.STRING,
    },
    Email: {
      type: DataTypes.STRING,
    },
    Username: {
      type: DataTypes.STRING,
    },
    PasswordHash: {
      type: DataTypes.STRING,
    },
    AreaCode: {
      type: DataTypes.INTEGER,
    },
    ImageLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Citizens",
    timestamps: false,
  }
);

module.exports = Citizen;
