"use client";

import React, { useEffect, useState } from 'react';

export default function CustomerProfile() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      setFormData(u.profile || {});
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      setMessage({ 
        type: 'success', 
        text: 'Thông tin hồ sơ đã được cập nhật thành công!' 
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="font-heading text-5xl text-[#14213d]">Hồ sơ cá nhân</h1>
        <p className="text-gray-600 text-lg mt-2">Quản lý thông tin cá nhân và tài khoản của bạn</p>
      </div>

      {message && (
        <div className={`mb-8 p-5 rounded-2xl text-center font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm p-12">
        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Thông tin cơ bản */}
          <div>
            <h3 className="font-heading text-2xl text-[#14213d] mb-6 border-b pb-4">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-bold text-[#14213d] mb-2">Họ và tên</label>
                <input type="text" value={formData.fullName || ''} disabled className="w-full px-6 py-4 border border-gray-300 rounded-2xl bg-gray-50" />
              </div>
              <div>
                <label className="block font-bold text-[#14213d] mb-2">Email</label>
                <input type="email" value={user?.email || ''} disabled className="w-full px-6 py-4 border border-gray-300 rounded-2xl bg-gray-50" />
              </div>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div>
            <h3 className="font-heading text-2xl text-[#14213d] mb-6 border-b pb-4">Thông tin chi tiết</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block font-bold text-[#14213d] mb-2">Số điện thoại</label>
                <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311]" />
              </div>
              <div>
                <label className="block font-bold text-[#14213d] mb-2">Ngày sinh</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311]" />
              </div>
              <div>
                <label className="block font-bold text-[#14213d] mb-2">Giới tính</label>
                <select name="gender" value={formData.gender || ''} onChange={handleChange} className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311]">
                  <option value="">Chọn giới tính</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-bold text-[#14213d] mb-2">Địa chỉ thường trú</label>
                <input type="text" name="address" value={formData.address || ''} onChange={handleChange} placeholder="Số nhà, đường phố, phường/xã..." className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311]" />
              </div>
              <div>
                <label className="block font-bold text-[#14213d] mb-2">Thành phố / Tỉnh</label>
                <input type="text" name="city" value={formData.city || ''} onChange={handleChange} className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311]" />
              </div>
            </div>
          </div>

          {/* Thông tin tài chính */}
          <div>
            <h3 className="font-heading text-2xl text-[#14213d] mb-6 border-b pb-4">Thông tin tài chính</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block font-bold text-[#14213d] mb-2">Thu nhập hàng tháng (VND)</label>
                <input type="number" name="income" value={formData.income || ''} onChange={handleChange} className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311]" />
              </div>
              <div>
                <label className="block font-bold text-[#14213d] mb-2">Trình độ học vấn</label>
                <select name="education" value={formData.education || ''} onChange={handleChange} className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311]">
                  <option value="">Chọn trình độ</option>
                  <option value="High School">THPT</option>
                  <option value="Bachelor">Cử nhân</option>
                  <option value="Master">Thạc sĩ</option>
                  <option value="Doctorate">Tiến sĩ</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#14213d] mb-2">Số CMND/CCCD</label>
                <input type="text" name="identityNumber" value={formData.identityNumber || ''} onChange={handleChange} className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311]" />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-6 bg-[#14213d] hover:bg-black text-white font-heading text-xl rounded-2xl transition-all mt-6"
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin hồ sơ'}
          </button>
        </form>
      </div>
    </div>
  );
}