import { QuotationRequest } from "@/types/quotation";
import { isValidPhoneNumber } from "@/lib/validators";

export const quotationService = {
  async submitQuotation(payload: QuotationRequest): Promise<{ success: boolean; message: string }> {
    if (!payload.phoneNumber || !isValidPhoneNumber(payload.phoneNumber)) {
      return {
        success: false,
        message: "Số điện thoại không hợp lệ. Vui lòng nhập lại số điện thoại chính xác."
      };
    }

    // Giả lập gửi yêu cầu về hệ thống Q.BA thành công
    return {
      success: true,
      message: "Gửi yêu cầu báo giá thành công! Chuyên viên Q.BA sẽ gọi lại trong 5 phút."
    };
  }
};
