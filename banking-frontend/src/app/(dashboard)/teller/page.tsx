"use client";

import React, { useEffect, useState } from 'react';

type TabType = 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';

export default function TellerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('TRANSFER');

  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [vaultAccountId, setVaultAccountId] = useState('');
  const [amount, setAmount] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const resetForm = () => {
    setFromAccountId(''); setToAccountId(''); setVaultAccountId(''); setAmount('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let endpoint = '';
      let body: any = { makerId: user?.id, amount: Number(amount) };

      if (activeTab === 'TRANSFER') {
        endpoint = 'http://localhost:3001/api/transactions/transfer/maker';
        body.fromAccountId = fromAccountId;
        body.toAccountId = toAccountId;
      } else if (activeTab === 'DEPOSIT') {
        endpoint = 'http://localhost:3001/api/transactions/deposit/maker';
        body.customerAccountId = toAccountId;
        body.vaultAccountId = vaultAccountId;
      } else {
        endpoint = 'http://localhost:3001/api/transactions/withdrawal/maker';
        body.customerAccountId = fromAccountId;
        body.vaultAccountId = vaultAccountId;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Tạo lệnh thất bại');

      setMessage({ type: 'success', text: data.message || 'Tạo lệnh thành công!' });
      resetForm();

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8">Đang tải...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="font-heading text-4xl text-[#14213d]">Giao dịch viên</h2>
        <p className="text-gray-600">Tạo lệnh giao dịch • Chờ Manager duyệt</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {[
          { key: 'TRANSFER', label: 'Chuyển khoản' },
          { key: 'DEPOSIT', label: 'Nạp tiền mặt' },
          { key: 'WITHDRAWAL', label: 'Rút tiền mặt' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key as TabType); resetForm(); }}
            className={`px-10 py-4 text-lg font-medium border-b-4 transition-all ${
              activeTab === tab.key 
                ? 'border-[#fca311] text-[#14213d] font-semibold' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-10 shadow">
        {message && (
          <div className={`p-4 mb-8 rounded-2xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Form fields theo từng tab */}
          {(activeTab === 'TRANSFER' || activeTab === 'WITHDRAWAL') && (
            <div>
              <label className="block font-bold mb-2 text-[#14213d]">Tài khoản khách hàng</label>
              <input
                type="text"
                value={activeTab === 'TRANSFER' ? fromAccountId : fromAccountId}
                onChange={(e) => activeTab === 'TRANSFER' ? setFromAccountId(e.target.value) : setFromAccountId(e.target.value)}
                placeholder="UUID tài khoản khách"
                className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-[#fca311]"
                required
              />
            </div>
          )}

          {activeTab === 'TRANSFER' && (
            <div>
              <label className="block font-bold mb-2 text-[#14213d]">Tài khoản nhận</label>
              <input type="text" value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} placeholder="UUID tài khoản nhận" className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-[#fca311]" required />
            </div>
          )}

          {(activeTab === 'DEPOSIT' || activeTab === 'WITHDRAWAL') && (
            <div>
              <label className="block font-bold mb-2 text-[#14213d]">Tài khoản Vault (Két sắt)</label>
              <input type="text" value={vaultAccountId} onChange={(e) => setVaultAccountId(e.target.value)} placeholder="UUID Vault" className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-[#fca311]" required />
            </div>
          )}

          <div>
            <label className="block font-bold mb-2 text-[#14213d]">Số tiền</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nhập số tiền"
              className="w-full p-4 border rounded-2xl text-2xl focus:ring-2 focus:ring-[#fca311]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#14213d] text-white rounded-2xl font-bold text-xl hover:bg-black transition"
          >
            {loading ? 'Đang tạo lệnh...' : `Tạo lệnh ${activeTab === 'TRANSFER' ? 'Chuyển tiền' : activeTab === 'DEPOSIT' ? 'Nạp tiền' : 'Rút tiền'}`}
          </button>
        </form>
      </div>
    </div>
  );
}