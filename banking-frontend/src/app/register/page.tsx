"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    phone: '',
    age: '',
    gender: '',
    education: '',
    income: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          password: formData.password,
          // Các field demographics sẽ được lưu vào CustomerProfile
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Đăng ký thất bại');

      alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập để tiếp tục.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e5e5e5] py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-12">
        <div className="text-center mb-10">
          <h1 className="font-logo text-6xl text-[#14213d]">Aurora</h1>
          <h2 className="font-heading text-3xl mt-6 text-[#14213d]">Mở tài khoản cá nhân</h2>
          <p className="text-gray-600 mt-3">Vui lòng điền đầy đủ thông tin</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl mb-8 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-[#14213d] mb-2">Họ và tên <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-[#14213d] mb-2">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#14213d] mb-2">Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0123456789"
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-bold text-[#14213d] mb-2">Tuổi</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#14213d] mb-2">Giới tính</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311]"
              >
                <option value="">Chọn giới tính</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#14213d] mb-2">Thu nhập (VND/tháng)</label>
              <input
                type="number"
                name="income"
                value={formData.income}
                onChange={handleChange}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#14213d] mb-2">Mật khẩu <span className="text-red-500">*</span></label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#14213d] text-white font-heading text-xl rounded-2xl hover:bg-black transition disabled:opacity-70"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Mở tài khoản Aurora'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-[#fca311] font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}