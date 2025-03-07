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
Area.hasMany(Citizen, { foreignKey: 'areacode' });
Citizen.belongsTo(Area, { foreignKey: 'areacode' });

// Self-referencing associations for Areas (Parent-Children relationship)
Area.belongsTo(Area, { as: 'Parent', foreignKey: 'parentareacode' });
Area.hasMany(Area, { as: 'Children', foreignKey: 'parentareacode' });

// Association between Citizens and Applications
Citizen.hasMany(Application, { foreignKey: 'citizenid' });
Application.belongsTo(Citizen, { foreignKey: 'citizenid' });

// Association between ApplicationTypes and Applications
ApplicationType.hasMany(Application, { foreignKey: 'applicationtypeid' });
Application.belongsTo(ApplicationType, { foreignKey: 'applicationtypeid' });

// Association between ApplicationTypes and SpecialApplicationTypes
ApplicationType.hasMany(SpecialApplicationType, { foreignKey: 'applicationtypeid' });
SpecialApplicationType.belongsTo(ApplicationType, { foreignKey: 'applicationtypeid' });

// Association between Agencies and Applications
Agency.hasMany(Application, { foreignKey: 'currentagencyid' });
Application.belongsTo(Agency, { foreignKey: 'currentagencyid' });

// Association between Areas and Agencies
Area.hasMany(Agency, { foreignKey: 'areacode' });
Agency.belongsTo(Area, { foreignKey: 'areacode' });

// Association between Agencies and Staff
Agency.hasMany(Staff, { foreignKey: 'agencyid' });
Staff.belongsTo(Agency, { foreignKey: 'agencyid' });

// Association between Applications and ProcessingHistory
Application.hasMany(ProcessingHistory, { foreignKey: 'applicationid' });
ProcessingHistory.belongsTo(Application, { foreignKey: 'applicationid' });

// Association between Staff and ProcessingHistory
Staff.hasMany(ProcessingHistory, { foreignKey: 'staffid' });
ProcessingHistory.belongsTo(Staff, { foreignKey: 'staffid' });

// Association between Applications and Notifications
Application.hasMany(Notification, { foreignKey: 'applicationid' });
Notification.belongsTo(Application, { foreignKey: 'applicationid' });

// Association between Citizens and Notifications
Citizen.hasMany(Notification, { foreignKey: 'citizenid' });
Notification.belongsTo(Citizen, { foreignKey: 'citizenid' });

// Association between Agencies and AgencyDelays
Agency.hasMany(AgencyDelay, { foreignKey: 'agencyid' });
AgencyDelay.belongsTo(Agency, { foreignKey: 'agencyid' });

// Association between Applications and AgencyDelays
Application.hasMany(AgencyDelay, { foreignKey: 'applicationid' });
AgencyDelay.belongsTo(Application, { foreignKey: 'applicationid' });

// Association between Agencies and PublicNotifications
Agency.hasMany(PublicNotification, { foreignKey: 'agencyid' });
PublicNotification.belongsTo(Agency, { foreignKey: 'agencyid' });

// Association between Areas and PublicNotifications
Area.hasMany(PublicNotification, { foreignKey: 'targetarea' });
PublicNotification.belongsTo(Area, { foreignKey: 'targetarea', targetKey: 'areacode' });

// Association between Applications and MediaFiles
Application.hasMany(MediaFile, { foreignKey: 'applicationid' });
MediaFile.belongsTo(Application, { foreignKey: 'applicationid' });

// Association between PostCategories and Posts
PostCategory.hasMany(Post, { foreignKey: 'categoryid' });
Post.belongsTo(PostCategory, { foreignKey: 'categoryid' });

// Association between Posts and MediaPostFiles
Post.hasMany(MediaPostFile, { foreignKey: 'postid' });
MediaPostFile.belongsTo(Post, { foreignKey: 'postid' });

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
