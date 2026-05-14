"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ArrowRightLeft, ShieldCheck, FileText, LogOut, User, Building, RefreshCcw 
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-[#e5e5e5]">Đang tải...</div>;
  }

  const role = user.role || 'CUSTOMER';
  const roleLabel = role === 'TELLER' ? 'TELLER PORTAL' :
                   role === 'MANAGER' ? 'MANAGER PORTAL' :
                   role === 'AUDITOR' ? 'AUDITOR PORTAL' : 'CUSTOMER PORTAL';

  const getMenuItems = () => {
    const items = [
      { href: `/${role.toLowerCase()}`, label: 'Tổng quan', icon: LayoutDashboard },
    ];

    if (role === 'CUSTOMER') {
        items.push({ href: '/customer/profile', label: 'Hồ sơ cá nhân', icon: User });
    }
    if (['TELLER', 'MANAGER'].includes(role)) {
        items.push({ href: '/transactions/maker', label: 'Tạo Lệnh', icon: ArrowRightLeft });
    }

    if (role === 'MANAGER') {
        items.push({ href: '/transactions/pending', label: 'Duyệt Lệnh', icon: ShieldCheck });
    }

    if (['MANAGER', 'AUDITOR'].includes(role)) {
        items.push({ href: '/reports', label: 'Báo cáo', icon: FileText });
        items.push({ href: '/branches', label: 'Quản lý Chi nhánh', icon: Building });
        items.push({ href: '/reconciliation', label: 'Đối soát', icon: RefreshCcw });
    }
    return items;
  };

  const menuItems = getMenuItems();
  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen flex bg-[#e5e5e5] font-body">
      <aside className="w-72 bg-[#14213d] text-white flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-logo text-5xl text-[#fca311] tracking-wider">Aurora</h1>
          <p className="text-[#fca311] text-xs tracking-[2px] mt-1 font-medium">{roleLabel}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all ${
                  isActive(item.href) 
                    ? 'bg-white/10 text-[#fca311] border-l-4 border-[#fca311]' 
                    : 'hover:bg-white/5 text-white/80'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-[#fca311] flex items-center justify-center text-[#14213d] font-bold text-xl">
              {user.profile?.fullName?.[0] || 'U'}
            </div>
            <div className="text-sm">
              <p className="font-medium">{user.profile?.fullName}</p>
              <p className="text-white/60 text-xs">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center px-8">
          <h1 className="font-heading text-2xl text-[#14213d] capitalize">
            {role.toLowerCase()}
          </h1>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}