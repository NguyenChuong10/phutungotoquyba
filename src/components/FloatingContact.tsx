import React from 'react';

type ContactItem = {
  id: string;
  href: string;
  ariaLabel: string;
  bgColor: string;
  hoverColor: string;
  icon: React.ReactNode;
  delay?: string;
  target?: string;
  rel?: string;
};

// 5. Đưa thông tin liên hệ ra ngoài config để dễ quản lý, tránh hardcode
const contacts: ContactItem[] = [
  {
    id: 'zalo',
    href: "https://zalo.me/0903588167",
    ariaLabel: "Liên hệ qua Zalo", // 2. Thêm aria-label hỗ trợ trình đọc màn hình
    bgColor: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    target: "_blank",
    rel: "noopener noreferrer", // 3. Sửa lỗi thiếu noopener
    icon: <span className="font-bold text-base md:text-lg drop-shadow-md">Zalo</span>,
  },
  {
    id: 'email',
    href: "mailto:phutungotoqbadanang@gmail.com",
    ariaLabel: "Gửi email liên hệ", // 2. Thêm aria-label
    bgColor: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    delay: "1s",
    // 7. Thay emoji bằng SVG Icon chuyên nghiệp (Lucide Mail icon)
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
      </svg>
    ),
  },
];

export default function FloatingContact() {
  return (
    // 8. Tối ưu responsive: bottom-6 trên mobile, bottom-10 trên md tránh đè Navigation Bar
    <div className="fixed left-4 md:left-6 bottom-6 md:bottom-10 flex flex-col gap-4 md:gap-5 z-50">
      {/* 4. Khắc phục lỗi Duplicate Code bằng vòng lặp map từ Config Array */}
      {contacts.map((contact) => (
        <a 
          key={contact.id}
          href={contact.href} 
          target={contact.target}
          rel={contact.rel}
          aria-label={contact.ariaLabel}
          // 6. Xóa class 'group' bị thừa (dead code)
          className={`relative w-12 h-12 md:w-14 md:h-14 ${contact.bgColor} rounded-full flex items-center justify-center text-white shadow-lg md:shadow-2xl ${contact.hoverColor} transition-colors cursor-pointer`}
        >
          {/* 9. Thêm motion-reduce:animate-none để tôn trọng người dùng prefers-reduced-motion */}
          <div 
            className={`absolute inset-0 rounded-full ${contact.bgColor} animate-ping motion-reduce:animate-none opacity-75`} 
            style={contact.delay ? { animationDelay: contact.delay } : undefined}
          ></div>
          <div 
            className="relative z-10 flex items-center justify-center w-full h-full animate-ring motion-reduce:animate-none" 
            style={contact.delay ? { animationDelay: contact.delay } : undefined}
          >
            {contact.icon}
          </div>
        </a>
      ))}
    </div>
  );
}
