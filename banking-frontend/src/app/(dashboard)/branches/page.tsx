"use client";

import React, { useEffect, useState } from 'react';

export default function BranchManagement() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', code: '', location: '' });

  const fetchBranches = async () => {
    try {
      const res = await fetch('http://localhost:3001/branches');
      const data = await res.json();
      setBranches(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBranch),
      });

      if (res.ok) {
        alert('Tạo chi nhánh thành công!');
        setNewBranch({ name: '', code: '', location: '' });
        setShowCreateForm(false);
        fetchBranches();
      }
    } catch (err) {
      alert('Có lỗi khi tạo chi nhánh');
    }
  };

  const handleSoftDelete = async (id: string) => {
    if (!confirm('Xác nhận đóng cửa chi nhánh này?')) return;

    try {
      const res = await fetch(`http://localhost:3001/branches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Đã đóng cửa chi nhánh thành công');
        fetchBranches();
      }
    } catch (err) {
      alert('Có lỗi khi thực hiện');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-heading text-4xl text-[#14213d]">Quản lý Chi nhánh</h2>
          <p className="text-gray-600 mt-2">Quản trị hệ thống chi nhánh ngân hàng</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-[#14213d] text-white px-6 py-3 rounded-2xl hover:bg-black transition"
        >
          + Thêm Chi nhánh mới
        </button>
      </div>

      {/* Form tạo chi nhánh */}
      {showCreateForm && (
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h3 className="font-heading text-xl mb-6">Tạo Chi nhánh Mới</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-bold mb-2">Tên chi nhánh</label>
              <input
                type="text"
                value={newBranch.name}
                onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                className="w-full px-5 py-4 border rounded-2xl"
                required
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Mã chi nhánh</label>
              <input
                type="text"
                value={newBranch.code}
                onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                className="w-full px-5 py-4 border rounded-2xl"
                required
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Địa chỉ</label>
              <input
                type="text"
                value={newBranch.location}
                onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                className="w-full px-5 py-4 border rounded-2xl"
              />
            </div>
            <div className="md:col-span-3">
              <button type="submit" className="bg-[#14213d] text-white px-10 py-4 rounded-2xl hover:bg-black">
                Tạo chi nhánh
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách chi nhánh */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-8 py-5 text-left">Tên Chi nhánh</th>
              <th className="px-8 py-5 text-left">Mã</th>
              <th className="px-8 py-5 text-left">Địa chỉ</th>
              <th className="px-8 py-5 text-center">Trạng thái</th>
              <th className="px-8 py-5 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12">Đang tải...</td></tr>
            ) : branches.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">Chưa có chi nhánh nào</td></tr>
            ) : (
              branches.map((branch: any) => (
                <tr key={branch.id} className="hover:bg-gray-50">
                  <td className="px-8 py-5 font-medium">{branch.name}</td>
                  <td className="px-8 py-5 font-mono">{branch.code}</td>
                  <td className="px-8 py-5 text-gray-600">{branch.location || '—'}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-block px-4 py-1 rounded-full text-xs font-medium ${branch.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {branch.isActive ? 'Hoạt động' : 'Đã đóng'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button
                      onClick={() => handleSoftDelete(branch.id)}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Đóng cửa
                    </button>
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