"use client";

import React, { useEffect, useState } from 'react';

export default function CustomerDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return null;

  const account = user.accounts?.[0] || { balance: 0, frozenBalance: 0 };

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div>
        <h2 className="font-heading text-4xl text-[#14213d]">
          Xin chào, {user.profile?.fullName || 'Khách hàng'}!
        </h2>
        <p className="text-gray-600 mt-1 text-lg">
          Chào mừng bạn trở lại với Aurora Bank. Đây là tổng quan tài chính của bạn hôm nay.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <a 
          href="/customer/transfer"
          className="flex-1 bg-[#14213d] hover:bg-black text-white py-5 rounded-3xl text-center font-medium text-lg transition-all active:scale-[0.98]"
        >
          Chuyển khoản ngay
        </a>
        <a 
          href="/customer/history"
          className="flex-1 bg-[#14213d] hover:bg-black text-white py-5 rounded-3xl text-center font-medium text-lg transition-all active:scale-[0.98]"
        >
          Lịch sử giao dịch
        </a>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Số dư khả dụng */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="uppercase text-xs tracking-widest text-gray-500 font-medium">Số dư khả dụng</p>
              <p className="text-5xl font-bold text-[#14213d] mt-4">
                {Number(account.balance).toLocaleString('vi-VN')}
                <span className="text-2xl text-[#fca311] ml-2">VND</span>
              </p>
            </div>
            <div className="w-14 h-14 bg-[#fca311]/10 rounded-2xl flex items-center justify-center text-2xl">
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')}
          </p>
        </div>

        {/* Số dư đang chờ xử lý */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="uppercase text-xs tracking-widest text-gray-500 font-medium">Số dư đang chờ xử lý</p>
              <p className="text-5xl font-bold text-amber-600 mt-4">
                {Number(account.frozenBalance).toLocaleString('vi-VN')}
                <span className="text-2xl ml-2">VND</span>
              </p>
            </div>
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl">
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-6 italic">Tiền đang được Manager duyệt</p>
        </div>
      </div>

      {/* Lịch sử giao dịch */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <h3 className="font-heading text-xl mb-4 text-[#14213d]">Lịch sử giao dịch gần đây</h3>
        <p className="text-gray-400 italic py-12 text-center">Chưa có giao dịch nào gần đây.</p>
      </div>
    </div>
  );
}