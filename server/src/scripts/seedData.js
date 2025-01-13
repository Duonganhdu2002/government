const { sequelize, Citizen, Area } = require('../models');

(async () => {
  try {
    // Xóa dữ liệu cũ
    await Citizen.destroy({ where: {} });
    await Area.destroy({ where: {} });

    // Tạo dữ liệu mẫu cho Areas
    const area1 = await Area.create({ AreaName: 'Hà Nội', ParentAreaCode: null });
    console.log('Area 1 created:', area1);

    const area2 = await Area.create({ AreaName: 'Hồ Chí Minh', ParentAreaCode: null });
    console.log('Area 2 created:', area2);

    // Tạo dữ liệu mẫu cho Citizens
    const citizen = await Citizen.create({
      FullName: 'Nguyễn Văn A',
      IdentificationNumber: '123456789',
      Address: '123 Đường ABC, Hà Nội',
      PhoneNumber: '0123456789',
      Email: 'nguyenvana@example.com',
      Username: 'nguyenvana',
      PasswordHash: 'hashed_password',
      AreaCode: area1.AreaCode,
    });
    console.log('Citizen created:', citizen);

    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating seed data:', error);
    process.exit(1);
  }
})();
