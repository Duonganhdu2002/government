// models/index.js
// This file aggregates the models and defines associations between them.

const Citizen = require('./citizen');
const Area = require('./areas');
const ApplicationType = require('./applicationTypes');
const Agency = require('./agencies');
const Staff = require('./staff');
const Application = require('./applications');
const Notification = require('./notifications');
const ProcessingHistory = require('./processingHistory');
const AgencyDelay = require('./agencyDelays');
const PublicNotification = require('./publicNotifications');
const MediaFile = require('./mediaFiles');
const SpecialApplicationType = require('./specialApplicationTypes');
const PostCategory = require('./postCategories');
const Post = require('./post');
const MediaPostFile = require('./mediaPostFiles');

// Association between Areas and Citizens
Area.hasMany(Citizen, { foreignKey: 'AreaCode' });
Citizen.belongsTo(Area, { foreignKey: 'AreaCode' });

// Self-referencing associations for Areas (Parent-Children relationship)
Area.belongsTo(Area, { as: 'Parent', foreignKey: 'ParentAreaCode' });
Area.hasMany(Area, { as: 'Children', foreignKey: 'ParentAreaCode' });

// Association between Citizens and Applications
Citizen.hasMany(Application, { foreignKey: 'CitizenID' });
Application.belongsTo(Citizen, { foreignKey: 'CitizenID' });

// Association between ApplicationTypes and Applications
ApplicationType.hasMany(Application, { foreignKey: 'ApplicationTypeID' });
Application.belongsTo(ApplicationType, { foreignKey: 'ApplicationTypeID' });

// Association between ApplicationTypes and SpecialApplicationTypes
ApplicationType.hasMany(SpecialApplicationType, { foreignKey: 'ApplicationTypeID' });
SpecialApplicationType.belongsTo(ApplicationType, { foreignKey: 'ApplicationTypeID' });

// Association between Agencies and Applications
Agency.hasMany(Application, { foreignKey: 'CurrentAgencyID' });
Application.belongsTo(Agency, { foreignKey: 'CurrentAgencyID' });

// Association between Areas and Agencies
Area.hasMany(Agency, { foreignKey: 'AreaCode' });
Agency.belongsTo(Area, { foreignKey: 'AreaCode' });

// Association between Agencies and Staff
Agency.hasMany(Staff, { foreignKey: 'AgencyID' });
Staff.belongsTo(Agency, { foreignKey: 'AgencyID' });

// Association between Applications and ProcessingHistory
Application.hasMany(ProcessingHistory, { foreignKey: 'ApplicationID' });
ProcessingHistory.belongsTo(Application, { foreignKey: 'ApplicationID' });

// Association between Staff and ProcessingHistory
Staff.hasMany(ProcessingHistory, { foreignKey: 'StaffID' });
ProcessingHistory.belongsTo(Staff, { foreignKey: 'StaffID' });

// Association between Applications and Notifications
Application.hasMany(Notification, { foreignKey: 'ApplicationID' });
Notification.belongsTo(Application, { foreignKey: 'ApplicationID' });

// Association between Citizens and Notifications
Citizen.hasMany(Notification, { foreignKey: 'CitizenID' });
Notification.belongsTo(Citizen, { foreignKey: 'CitizenID' });

// Association between Agencies and AgencyDelays
Agency.hasMany(AgencyDelay, { foreignKey: 'AgencyID' });
AgencyDelay.belongsTo(Agency, { foreignKey: 'AgencyID' });

// Association between Applications and AgencyDelays
Application.hasMany(AgencyDelay, { foreignKey: 'ApplicationID' });
AgencyDelay.belongsTo(Application, { foreignKey: 'ApplicationID' });

// Association between Agencies and PublicNotifications
Agency.hasMany(PublicNotification, { foreignKey: 'AgencyID' });
PublicNotification.belongsTo(Agency, { foreignKey: 'AgencyID' });

// Association between Areas and PublicNotifications
Area.hasMany(PublicNotification, { foreignKey: 'TargetArea' });
PublicNotification.belongsTo(Area, { foreignKey: 'TargetArea', targetKey: 'AreaCode' });

// Association between Applications and MediaFiles
Application.hasMany(MediaFile, { foreignKey: 'ApplicationID' });
MediaFile.belongsTo(Application, { foreignKey: 'ApplicationID' });

// Association between PostCategories and Posts
PostCategory.hasMany(Post, { foreignKey: 'CategoryID' });
Post.belongsTo(PostCategory, { foreignKey: 'CategoryID' });

// Association between Posts and MediaPostFiles
Post.hasMany(MediaPostFile, { foreignKey: 'PostID' });
MediaPostFile.belongsTo(Post, { foreignKey: 'PostID' });

// Export all models
module.exports = {
    Citizen,
    Area,
    ApplicationType,
    SpecialApplicationType,
    Agency,
    Staff,
    Application,
    Notification,
    ProcessingHistory,
    AgencyDelay,
    PublicNotification,
    MediaFile,
    PostCategory,
    Post,
    MediaPostFile
};
