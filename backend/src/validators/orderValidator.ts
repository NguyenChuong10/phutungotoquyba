import { z } from "zod";

export const createQuotationOrderSchema = z.object({
  customerName: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : "Khách Hàng Q.BA")),
  customerPhone: z
    .string({ required_error: "Vui lòng nhập Số điện thoại liên hệ" })
    .trim()
    .regex(/^(03|05|07|08|09)\d{8}$/, "Số điện thoại không hợp lệ (Vui lòng nhập SĐT di động Việt Nam 10 chữ số)"),
  customerEmail: z.string().trim().email("Email không hợp lệ").optional().or(z.literal("")),
  companyName: z.string().trim().optional(),
  shippingAddress: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  honeypot: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive().default(2),
        quantity: z.number().int().positive().default(1),
        itemNote: z.string().trim().optional(),
      })
    )
    .optional()
    .default([]),
});

export type CreateQuotationOrderInput = z.infer<typeof createQuotationOrderSchema>;
