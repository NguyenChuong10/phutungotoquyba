import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Vui lòng nhập Email" })
    .trim()
    .toLowerCase()
    .email("Định dạng Email không hợp lệ")
    .max(100, "Email không được vượt quá 100 ký tự"),
  password: z
    .string({ required_error: "Vui lòng nhập Mật khẩu" })
    .min(6, "Mật khẩu tối thiểu 6 ký tự")
    .max(100, "Mật khẩu không được vượt quá 100 ký tự")
});

export type LoginInput = z.infer<typeof loginSchema>;
