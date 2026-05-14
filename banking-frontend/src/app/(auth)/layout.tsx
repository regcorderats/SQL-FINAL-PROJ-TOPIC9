import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // Đổi sang grid-cols-3 để chia tỉ lệ 2/3 (Navy) và 1/3 (Trắng)
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-3 bg-light-bg">
      
      {/* Cột trái: Chiếm 2/3 màn hình (col-span-2) */}
      <div className="hidden md:flex md:col-span-2 flex-col justify-center items-center bg-navy text-pure-white p-12 shadow-[10px_0_30px_rgba(0,0,0,0.2)] z-10 relative">
        {/* Khung viền trang trí góc */}
        <div className="absolute top-10 left-10 w-24 h-24 border-t-4 border-l-4 border-gold opacity-50"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 border-b-4 border-r-4 border-gold opacity-50"></div>

        <div className="text-center flex flex-col items-center">
          <h1 className="font-logo text-[12rem] text-gold tracking-widest leading-none drop-shadow-2xl">
            Aurora
          </h1>
          
          {/* Slogan: Tiếng Anh, font Merriweather, in nghiêng, màu vàng nhạt, kéo sát lên trên */}
          <p className="font-heading italic text-gold/80 text-2xl tracking-wide -mt-8 font-light drop-shadow-md">
            "Empowering your financial horizon"
          </p>
        </div>
      </div>

      {/* Cột phải: Chiếm 1/3 màn hình (col-span-1) */}
      <div className="md:col-span-1 flex items-center justify-center p-8 relative">
        {children}
      </div>
      
    </div>
  );
}