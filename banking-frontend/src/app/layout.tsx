import type { Metadata } from "next";
import { Great_Vibes, Merriweather, Source_Sans_3 } from "next/font/google";
import "./globals.css";

// 1. Cấu hình Font Logo (Great Vibes)
const greatVibes = Great_Vibes({ 
  weight: "400", 
  subsets: ["latin"], 
  variable: "--font-logo" 
});

// 2. Cấu hình Font Tiêu đề (Merriweather)
const merriweather = Merriweather({ 
  weight: ["300", "400", "700", "900"], 
  subsets: ["latin", "vietnamese"], 
  variable: "--font-heading" 
});

// 3. Cấu hình Font Nội dung (Source Sans 3 - Bản nâng cấp của Source Sans Pro)
const sourceSans = Source_Sans_3({ 
  subsets: ["latin", "vietnamese"], 
  variable: "--font-body" 
});

export const metadata: Metadata = {
  title: "Aurora Core Banking",
  description: "Hệ thống quản lý ngân hàng lõi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${greatVibes.variable} ${merriweather.variable} ${sourceSans.variable} font-body bg-lightBg text-pureBlack antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}