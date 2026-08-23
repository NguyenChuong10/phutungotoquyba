import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { UploadController } from "../controllers/uploadController";
import { verifyAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Protect all admin upload routes with JWT verifyAdmin middleware
router.use(verifyAdmin);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Engine with SEO filename formatting
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const rawTitle = req.body?.title || req.body?.name || path.basename(file.originalname, ext);
    
    let cleanName = rawTitle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .trim();

    if (!cleanName || cleanName.length < 3) {
      cleanName = "linh-kien";
    }

    const timestamp = Date.now().toString().slice(-6);
    const seoFilename = `phutung-quyba-${cleanName}-${timestamp}${ext}`;
    cb(null, seoFilename);
  },
});

// File filter (Strict dual validation: Mime-type & File extension)
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Định dạng file không được hỗ trợ. Chỉ chấp nhận JPG, PNG, WEBP, GIF"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// POST /api/v1/admin/upload - Upload Single Product Image
router.post("/", upload.single("image"), UploadController.uploadImage);

// POST /api/v1/admin/upload/multiple - Upload Multiple Product Images (Up to 5 files)
router.post("/multiple", upload.array("images", 5), UploadController.uploadMultipleImages);

export default router;
