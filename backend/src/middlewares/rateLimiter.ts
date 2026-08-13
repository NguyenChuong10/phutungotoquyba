import rateLimit from "express-rate-limit";

// 1. Giới hạn 5 lần thử đăng nhập thất bại trong 15 phút cho mỗi IP (Brute Force Protection)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 lần thử thất bại
  skipSuccessfulRequests: true, // Chỉ tính các lần thử THẤT BẠI
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Bạn đã nhập sai mật khẩu quá 5 lần. Vì lý do bảo mật, vui lòng thử lại sau 15 phút!"
    }
  }
});

// 2. Giới hạn gửi yêu cầu báo giá (Chống Bot spam cơ sở dữ liệu)
export const quotationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 3, // Tối đa 3 đơn báo giá mỗi IP trong 15 phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Bạn đã gửi liên tiếp nhiều yêu cầu báo giá. Vì lý do chống spam, vui lòng đợi 15 phút trước khi gửi lại!"
    }
  }
});

// 3. Giới hạn chung toàn bộ API công khai (Chống tấn công từ chối dịch vụ DDoS / Scraping)
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 2000, // Tối đa 2000 requests / 15 phút / IP (Đảm bảo polling Admin không bị nhầm lẫn)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Tần suất truy cập hệ thống quá nhanh. Vui lòng thử lại sau giây lát!"
    }
  }
});
