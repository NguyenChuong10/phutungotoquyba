import prisma from "../config/db";
import { AppError } from "../utils/AppError";
import { CreateQuotationOrderInput } from "../validators/orderValidator";

export class OrderService {
  /**
   * Helper to generate unique order code: QB-ORD-YYYYMMDD-XXXX
   */
  private static async generateOrderCode(): Promise<string> {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const prefix = `QB-ORD-${todayStr}-`;

    const lastOrder = await prisma.order.findFirst({
      where: { orderCode: { startsWith: prefix } },
      orderBy: { id: "desc" },
    });

    let seq = 1;
    if (lastOrder) {
      const parts = lastOrder.orderCode.split("-");
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    return `${prefix}${seq.toString().padStart(4, "0")}`;
  }

  /**
   * Helper to sanitize text input against XSS & HTML Script Injection
   */
  private static sanitizeText(str?: string | null): string {
    if (!str) return "";
    return str
      .replace(/<[^>]*>?/gm, "") // Strip HTML tags
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  }

  /**
   * Create Fast Quotation Order Request
   */
  static async createQuotationOrder(input: CreateQuotationOrderInput) {
    // 1. Honeypot check for automated spam bots
    if (input.honeypot && input.honeypot.trim().length > 0) {
      throw new AppError("Phát hiện Bot tự động spam dữ liệu!", 400);
    }

    const customerPhoneVal = input.customerPhone.trim();

    // 2. Phone Cooldown check (Chống 1 SĐT spam bấm liên tục trong vòng 2 phút)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const recentDuplicate = await prisma.order.findFirst({
      where: {
        customerPhone: customerPhoneVal,
        createdAt: { gte: twoMinutesAgo },
      },
    });

    if (recentDuplicate) {
      throw new AppError(
        "Số điện thoại này vừa gửi yêu cầu báo giá cách đây ít phút. Chuyên viên Q.BA đang tiếp nhận xử lý, vui lòng chờ gọi lại!",
        429
      );
    }

    const orderCode = await this.generateOrderCode();

    // Fetch a fallback product in database to guarantee valid FK
    const fallbackProduct = await prisma.product.findFirst({
      orderBy: { id: "asc" },
    });

    const defaultProductId = fallbackProduct ? fallbackProduct.id : 2;

    const requestedItems = input.items && input.items.length > 0
      ? input.items
      : [{ productId: defaultProductId, quantity: 1, itemNote: "Yêu cầu tư vấn báo giá" }];

    const productIds = requestedItems.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let calculatedTotal = 0;
    const orderItemsData = requestedItems.map((item) => {
      const p = productMap.get(item.productId) || fallbackProduct;
      const productIdToUse = p ? p.id : defaultProductId;
      const productNameToUse = p ? p.name : "Phụ Tùng Xe Tải Q.BA";
      const partNumberToUse = p ? p.partNumber : "QB-PART-01";
      const unitPriceNumber = p ? Number(p.price) || 0 : 0;
      const subtotal = unitPriceNumber * item.quantity;
      calculatedTotal += subtotal;

      return {
        productId: productIdToUse,
        productName: productNameToUse,
        partNumber: partNumberToUse,
        quantity: item.quantity,
        unitPrice: unitPriceNumber,
        itemNote: this.sanitizeText(item.itemNote),
      };
    });

    const rawCustomerName = input.customerName && input.customerName.trim().length > 0
      ? input.customerName.trim()
      : "Khách Hàng Q.BA";
    const customerNameVal = this.sanitizeText(rawCustomerName) || "Khách Hàng Q.BA";

    const customerEmailVal = this.sanitizeText(input.customerEmail) || null;
    const companyNameVal = this.sanitizeText(input.companyName) || null;
    const shippingAddressVal = this.sanitizeText(input.shippingAddress) || null;
    const notesVal = this.sanitizeText(input.notes) || null;

