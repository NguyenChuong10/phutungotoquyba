import React from 'react';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function FloatingContact() {
  const { settings } = useSiteSettings();

  const contacts = [
    {
      id: 'zalo',
      href: settings.zaloLink,
      ariaLabel: "Liên hệ qua Zalo",
      bgColor: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      target: "_blank",
      rel: "noopener noreferrer",
      icon: <span className="font-bold text-base md:text-lg drop-shadow-md">Zalo</span>,
    },
    {
      id: 'phone',
      href: `tel:${settings.hotlineRaw}`,
      ariaLabel: "Gọi điện thoại hotline",
      bgColor: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      delay: "1s",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed right-4 md:right-6 bottom-6 md:bottom-10 flex flex-col gap-4 md:gap-5 z-50">
      {contacts.map((contact) => (
        <a 
          key={contact.id}
          href={contact.href} 
          target={contact.target}
          rel={contact.rel}
          aria-label={contact.ariaLabel}
          className={`relative w-12 h-12 md:w-14 md:h-14 ${contact.bgColor} rounded-full flex items-center justify-center text-white shadow-lg md:shadow-2xl ${contact.hoverColor} transition-colors cursor-pointer`}
        >
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
