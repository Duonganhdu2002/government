const Citizen = require('./citizen');
const Area = require('./areas');

Area.hasMany(Citizen, { foreignKey: 'AreaCode' });
Citizen.belongsTo(Area, { foreignKey: 'AreaCode' });

Area.belongsTo(Area, { as: 'Parent', foreignKey: 'ParentAreaCode' });
Area.hasMany(Area, { as: 'Children', foreignKey: 'ParentAreaCode' });

module.exports = {
    Citizen,
    Area,
};
