import { QuotationRequest } from "@/types/quotation";
import { isValidPhoneNumber } from "@/lib/validators";
import { fetchApi } from "@/config/api";

export const quotationService = {
  async submitQuotation(payload: QuotationRequest): Promise<{ success: boolean; message: string }> {
    if (!payload.phoneNumber || !isValidPhoneNumber(payload.phoneNumber)) {
      return {
        success: false,
        message: "Số điện thoại không hợp lệ. Vui lòng nhập lại số điện thoại chính xác."
      };
    }

    try {
      const res = await fetchApi("/orders/quotation", {
        method: "POST",
        body: JSON.stringify({
          customerName: payload.customerName || "Khách hàng Q.BA",
          customerPhone: payload.phoneNumber.trim(),
          notes: payload.note || undefined,
          items: payload.items && payload.items.length > 0 ? payload.items : [
            { productId: 2, quantity: 1 }
          ],
        }),
      });

      if (res.ok) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("quyba_new_order"));
          try {
            const bc = new BroadcastChannel("quyba_order_channel");
            bc.postMessage({ type: "NEW_ORDER", timestamp: Date.now() });
            bc.close();
          } catch {}
          try {
            localStorage.setItem("quyba_new_order_ping", String(Date.now()));
          } catch {}
        }
        return {
          success: true,
          message: res.message || "Gửi yêu cầu báo giá thành công! Chuyên viên Q.BA sẽ gọi lại trong 5 phút."
        };
      }

      return {
        success: false,
        message: res.message || res.error?.message || "Không thể gửi yêu cầu báo giá. Vui lòng thử lại sau."
      };
    } catch {
      return {
        success: false,
        message: "Lỗi kết nối máy chủ. Vui lòng kiểm tra lại đường truyền mạng."
      };
    }
  }
};
