import prisma from "../config/db";
import { AppError } from "../utils/AppError";

interface CustomerAggregatedItem {
  id?: number;
  fullName: string;
  phone: string;
  email: string | null;
  companyName: string | null;
  address: string | null;
  notes: string | null;
  totalOrders: number;
  lastOrderAt: string;
  vipBadgeText?: string;
  vipBadgeColor?: string;
  recentOrders: any[];
}

export class CustomerService {
  /**
   * Admin Get Customers List (Real-Time Synchronized from Orders & Customers tables)
   */
  static async getAdminCustomers(search?: string) {
    // Fetch all registered customer profiles
    const dbCustomers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Fetch all orders grouped by customerPhone
    const ordersGroupedByPhone = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderCode: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        companyName: true,
        status: true,
        createdAt: true,
        notes: true,
        items: {
          select: {
            id: true,
            productName: true,
            partNumber: true,
            quantity: true,
          },
        },
      },
    });

    // Map by phone to aggregate history
    const customerMap = new Map<string, CustomerAggregatedItem>();

    // First populate from orders
    ordersGroupedByPhone.forEach((ord: any) => {
      const phone = ord.customerPhone.trim();
      if (!customerMap.has(phone)) {
        customerMap.set(phone, {
          fullName: ord.customerName || "Khách Hàng Q.BA",
          phone,
          email: ord.customerEmail || null,
          companyName: ord.companyName || null,
          address: null,
          notes: null,
          totalOrders: 0,
          lastOrderAt: new Date(ord.createdAt).toISOString(),
          vipBadgeText: "Khách Mới",
          vipBadgeColor: "bg-blue-100 text-blue-800 border-blue-200",
          recentOrders: [],
        });
      }

      const item = customerMap.get(phone)!;
      item.totalOrders += 1;
      item.recentOrders.push(ord);
      if (ord.companyName && !item.companyName) {
        item.companyName = ord.companyName;
      }
      if (ord.customerName && item.fullName === "Khách Hàng Q.BA") {
        item.fullName = ord.customerName;
      }
    });

    // Merge with dbCustomers notes & address if exists
    dbCustomers.forEach((dbc: any) => {
      const phone = dbc.phone.trim();
      if (customerMap.has(phone)) {
        const item = customerMap.get(phone)!;
        item.id = dbc.id;
        item.notes = dbc.notes || null;
        item.address = dbc.address || null;
        if (dbc.fullName) item.fullName = dbc.fullName;
        if (dbc.companyName) item.companyName = dbc.companyName;
      } else {
        customerMap.set(phone, {
          id: dbc.id,
          fullName: dbc.fullName,
          phone,
          email: dbc.email || null,
          companyName: dbc.companyName || null,
          address: dbc.address || null,
          notes: dbc.notes || null,
          totalOrders: dbc.totalOrders,
          lastOrderAt: dbc.lastOrderAt ? new Date(dbc.lastOrderAt).toISOString() : new Date(dbc.createdAt).toISOString(),
          vipBadgeText: "Khách Mới",
          vipBadgeColor: "bg-blue-100 text-blue-800 border-blue-200",
          recentOrders: [],
        });
      }
    });

    // Calculate VIP Badges
    const resultList = Array.from(customerMap.values()).map((c) => {
      let vipBadgeText = "Khách Mới";
      let vipBadgeColor = "bg-blue-100 text-blue-800 border-blue-200 font-bold";

      if (c.totalOrders >= 5) {
        vipBadgeText = "Khách VIP";
        vipBadgeColor = "bg-purple-100 text-purple-800 border-purple-300 font-extrabold shadow-2xs animate-pulse";
      } else if (c.totalOrders >= 2) {
        vipBadgeText = "Khách Quen";
        vipBadgeColor = "bg-amber-100 text-amber-800 border-amber-200 font-bold";
      }

      return {
        ...c,
        vipBadgeText,
        vipBadgeColor,
      };
    });

    // Apply search filter if provided
    if (search && search.trim() !== "") {
      const q = search.toLowerCase().trim();
      return resultList.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.companyName && c.companyName.toLowerCase().includes(q)) ||
          (c.notes && c.notes.toLowerCase().includes(q))
      );
    }

    return resultList;
  }

  /**
   * Admin Update Customer Notes (For Gara consultation history)
   */
  static async updateCustomerNotes(phone: string, notes: string) {
    const cleanPhone = phone.trim();
    const existing = await prisma.customer.findUnique({ where: { phone: cleanPhone } });

    if (existing) {
      const updated = await prisma.customer.update({
        where: { phone: cleanPhone },
        data: { notes: notes.trim() },
      });
      return updated;
    } else {
      // Find latest order to grab name & company
      const latestOrder = await prisma.order.findFirst({
        where: { customerPhone: cleanPhone },
        orderBy: { createdAt: "desc" },
      });

      const created = await prisma.customer.create({
        data: {
          fullName: latestOrder?.customerName || "Khách Hàng Q.BA",
          phone: cleanPhone,
          companyName: latestOrder?.companyName || null,
          email: latestOrder?.customerEmail || null,
          notes: notes.trim(),
        },
      });
      return created;
    }
  }

  /**
   * Admin Get Full Customer History Detail
   */
  static async getCustomerDetail(phone: string) {
    const cleanPhone = phone.trim();
    const customer = await prisma.customer.findUnique({ where: { phone: cleanPhone } });
    const orders = await prisma.order.findMany({
      where: { customerPhone: cleanPhone },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return {
      customer,
      orders,
    };
  }
}
