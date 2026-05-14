"use client";

import React, { useEffect, useState } from 'react';

export default function ManagerDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-4xl text-[#14213d]">Chào Quản lý, {user.profile?.fullName}</h2>
        <p className="text-gray-600 mt-2">Bảng điều khiển chi nhánh • Hôm nay</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm">
          <p className="text-sm text-gray-500">LỆNH CHỜ DUYỆT</p>
          <p className="text-5xl font-bold text-amber-600 mt-4">12</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm">
          <p className="text-sm text-gray-500">TỔNG SỐ DƯ VAULT</p>
          <p className="text-5xl font-bold text-[#14213d] mt-4">245M</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm">
          <p className="text-sm text-gray-500">NHÂN VIÊN HOẠT ĐỘNG</p>
          <p className="text-5xl font-bold text-emerald-600 mt-4">8</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8">
        <h3 className="font-heading text-xl mb-4">Bạn có thể thực hiện</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/transactions/pending" className="block p-6 border rounded-2xl hover:border-[#fca311] transition">
            <h4 className="font-semibold text-lg">Duyệt Lệnh Giao Dịch</h4>
            <p className="text-gray-500 text-sm mt-2">Kiểm tra và phê duyệt các lệnh đang chờ</p>
          </a>
          <a href="/reports" className="block p-6 border rounded-2xl hover:border-[#fca311] transition">
            <h4 className="font-semibold text-lg">Xem Báo Cáo</h4>
            <p className="text-gray-500 text-sm mt-2">Báo cáo hoạt động &amp; đối soát</p>
          </a>
        </div>
      </div>
    </div>
  );
}