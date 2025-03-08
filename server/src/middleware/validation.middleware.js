/**
 * validation.middleware.js
 *
 * Cung cấp các middleware dùng để validate dữ liệu trong request.
 * Đảm bảo dữ liệu gửi lên từ client đúng định dạng, đầy đủ thông tin, giúp tăng cường tính bảo mật và tính toàn vẹn của dữ liệu.
 */

/**
 * Middleware validate dữ liệu cho công dân khi thực hiện POST và PUT.
 * - Kiểm tra sự hiện diện của các trường bắt buộc.
 * - Validate định dạng của số chứng minh thư và email (nếu có).
 *
 * @param {Object} req - Đối tượng yêu cầu của Express.
 * @param {Object} res - Đối tượng phản hồi của Express.
 * @param {Function} next - Hàm gọi middleware tiếp theo.
 */
const validateCitizenData = (req, res, next) => {
  // Nếu là PATCH, bỏ qua việc validate đầy đủ (sử dụng validatePartialCitizenData)
  if (req.method === 'PATCH') {
    return next();
  }
  
  const { fullname, identificationnumber, username, passwordhash, areacode } = req.body;
  
  if (!fullname || !identificationnumber || !username || !passwordhash || !areacode) {
    return res.status(400).json({
      status: 'error',
      message: 'Required fields are missing',
      missingFields: [
        !fullname ? 'fullname' : null,
        !identificationnumber ? 'identificationnumber' : null,
        !username ? 'username' : null,
        !passwordhash ? 'passwordhash' : null,
        !areacode ? 'areacode' : null
      ].filter(Boolean)
    });
  }
  
  // Kiểm tra định dạng số chứng minh thư (9 đến 12 chữ số)
  if (identificationnumber && !/^\d{9,12}$/.test(identificationnumber)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid identification number format'
    });
  }
  
  // Kiểm tra định dạng email nếu có
  if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid email format'
    });
  }

  next();
};

/**
 * Middleware validate dữ liệu cho công dân khi thực hiện PATCH.
 * - Chỉ validate các trường có mặt trong request.
 *
 * @param {Object} req - Đối tượng yêu cầu của Express.
 * @param {Object} res - Đối tượng phản hồi của Express.
 * @param {Function} next - Hàm gọi middleware tiếp theo.
 */
const validatePartialCitizenData = (req, res, next) => {
  // Đơn giản hóa: chỉ kiểm tra định dạng cơ bản, không bắt buộc 
  // và chỉ trả về lỗi nếu định dạng sai
  
  const { email, phonenumber } = req.body;
  
  // Kiểm tra định dạng email nếu được cung cấp
  if (email && email.length > 0 && !email.includes('@')) {
    return res.status(400).json({
      status: 'error',
      message: 'Email không hợp lệ' 
    });
  }
  
  // Kiểm tra định dạng số điện thoại nếu được cung cấp
  if (phonenumber && !/^\d{10,11}$/.test(phonenumber)) {
    return res.status(400).json({
      status: 'error',
      message: 'Số điện thoại không hợp lệ'
    });
  }

  // Nếu không có lỗi, tiếp tục
  next();
};

/**
 * Middleware validate dữ liệu đơn ứng dụng.
 * - Kiểm tra sự hiện diện của các trường bắt buộc: citizenid, applicationtypeid, content.
 *
 * @param {Object} req - Đối tượng yêu cầu của Express.
 * @param {Object} res - Đối tượng phản hồi của Express.
 * @param {Function} next - Hàm gọi middleware tiếp theo.
 */
const validateApplicationData = (req, res, next) => {
  const { citizenid, applicationtypeid, content } = req.body;
  
  if (!citizenid || !applicationtypeid || !content) {
    return res.status(400).json({
      status: 'error',
      message: 'Required fields are missing',
      missingFields: [
        !citizenid ? 'citizenid' : null,
        !applicationtypeid ? 'applicationtypeid' : null,
        !content ? 'content' : null
      ].filter(Boolean)
    });
  }
  
  next();
};

/**
 * Middleware validate tham số ID trong URL.
 * - Kiểm tra xem ID có tồn tại và có phải là số không.
 *
 * @param {Object} req - Đối tượng yêu cầu của Express.
 * @param {Object} res - Đối tượng phản hồi của Express.
 * @param {Function} next - Hàm gọi middleware tiếp theo.
 */
const validateIdParam = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid ID parameter'
    });
  }
  
  next();
};

/**
 * Middleware validate các tham số phân trang.
 * - Lấy giá trị page và limit từ query string, gán giá trị mặc định nếu cần,
 *   kiểm tra giới hạn của các tham số, và gắn thông tin phân trang vào req.
 *
 * @param {Object} req - Đối tượng yêu cầu của Express.
 * @param {Object} res - Đối tượng phản hồi của Express.
 * @param {Function} next - Hàm gọi middleware tiếp theo.
 */
const validatePagination = (req, res, next) => {
  let { page, limit } = req.query;
  
  // Giá trị mặc định
  page = Number(page) || 1;
  limit = Number(limit) || 10;
  
  // Kiểm tra giới hạn: page phải >= 1, limit trong khoảng từ 1 đến 100
  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 10;
  
  // Gắn thông tin phân trang vào req để sử dụng sau này
  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit
  };
  
  next();
};

module.exports = {
  validateCitizenData,
  validatePartialCitizenData,
  validateApplicationData,
  validateIdParam,
  validatePagination
};
