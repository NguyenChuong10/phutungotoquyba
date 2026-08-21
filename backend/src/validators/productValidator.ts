import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string({ required_error: "Vui lòng nhập tên công khai sản phẩm" })
    .trim()
    .min(3, "Tên sản phẩm phải từ 3 ký tự trở lên")
    .max(200, "Tên sản phẩm không vượt quá 200 ký tự"),
  partNumber: z
    .string()
    .trim()
    .optional()
    .default(""),
  internalCode: z
    .string({ required_error: "Vui lòng nhập Mã quản lý nội bộ Q.BA" })
    .trim()
    .min(2, "Mã nội bộ không hợp lệ")
    .max(100, "Mã nội bộ quá dài"),
  internalName: z
    .string({ required_error: "Vui lòng nhập Tên phụ tùng nội bộ kho" })
    .trim()
    .min(2, "Tên nội bộ không hợp lệ")
    .max(200, "Tên nội bộ quá dài"),
  categoryId: z.number().int().positive({ message: "Vui lòng chọn danh mục phụ tùng" }),
  brandId: z.number().int().positive({ message: "Vui lòng chọn thương hiệu nhà sản xuất" }),
  price: z.number().nonnegative("Giá bán không được âm").default(0),
  costPrice: z.number().nonnegative("Giá vốn không được âm").default(0),
  stockQuantity: z.number().int().nonnegative("Số lượng tồn kho không được âm").default(0),
  inStock: z.boolean().default(true),
  qualityStandard: z.string().trim().default("Loai 1 Cao Cap"),
  description: z.string().trim().optional(),
  specifications: z.record(z.string()).default({}),
  compatibility: z.array(z.string()).default([]),
  images: z
    .array(
      z.object({
        imageUrl: z.string().trim().min(1, "Đường dẫn ảnh không được để trống"),
        isPrimary: z.boolean().default(false),
        sortOrder: z.number().int().default(0),
      })
    )
    .optional(),
});

export const stockAdjustmentSchema = z.object({
  stockQuantity: z
    .number({ required_error: "Vui lòng nhập số lượng tồn kho" })
    .int("Số lượng tồn kho phải là số nguyên")
    .min(0, "Số lượng tồn kho không được nhỏ hơn 0 (không được âm)"),
  price: z
    .number()
    .min(0, "Giá bán sản phẩm không được nhỏ hơn 0 (không được âm)")
    .default(0),
  costPrice: z
    .number()
    .min(0, "Giá vốn nhập kho không được nhỏ hơn 0 (không được âm)")
    .default(0),
  adjustmentNote: z.string().trim().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
