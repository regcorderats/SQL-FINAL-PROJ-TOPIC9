import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Giả sử bạn lưu token trong cookie có tên là 'auth_token'
  const token = request.cookies.get('auth_token');
  const path = request.nextUrl.pathname;

  // Nếu truy cập vào trang chủ '/'
  if (path === '/') {
    if (!token) {
      // Chưa đăng nhập -> Đá sang trang login
      return NextResponse.redirect(new URL('/login', request.url));
    } else {
      // Đã đăng nhập -> Đá thẳng vào dashboard (Customer, Teller, v.v.)
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Nếu cố tình vào các route nội bộ mà chưa có token
  if (path.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Cấu hình để middleware này chỉ chạy trên một số route nhất định
export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
