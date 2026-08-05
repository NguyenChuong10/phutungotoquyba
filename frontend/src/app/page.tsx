import HeroSection from "@/components/public/HeroSection";
import VehicleCategory from "@/components/public/VehicleCategory";
import IntroSection from "@/components/public/IntroSection";
import BrandSlider from "@/components/public/BrandSlider";
import NewsSection from "@/components/public/NewsSection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <h1 className="sr-only">Phụ Tùng Ô Tô Q.BA - Cung cấp phụ tùng xe tải, xe ben, xe đầu kéo và xe khách chuẩn OEM</h1>
      <HeroSection />
      
      {/* White Spacer */}
      <div className="h-16 w-full bg-white relative z-30"></div>

      <VehicleCategory />
      <IntroSection />
      <BrandSlider />
      <NewsSection />
    </div>
  );
}
