// models/index.js
// This file aggregates the models and defines associations between them.

const Citizen = require('./citizen');
const Area = require('./areas');

// Association between Areas and Citizens
Area.hasMany(Citizen, { foreignKey: 'AreaCode' });
Citizen.belongsTo(Area, { foreignKey: 'AreaCode' });

// Self-referencing associations for Areas (Parent-Children relationship)
Area.belongsTo(Area, { as: 'Parent', foreignKey: 'ParentAreaCode' });
Area.hasMany(Area, { as: 'Children', foreignKey: 'ParentAreaCode' });

// Export all models
module.exports = {
    Citizen,
    Area,
    // You can also import and export other models here as needed:
    ApplicationType: require('./applicationTypes'),
    Agency: require('./agencies'),
    Staff: require('./staff'),
    Application: require('./applications'),
    Notification: require('./notifications'),
    ProcessingHistory: require('./processingHistory'),
    AgencyDelay: require('./agencyDelays'),
    PublicNotification: require('./publicNotifications'),
    MediaFile: require('./mediaFiles'),
};
