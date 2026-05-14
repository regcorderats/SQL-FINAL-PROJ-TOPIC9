"use client";

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, ShieldCheck } from 'lucide-react'; // Icon cho đẹp

export default function PendingTransactions() {
  const [user, setUser] = useState<any>(null);
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Hàm gọi danh sách lệnh chờ
  const fetchPending = async () => {
    try {
      // Giả định backend có API lấy list giao dịch PENDING
      const res = await fetch('http://localhost:3001/api/transactions?status=PENDING');
      const data = await res.json();
      setPendingList(data.data || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách chờ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // Hàm xử lý Duyệt hoặc Từ chối
  const handleReview = async (transactionId: string, type: string, action: 'APPROVE' | 'REJECT') => {
    if (!user) return;
    setProcessingId(transactionId);

    try {
      // Dynamic endpoint dựa theo type (transfer, deposit, withdrawal)
      const endpointType = type.toLowerCase(); 
      const res = await fetch(`http://localhost:3001/api/transactions/${endpointType}/checker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkerId: user.id,
          transactionId: transactionId,
          action: action
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Lỗi xử lý giao dịch');

      alert(`Đã ${action === 'APPROVE' ? 'duyệt' : 'từ chối'} lệnh thành công!`);
      // Reload lại danh sách sau khi duyệt
      fetchPending();

    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h2 className="font-heading text-4xl text-navy">Hàng chờ Duyệt lệnh</h2>
          <p className="text-gray-500 mt-2">Dành riêng cho Manager (Checker) để đối soát dòng tiền.</p>
        </div>
        <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {pendingList.length} lệnh đang chờ
        </div>
      </div>

      <div className="bg-pureWhite rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-lightBg/50 text-navy font-heading text-sm uppercase tracking-wider">
            <tr>
              <th className="p-5 font-bold">Thời gian tạo</th>
              <th className="p-5 font-bold">Mã Lệnh</th>
              <th className="p-5 font-bold">Loại Giao dịch</th>
              <th className="p-5 font-bold">Số tiền (VND)</th>
              <th className="p-5 text-center font-bold">Thao tác Quyết định</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-body">
            
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : pendingList.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-16 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <ShieldCheck className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-xl font-medium text-navy">Trống!</p>
                    <p>Hiện không có lệnh nào cần duyệt.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pendingList.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-5 text-sm text-gray-500">
                    {new Date(tx.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="p-5 font-mono text-xs text-gray-400">
                    {tx.id.substring(0, 8).toUpperCase()}...
                  </td>
                  <td className="p-5">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-5 font-bold text-lg text-navy">
                    {Number(tx.amount).toLocaleString('vi-VN')}
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center gap-3">
                      {/* Nút Approve */}
                      <button
                        onClick={() => handleReview(tx.id, tx.type, 'APPROVE')}
                        disabled={processingId === tx.id}
                        className="bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" /> Duyệt
                      </button>

                      {/* Nút Reject */}
                      <button
                        onClick={() => handleReview(tx.id, tx.type, 'REJECT')}
                        disabled={processingId === tx.id}
                        className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" /> Từ chối
                      </button>
                    </div>
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