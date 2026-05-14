"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AlertTriangle, Activity, Search } from 'lucide-react';

// Tải thư viện Graph ở chế độ Client-side (Tắt SSR)
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function AuditorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    // Giả lập lấy dữ liệu từ Neo4j Backend (Bạn sẽ thay bằng API thật sau)
    // Cấu trúc Data: Node (Tài khoản), Link (Giao dịch)
    setTimeout(() => {
      setGraphData({
        nodes: [
          { id: 'Acc_A', group: 1, val: 20, name: 'Nguyễn Văn A (Suspicious)' },
          { id: 'Acc_B', group: 2, val: 5, name: 'Công ty Ma B' },
          { id: 'Acc_C', group: 2, val: 5, name: 'Tài khoản C' },
          { id: 'Acc_D', group: 2, val: 5, name: 'Tài khoản D' },
          { id: 'Acc_E', group: 3, val: 15, name: 'Trùm cuối E' }
        ] as any,
        links: [
          { source: 'Acc_B', target: 'Acc_A', val: 2 },
          { source: 'Acc_C', target: 'Acc_A', val: 2 },
          { source: 'Acc_D', target: 'Acc_A', val: 2 },
          { source: 'Acc_A', target: 'Acc_E', val: 5 } // Dòng tiền gom về Acc_A rồi tuồn sang Acc_E
        ] as any
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="font-heading text-4xl text-navy flex items-center gap-3">
          <Activity className="w-10 h-10 text-gold" />
          Trung tâm Phân tích & Giám sát (AML)
        </h2>
        <p className="text-gray-500 mt-2">Phát hiện rửa tiền (Anti-Money Laundering) và giám sát dòng tiền bất thường qua Neo4j.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Khối Cảnh báo */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm">
            <h3 className="font-heading text-red-800 text-lg flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5" /> Cụm đáng ngờ
            </h3>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 cursor-pointer hover:border-red-300">
                <p className="font-bold text-navy text-sm">Cụm ID: #AML-882</p>
                <p className="text-xs text-gray-500 mt-1">Giao dịch phân tán → Gom tụ → Chuyển đi nhanh chóng.</p>
                <div className="mt-2 text-xs font-bold text-red-600">Mức độ: NGHIÊM TRỌNG</div>
              </div>
            </div>
          </div>

          <div className="bg-pureWhite p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-navy mb-4 text-sm uppercase">Công cụ lọc</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Tìm ID Tài khoản..." className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-gold outline-none" />
              <button className="w-full bg-navy text-white py-3 rounded-xl font-bold hover:bg-black transition-colors">
                Quét dữ liệu hôm nay
              </button>
            </div>
          </div>
        </div>

        {/* Khối Vẽ Biểu Đồ Graph */}
        <div className="lg:col-span-3 bg-pureWhite rounded-3xl shadow-sm border border-gray-100 p-2 overflow-hidden relative min-h-[600px] flex flex-col">
          <div className="absolute top-6 left-6 z-10 bg-white/80 backdrop-blur px-4 py-2 rounded-xl shadow-sm border text-sm font-bold text-navy">
            Sơ đồ mạng lưới dòng tiền
          </div>
          
          <div className="flex-1 bg-lightBg/30 rounded-2xl overflow-hidden flex items-center justify-center">
            {loading ? (
              <div className="animate-pulse text-navy font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 animate-spin" /> Đang load dữ liệu từ Neo4j...
              </div>
            ) : (
              // Bọc Graph trong div để nó tự động scale theo khung
              <div className="w-full h-full" style={{ width: '100%', height: '600px' }}>
                <ForceGraph2D
                  graphData={graphData}
                  nodeAutoColorBy="group"
                  nodeRelSize={8}
                  linkColor={() => '#cbd5e1'} // Màu dây nối
                  linkWidth={2}
                  linkDirectionalArrowLength={5} // Mũi tên chỉ hướng dòng tiền
                  linkDirectionalArrowRelPos={1}
                  nodeCanvasObject={(node: any, ctx, globalScale) => {
                    // Custom vẽ tên user dưới các node cho đẹp
                    const label = node.name;
                    const fontSize = 14 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + 10 - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = node.color;
                    ctx.fillText(label, node.x, node.y + 10);
                    
                    // Vẽ chấm tròn
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color;
                    ctx.fill();
                  }}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}