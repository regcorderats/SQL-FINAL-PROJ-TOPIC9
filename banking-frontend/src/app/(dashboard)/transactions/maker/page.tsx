"use client";

import React, { useEffect, useState } from 'react';

type TabType = 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL';

export default function MakerPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('TRANSFER');

  // State form
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
        body.fromAccountId = fromAccountId.trim();
        body.toAccountId = toAccountId.trim();
      } else if (activeTab === 'DEPOSIT') {
        endpoint = 'http://localhost:3001/api/transactions/deposit/maker';
        body.customerAccountId = toAccountId.trim(); // Tiền vào tài khoản khách
        body.vaultAccountId = vaultAccountId.trim();
      } else {
        endpoint = 'http://localhost:3001/api/transactions/withdrawal/maker';
        body.customerAccountId = fromAccountId.trim(); // Tiền rút từ tài khoản khách
        body.vaultAccountId = vaultAccountId.trim();
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Tạo lệnh thất bại');

      setMessage({ type: 'success', text: data.message || 'Tạo lệnh thành công. Đang chờ duyệt!' });
      resetForm();

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="border-b pb-4">
        <h2 className="font-heading text-4xl text-[#14213d]">Khu vực Tạo Lệnh (Maker)</h2>
        <p className="text-gray-600 mt-2">Mã NV: <span className="font-bold text-[#14213d]">{user.id?.substring(0,8).toUpperCase()}</span> • Mọi lệnh tạo ra đều sẽ chuyển vào trạng thái Chờ Duyệt (PENDING).</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { key: 'TRANSFER', label: 'Chuyển khoản nội bộ' },
          { key: 'DEPOSIT', label: 'Nạp tiền mặt' },
          { key: 'WITHDRAWAL', label: 'Rút tiền mặt' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key as TabType); resetForm(); setMessage(null); }}
            className={`px-8 py-4 text-lg font-medium border-b-[3px] transition-all ${
              activeTab === tab.key 
                ? 'border-[#fca311] text-[#14213d] font-bold bg-white/50' 
                : 'border-transparent text-gray-500 hover:text-[#14213d] hover:bg-white/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
        {message && (
          <div className={`p-5 mb-8 rounded-2xl font-medium border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form fields thay đổi linh hoạt theo Tab */}
            
            {/* Field: Tài khoản nguồn (Dùng cho Transfer & Withdrawal) */}
            {(activeTab === 'TRANSFER' || activeTab === 'WITHDRAWAL') && (
              <div>
                <label className="block font-bold mb-2 text-[#14213d]">Tài khoản khách hàng (Nguồn)</label>
                <input
                  type="text"
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  placeholder="Nhập UUID tài khoản khách..."
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311] outline-none"
                  required
                />
              </div>
            )}

            {/* Field: Tài khoản đích (Dùng cho Transfer & Deposit) */}
            {(activeTab === 'TRANSFER' || activeTab === 'DEPOSIT') && (
              <div>
                <label className="block font-bold mb-2 text-[#14213d]">Tài khoản khách hàng (Đích)</label>
                <input 
                  type="text" 
                  value={toAccountId} 
                  onChange={(e) => setToAccountId(e.target.value)} 
                  placeholder="Nhập UUID tài khoản nhận..." 
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311] outline-none" 
                  required 
                />
              </div>
            )}

            {/* Field: Két sắt chi nhánh (Dùng cho Deposit & Withdrawal) */}
            {(activeTab === 'DEPOSIT' || activeTab === 'WITHDRAWAL') && (
              <div>
                <label className="block font-bold mb-2 text-[#14213d]">Tài khoản Vault (Két sắt chi nhánh)</label>
                <input 
                  type="text" 
                  value={vaultAccountId} 
                  onChange={(e) => setVaultAccountId(e.target.value)} 
                  placeholder="Nhập UUID Két sắt..." 
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#fca311] outline-none bg-blue-50/50" 
                  required 
                />
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold mb-2 text-[#14213d]">Số tiền giao dịch (VND)</label>
            <div className="relative">
              <input
                type="number"
                min="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full p-4 border border-gray-300 rounded-2xl text-2xl font-bold text-[#14213d] focus:ring-2 focus:ring-[#fca311] outline-none pr-20"
                required
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">VND</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#14213d] text-white rounded-2xl font-heading text-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-4"
          >
            {loading ? 'Đang tạo lệnh...' : `Khởi tạo lệnh ${activeTab === 'TRANSFER' ? 'Chuyển khoản' : activeTab === 'DEPOSIT' ? 'Nạp tiền' : 'Rút tiền'}`}
          </button>
        </form>
      </div>
    </div>
  );
}