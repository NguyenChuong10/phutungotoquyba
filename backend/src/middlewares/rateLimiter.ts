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
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 100, // Tối đa 100 đơn báo giá / 1 phút / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Tần suất gửi báo giá quá nhanh. Vui lòng chờ vài giây trước khi thử lại!"
    }
  }
});

// 3. Giới hạn chung toàn bộ API công khai (Chống tấn công từ chối dịch vụ DDoS / Scraping)
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 2000, // Tối đa 2000 requests / 15 phút / IP
  skip: (req) => {
    const ip = req.ip || req.socket.remoteAddress || "";
    return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1" || req.hostname === "localhost";
  },
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
