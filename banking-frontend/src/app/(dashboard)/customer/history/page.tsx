"use client";

import React, { useEffect, useState } from 'react';

export default function CustomerHistory() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/transactions/history', {
          method: 'POST', // vì controller đang dùng @Body
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });

        if (res.ok) {
          const data = await res.json();
          setTransactions(data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading) return <div className="text-center py-20 text-xl">Đang tải lịch sử giao dịch...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-4xl text-[#14213d]">Lịch sử giao dịch</h2>
        <p className="text-gray-600 mt-2">Tất cả giao dịch của bạn</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-5 text-left">Thời gian</th>
              <th className="px-6 py-5 text-left">Loại</th>
              <th className="px-6 py-5 text-left">Từ</th>
              <th className="px-6 py-5 text-left">Đến</th>
              <th className="px-6 py-5 text-right">Số tiền</th>
              <th className="px-6 py-5 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-gray-400 text-lg">
                  Chưa có giao dịch nào
                </td>
              </tr>
            ) : (
              transactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-5 text-sm">
                    {new Date(tx.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-5">
                    <span className="capitalize px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-mono text-sm break-all">{tx.fromAccountId}</td>
                  <td className="px-6 py-5 font-mono text-sm break-all">{tx.toAccountId}</td>
                  <td className="px-6 py-5 text-right font-semibold text-lg">
                    {Number(tx.amount).toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-4 py-1 rounded-full text-xs font-medium
                      ${tx.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                        tx.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                        'bg-amber-100 text-amber-700'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}