    // Create Order & OrderItems within transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderCode,
          customerName: customerNameVal,
          customerPhone: customerPhoneVal,
          customerEmail: customerEmailVal,
          companyName: companyNameVal,
          shippingAddress: shippingAddressVal,
          notes: notesVal,
          status: "pending",
          totalAmount: calculatedTotal,
          items: {
            createMany: {
              data: orderItemsData,
            },
          },
        },
        include: {
          items: true,
        },
      });

      // Upsert Customer directory record
      await tx.customer.upsert({
        where: { phone: customerPhoneVal },
        update: {
          fullName: customerNameVal,
          email: customerEmailVal || undefined,
          companyName: companyNameVal || undefined,
          totalOrders: { increment: 1 },
          lastOrderAt: new Date(),
        },
        create: {
          fullName: customerNameVal,
          phone: customerPhoneVal,
          email: customerEmailVal,
          companyName: companyNameVal,
          totalOrders: 1,
          lastOrderAt: new Date(),
        },
      });

      return newOrder;
    });

    return order;
  }

  /**
   * Admin Get Orders List
   */
  static async getAdminOrders(query: { status?: string; page?: number; limit?: number }) {
    const page = Math.max(query.page || 1, 1);
    const limit = Math.min(query.limit || 50, 100);
    const skip = (page - 1) * limit;

    const whereCondition: Record<string, unknown> = {};
    if (query.status && query.status !== "all" && query.status !== "ALL") {
      whereCondition.status = query.status;
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where: whereCondition }),
      prisma.order.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  partNumber: true,
                  internalCode: true,
                  internalName: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Attach Customer Stats for badging
    const phoneNumbers = [...new Set(orders.map((o) => o.customerPhone))];
    const customers = await prisma.customer.findMany({
      where: { phone: { in: phoneNumbers } },
    });
    const customerMap = new Map(customers.map((c) => [c.phone, c]));

    const ordersWithStats = orders.map((o) => {
      const cust = customerMap.get(o.customerPhone);
      return {
        ...o,
        customerStats: {
          totalOrders: cust?.totalOrders || 1,
          totalSpent: cust?.totalSpent ? Number(cust.totalSpent) : 0,
          lastOrderAt: cust?.lastOrderAt || o.createdAt,
        },
      };
    });

    return {
      data: ordersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get Customer History by Phone Number
   */
  static async getCustomerOrderHistory(phone: string) {
    const cleanPhone = phone.trim();
    const orders = await prisma.order.findMany({
      where: { customerPhone: cleanPhone },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    const customer = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    return {
      customer,
      orders,
    };
  }

  /**
   * Admin Update Order Status
   */
  static async updateOrderStatus(id: number, status: "pending" | "confirmed" | "completed" | "cancelled") {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new AppError("Không tìm thấy đơn báo giá yêu cầu", 404);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    return updatedOrder;
  }

  /**
   * Admin Update Full Order Details
   */
  static async updateOrderDetails(
    id: number,
    data: {
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string | null;
      companyName?: string | null;
      notes?: string | null;
      status?: "pending" | "confirmed" | "completed" | "cancelled";
    }
  ) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new AppError("Không tìm thấy đơn báo giá để cập nhật", 404);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        customerName: data.customerName !== undefined ? data.customerName.trim() : undefined,
        customerPhone: data.customerPhone !== undefined ? data.customerPhone.trim() : undefined,
        customerEmail: data.customerEmail !== undefined ? (data.customerEmail ? data.customerEmail.trim() : null) : undefined,
        companyName: data.companyName !== undefined ? (data.companyName ? data.companyName.trim() : null) : undefined,
        notes: data.notes !== undefined ? (data.notes ? data.notes.trim() : null) : undefined,
        status: data.status !== undefined ? data.status : undefined,
      },
      include: { items: true },
    });

    return updated;
  }

  /**
   * Admin Delete Single Order
   */
  static async deleteOrder(id: number) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new AppError("Không tìm thấy đơn báo giá để xóa", 404);
    }

    await prisma.order.delete({ where: { id } });
    return { success: true, message: `Đã xóa đơn báo giá ${order.orderCode} thành công` };
  }

  /**
   * Admin Delete All Orders of a Customer Phone
   */
  static async deleteCustomerGroup(phone: string) {
    const cleanPhone = phone.trim();
    await prisma.$transaction([
      prisma.order.deleteMany({ where: { customerPhone: cleanPhone } }),
      prisma.customer.deleteMany({ where: { phone: cleanPhone } }),
    ]);

    return { success: true, message: `Đã xóa toàn bộ đơn báo giá và lịch sử SĐT [${cleanPhone}]` };
  }

  /**
   * Admin Get Real-Time Dashboard Analytics (Orders, Conversion funnel, Top 5 Parts, Stock status)
   */
  static async getDashboardAnalytics() {
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      completedOrders,
      cancelledOrders,
      totalProducts,
      outOfStockProducts,
      lowStockProducts,
      totalCustomers,
      orderItemsGrouped,
      recentOrdersTimeline,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.count({ where: { status: "confirmed" } }),
      prisma.order.count({ where: { status: "completed" } }),
      prisma.order.count({ where: { status: "cancelled" } }),
      prisma.product.count(),
      prisma.product.count({ where: { stockQuantity: 0 } }),
      prisma.product.count({ where: { stockQuantity: { gt: 0, lte: 5 } } }),
      prisma.customer.count(),
      prisma.orderItem.groupBy({
        by: ["productName", "partNumber", "productId"],
        _count: { id: true },
        _sum: { quantity: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
      prisma.order.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        select: { id: true, createdAt: true, status: true, orderCode: true, customerName: true },
      }),
    ]);

    // Conversion rate calculations
    const processedOrders = confirmedOrders + completedOrders;
    const conversionRatePercent = totalOrders > 0
      ? Math.round((processedOrders / totalOrders) * 100)
      : 0;

    // Process Top 5 Most Requested Auto Parts
    const topRequestedParts = orderItemsGrouped.map((item, idx) => ({
      rank: idx + 1,
      productId: item.productId,
      productName: item.productName || "Phụ Tùng Xe Tải Q.BA",
      partNumber: item.partNumber || "QB-PART-01",
      totalRequests: item._count.id || 1,
      totalQuantity: item._sum.quantity || 1,
    }));

    // Group last 7 days order count timeline
    const daysMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = `${d.getDate()}/${d.getMonth() + 1}`;
      daysMap.set(dateKey, 0);
    }

    recentOrdersTimeline.forEach((ord) => {
      const d = new Date(ord.createdAt);
      const dateKey = `${d.getDate()}/${d.getMonth() + 1}`;
      if (daysMap.has(dateKey)) {
        daysMap.set(dateKey, (daysMap.get(dateKey) || 0) + 1);
      }
    });

    const weeklyTrend = Array.from(daysMap.entries()).map(([dayLabel, count]) => ({
      dayLabel,
      count,
    }));

    return {
      summaryStats: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        completedOrders,
        cancelledOrders,
        conversionRatePercent,
        totalProducts,
        outOfStockProducts,
        lowStockProducts,
        totalCustomers,
      },
      topRequestedParts,
      weeklyTrend,
    };
  }
}
