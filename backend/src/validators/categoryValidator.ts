import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string({ required_error: "Tên danh mục không được để trống" })
    .trim()
    .min(2, "Tên danh mục phải có tối thiểu 2 ký tự")
    .max(100, "Tên danh mục không vượt quá 100 ký tự"),
  parentId: z.number().int().positive().nullable().optional(),
  description: z.string().trim().max(500, "Mô tả không vượt quá 500 ký tự").optional(),
  sortOrder: z.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
