"use client"; // Bắt buộc phải có dòng này để dùng state và form event

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  // 1. Khai báo state để lưu dữ liệu người dùng nhập
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State để quản lý trạng thái hiển thị
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2. Hàm xử lý khi bấm nút Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Chặn hành vi load lại trang mặc định của form
    setLoading(true);
    setError(''); // Reset lỗi cũ nếu có

    try {
      // Gọi xuống Backend đang chạy ở cổng 3001
      const res = await fetch('http://localhost:3001/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Bắt lỗi từ Interceptor/Filter của Backend trả về
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      // 3. THÀNH CÔNG: Lưu thông tin và điều hướng
      console.log('Thông tin user:', data.data); // Mở F12 để xem data trả về
      
      // Tạm lưu thông tin user vào localStorage để các trang sau biết ai đang đăng nhập
      localStorage.setItem('user', JSON.stringify(data.data));

      // Dựa vào Role để đá user sang Dashboard tương ứng
      const role = data.data.role;
      
      if (role === 'CUSTOMER') {
        router.push('/customer');
      } else if (role === 'TELLER') {
        router.push('/teller');
      } else if (role === 'MANAGER') {
        router.push('/manager');        // ← Sửa thành /manager
      } else if (role === 'AUDITOR') {
        router.push('/auditor');
      } else {
        router.push('/customer');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-pure-white rounded-2xl shadow-xl p-10 border border-gray-200 relative">
      <div className="text-center mb-10">
        <h1 className="font-logo text-6xl text-navy md:hidden mb-4">Aurora</h1>
        <h2 className="font-heading text-3xl text-navy mb-2">Đăng nhập</h2>
        <p className="font-body text-gray-500">Vui lòng nhập thông tin hệ thống</p>
      </div>

      {/* Hiển thị bảng báo lỗi nếu có */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-body text-center font-semibold">
          {error}
        </div>
      )}

      {/* Lưu ý: Thêm onSubmit vào form */}
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="font-body font-bold text-navy block" htmlFor="email">
            Email / Tên đăng nhập
          </label>
          <input 
            id="email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Cập nhật state khi gõ
            placeholder="user@aurora.bank" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent font-body transition-all"
            required 
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-body font-bold text-navy" htmlFor="password">
              Mật khẩu
            </label>
            <a href="#" className="text-sm font-body text-navy hover:text-gold font-semibold transition-colors">
              Quên mật khẩu?
            </a>
          </div>
          <input 
            id="password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Cập nhật state khi gõ
            placeholder="••••••••" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent font-body transition-all"
            required 
            disabled={loading}
          />
        </div>

        {/* Nút Submit đổi trạng thái theo loading */}
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full bg-navy text-pure-white font-heading font-bold text-lg py-3.5 rounded-lg transition-all mt-4 
            ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-navy/90 hover:shadow-lg active:scale-[0.98]'}`}
        >
          {loading ? 'Đang xác thực...' : 'Truy cập hệ thống'}
        </button>
      </form>

      <div className="mt-8 text-center font-body text-sm text-gray-600 border-t pt-6">
        Bạn chưa có tài khoản khách hàng?{' '}
        <Link href="/register" className="text-gold font-bold hover:underline">
          Mở tài khoản ngay
        </Link>
      </div>
    </div>
  );
}