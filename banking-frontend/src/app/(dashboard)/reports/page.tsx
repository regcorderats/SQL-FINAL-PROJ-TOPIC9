"use client";

import React, { useEffect, useState } from 'react';

export default function ReportsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [dailyActivities, setDailyActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const res = await fetch('http://localhost:3001/reports/summary');
      const data = await res.json();
      setSummary(data.data);
    } catch (err) {
      console.error("Lỗi lấy summary:", err);
    }
  };

  const fetchDaily = async () => {
    try {
      const res = await fetch('http://localhost:3001/reports/daily-activities');
      const data = await res.json();
      setDailyActivities(data.data || []);
    } catch (err) {
      console.error("Lỗi lấy daily activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchDaily();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-4xl text-[#14213d]">Báo cáo & Phân tích</h2>
        <p className="text-gray-600">Tổng quan hoạt động hệ thống</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <p className="uppercase text-xs tracking-widest text-gray-500">Tổng Khách Hàng</p>
          <p className="text-5xl font-bold text-[#14213d] mt-4">{summary?.totalUsers || 0}</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <p className="uppercase text-xs tracking-widest text-gray-500">Tài Khoản Active</p>
          <p className="text-5xl font-bold text-emerald-600 mt-4">{summary?.totalActiveAccounts || 0}</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <p className="uppercase text-xs tracking-widest text-gray-500">Tổng Số Dư</p>
          <p className="text-4xl font-bold text-[#14213d] mt-4">
            {(summary?.totalBalance || 0).toLocaleString('vi-VN')} ₫
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <p className="uppercase text-xs tracking-widest text-gray-500">Đang Đóng Băng</p>
          <p className="text-4xl font-bold text-amber-600 mt-4">
            {(summary?.totalFrozenBalance || 0).toLocaleString('vi-VN')} ₫
          </p>
        </div>
      </div>

      {/* Daily Activities Table */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <h3 className="font-heading text-2xl mb-6">Hoạt động gần đây</h3>
        
        {loading ? (
          <p className="text-center py-12">Đang tải dữ liệu...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-6 py-4 text-left">Ngày</th>
                  <th className="px-6 py-4 text-right">Số lệnh</th>
                  <th className="px-6 py-4 text-right">Tổng giá trị (VND)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dailyActivities.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-12 text-gray-400">Chưa có dữ liệu</td></tr>
                ) : (
                  dailyActivities.map((item: any, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4 text-right font-medium">{item.total_count}</td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {Number(item.total_amount || 0).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}