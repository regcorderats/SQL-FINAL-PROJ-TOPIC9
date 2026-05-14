"use client";

import React, { useState, useEffect } from 'react';

export default function CustomerTransfer() {
  const [user, setUser] = useState<any>(null);
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.accounts?.[0]) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('http://localhost:3001/api/transactions/transfer/maker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          makerId: user.id,
          fromAccountId: user.accounts[0].id,
          toAccountId,
          amount: Number(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Chuyển tiền thất bại');

      setMessage({ type: 'success', text: 'Lệnh chuyển tiền đã được tạo thành công. Chờ Manager duyệt!' });
      setToAccountId('');
      setAmount('');

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="font-heading text-4xl text-[#14213d]">Chuyển khoản</h2>
        <p className="text-gray-600 mt-2">Chuyển tiền nội bộ • An toàn • Nhanh chóng</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-10 border border-gray-100">
        {message && (
          <div className={`mb-8 p-4 rounded-2xl text-center font-medium ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-8">
          {/* Tài khoản nguồn */}
          <div>
            <label className="block font-bold text-[#14213d] mb-2">Tài khoản nguồn</label>
            <div className="p-4 bg-gray-50 rounded-2xl text-gray-700 font-mono">
              {user?.accounts?.[0]?.id || 'Chưa có tài khoản'}
            </div>
          </div>

          {/* Tài khoản nhận */}
          <div>
            <label className="block font-bold text-[#14213d] mb-2">Tài khoản nhận</label>
            <input
              type="text"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              placeholder="Nhập UUID tài khoản nhận"
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#fca311] font-body"
              required
            />
          </div>

          {/* Số tiền */}
          <div>
            <label className="block font-bold text-[#14213d] mb-2">Số tiền chuyển (VND)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="10000"
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#fca311] text-3xl font-semibold font-body"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#14213d] hover:bg-black text-white font-heading text-xl rounded-2xl transition-all disabled:opacity-70"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận chuyển tiền'}
          </button>
        </form>
      </div>
    </div>
  );
}