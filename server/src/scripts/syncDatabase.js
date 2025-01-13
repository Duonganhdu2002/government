const sequelize = require('../config/database'); // Kết nối DB
const { Citizen, Area } = require('../models'); // Các model

// Đồng bộ database
sequelize
  .sync({ force: true }) // Xóa và tạo lại bảng, cẩn thận khi dùng trong production!
  .then(() => {
    console.log('Database synchronized successfully!');
    process.exit(0); // Thoát quá trình sau khi xong
  })
  .catch((error) => {
    console.error('Error synchronizing database:', error);
    process.exit(1);
  });
