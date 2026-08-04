export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  imageSrc: string;
  isFeatured?: boolean;
  tags: string[];
}

export const newsCategories = [
  "Tất cả tin tức",
  "Kinh Nghiệm Bảo Dưỡng",
  "Hướng Dẫn Tra Mã Phụ Tùng",
  "Tin Thị Trường Xe Tải"
];

export const newsData: Article[] = [
  {
    id: "n1",
    slug: "huong-dan-nhan-biet-phu-tung-howo-chinh-hang",
    title: "Hướng Dẫn Nhận Biết Phụ Tùng Sinotruk HOWO Chính Hãng vs Hàng Nhái Kém Chất Lượng",
    summary: "Bỏ túi ngay 5 dấu hiệu phân biệt lốc máy, lọc dầu, tăm bua phanh và bộ đồng tốc HOWO chính hãng nhà máy giúp bảo vệ xe ben, xe đầu kéo của bạn khỏi sự cố nằm đường.",
    content: `
      <h2>1. Vì sao phụ tùng trôi nổi lại nguy hiểm cho dòng xe tải nặng?</h2>
      <p>Các dòng xe ben, xe đầu kéo tải nặng như <strong>HOWO 371HP, HOWO V7G, Shacman X3000</strong> hoạt động trong môi trường khắc nghiệt với trọng tải lên tới 40-50 tấn. Việc thay thế phụ tùng nhái (lọc dầu dỏm, tăm bua gang kém chất lượng) nguy cơ làm lúp bê động cơ, vỡ phanh khi xuống đèo dốc cực kỳ nguy hiểm.</p>
      
      <div className="p-6 rounded-2xl bg-amber-50 border-l-4 border-amber-500 my-6 text-amber-900 font-medium">
        👉 <strong>Mẹo nhỏ từ chuyên gia Q.BA:</strong> Luôn kiểm tra tem Hologram 3D đổi màu của Sinotruk và dán mã QR code trên vỏ hộp sản phẩm trước khi lắp ráp.
      </div>

      <h2>2. 5 Chi tiết nhận biết phụ tùng Sinotruk HOWO OEM chính hãng</h2>
      <ul>
        <li><strong>Tem Hologram 3D chống giả:</strong> Tem nhà máy Sinotruk khi nhìn nghiêng góc 45 độ sẽ phản quang Logo thương hiệu sắc nét.</li>
        <li><strong>Đường nét dập mã Part No:</strong> Mã Part No. dập nổi trên thân gang/thép sâu, đều nét, không có bavia thừa.</li>
        <li><strong>Đóng gói bao bì:</strong> Thùng carton đày dặn, in mực sắc nét, có lớp nilong niêm phong chống rỉ sét.</li>
        <li><strong>Trọng lượng sản phẩm:</strong> Phụ tùng chính hãng (tăm bua, ty ben, bộ đồng tốc) luôn nặng và đầm tay hơn hàng nhái 10-15%.</li>
        <li><strong>Hóa đơn & Chứng nhận OEM:</strong> Đơn vị uy tín luôn sẵn sàng xuất hóa đơn chứng minh nguồn gốc rõ ràng.</li>
      </ul>

      <h2>3. Cam kết từ Phụ Tùng Ô Tô Q.BA Đà Nẵng</h2>
      <p>Tại Cửa Hàng Phụ Tùng Ô Tô Q.BA (43-45 Nguyễn Văn Tạo, Đà Nẵng), 100% linh kiện nhập kho đều qua quy trình kiểm định 5 bước nghiêm ngặt. Cam kết hoàn tiền 200% nếu phát hiện hàng nhái kém chất lượng.</p>
    `,
    category: "Hướng Dẫn Tra Mã Phụ Tùng",
    author: "Kỹ Thuật Viên Q.BA",
    publishedAt: "24/07/2026",
    readTime: "6 phút đọc",
    imageSrc: "/images/news-section/quyba.png",
    isFeatured: true,
    tags: ["HOWO", "Sinotruk", "Phụ Tùng OEM", "Bảo Dưỡng Xe Ben"]
  },
  {
    id: "n2",
    slug: "quy-trinh-bao-duong-dong-co-weichai-wp12",
    title: "Quy Trình Bảo Dưỡng Động Cơ Weichai WP12 Đúng Chuẩn Giúp Tăng Tuổi Thọ 30%",
    summary: "Tổng hợp lịch thay lọc dầu, lọc gió, gioăng quy lát và căn chỉnh xupap động cơ Weichai WP10/WP12 chuẩn nhà máy sản xuất.",
    content: `
      <h2>1. Lịch thay thế định kỳ các bộ lọc động cơ Weichai</h2>
      <p>Động cơ <strong>Weichai WP10 / WP12</strong> là trái tim của hàng ngàn xe đầu kéo, xe ben tại Việt Nam. Để máy hoạt động êm ái, kéo tải khỏe và tiết kiệm dầu, bạn cần chú ý các mốc bảo dưỡng:</p>
      <ul>
        <li><strong>Lọc dầu nhớt (VG1560080012):</strong> Thay mới sau mỗi 10.000 - 15.000 km hoạt động.</li>
        <li><strong>Lọc nhiên liệu tinh & thô:</strong> Thay định kỳ 15.000 km hoặc khi có dấu hiệu ngạt dầu.</li>
        <li><strong>Lọc gió động cơ:</strong> Vệ sinh xịt bụi sau mỗi chuyến đi công trình, thay mới sau 30.000 km.</li>
      </ul>

      <h2>2. Dấu hiệu cần kiểm tra đại tu gioăng phớt máy</h2>
      <p>Khi xe xuất hiện hiện tượng rỉ dầu mặt máy, khói đen ra nhiều hoặc hao nước châm làm mát, bác tài cần kiểm tra ngay bộ gioăng đại tu phớt gít Weichai để tránh thổi ron quy lát nặng.</p>
    `,
    category: "Kinh Nghiệm Bảo Dưỡng",
    author: "Phòng Kỹ Thuật Q.BA",
    publishedAt: "22/07/2026",
    readTime: "5 phút đọc",
    imageSrc: "/images/news-section/sanpham.png",
    isFeatured: false,
    tags: ["Weichai", "WP12", "Bảo Dưỡng Động Cơ", "Lọc Dầu"]
  },
  {
    id: "n3",
    slug: "huong-dan-tra-ma-vin-so-khung-xe-tai-trung-quoc",
    title: "Mẹo Tra Cứu Số Khung (VIN) Tìm Đúng Mã Phụ Tùng Hộp Số Fast Gear Trong 3 Phút",
    summary: "Hướng dẫn đọc thông số trên bảng tên hộp số Fast Gear (12JS160T, 10JSD120T) giúp mua đúng 100% bánh răng và vành đồng tốc.",
    content: `
      <h2>1. Tầm quan trọng của việc tra đúng mã Part Number hộp số</h2>
      <p>Hộp số <strong>Fast Gear</strong> có hàng chục biến thể với số răng và đường kính vành đồng tốc khác nhau. Việc mua nhầm mã vừa làm gián đoạn thời gian sửa chữa, vừa tốn chi phí vận chuyển chành xe.</p>

      <h2>2. Các bước tra cứu cực nhanh tại Kho Q.BA</h2>
      <p>Bác tài chỉ cần chụp ảnh bảng tên nhôm gắn bên hông hộp số hoặc đọc dãy số VIN gửi qua Zalo 0903.588.167. Bộ phận kỹ thuật Q.BA sẽ truy cập phần mềm catalog chính hãng tra mã chính xác 100%.</p>
    `,
    category: "Hướng Dẫn Tra Mã Phụ Tùng",
    author: "Kỹ Thuật Viên Q.BA",
    publishedAt: "20/07/2026",
    readTime: "4 phút đọc",
    imageSrc: "/images/pioneer-section/hopsoxetai.png",
    isFeatured: false,
    tags: ["Fast Gear", "Tra Mã VIN", "Hộp Số Xe Tải"]
  },
  {
    id: "n4",
    slug: "xu-huong-thi-truong-phu-tung-xe-tai-mien-trung-2026",
    title: "Thị Trường Phụ Tùng Xe Tải Nặng Miền Trung 2026: Nhu Cầu Hàng OEM Chất Lượng Cao Tăng Mạnh",
    summary: "Phân tích xu hướng chuyển dịch từ phụ tùng giá rẻ sang linh kiện OEM chính hãng của các doanh nghiệp vận tải hàng hóa và kho bãi tại Đà Nẵng.",
    content: `
      <h2>1. Doanh nghiệp vận tải chú trọng tính ổn định</h2>
      <p>Thay vì sử dụng linh kiện trôi nổi hư hỏng vặt, các hạm đội xe tải ben và sơ-mi rơ-moóc tại Miền Trung ưu tiên lựa chọn phụ tùng <strong>chất lượng loại 1</strong> từ các nhà cung cấp có kho hàng sẵn tại Đà Nẵng như Q.BA.</p>

    `,
    category: "Tin Thị Trường Xe Tải",
    author: "Ban Biên Tập Q.BA",
    publishedAt: "18/07/2026",
    readTime: "4 phút đọc",
    imageSrc: "/images/about/giao-hang-van-chuyen.jpg",
    isFeatured: false,
    tags: ["Thị Trường Xe Tải", "Đà Nẵng", "Xe Ben", "Phụ Tùng Q.BA"]
  }
];
