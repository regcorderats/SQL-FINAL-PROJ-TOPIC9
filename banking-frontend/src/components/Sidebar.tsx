import Link from "next/link";
import { LayoutDashboard, ArrowRightLeft, Users, Settings, ShieldCheck } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-card min-h-screen flex flex-col">
      {/* Logo / Tên hệ thống */}
      <div className="h-16 flex items-center px-6 border-b">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-primary">
          V-Bank
        </h2>
      </div>
      
      {/* Menu Điều hướng */}
      <nav className="flex-1 p-4 space-y-2 font-sans">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-3 py-2 rounded-md bg-secondary text-secondary-foreground font-medium transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          Tổng quan
        </Link>
        <Link 
          href="/transactions" 
          className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
        >
          <ArrowRightLeft className="h-4 w-4" />
          Giao dịch
        </Link>
        <Link 
          href="/customers" 
          className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
        >
          <Users className="h-4 w-4" />
          Khách hàng
        </Link>
        
        {/* MỚI THÊM: Menu Đối soát */}
        <Link 
          href="/reconciliation" 
          className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
        >
          <ShieldCheck className="h-4 w-4" />
          Đối soát
        </Link>
      </nav>

      {/* Cài đặt ở cuối */}
      <div className="p-4 border-t">
        <Link 
          href="/settings" 
          className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors font-sans"
        >
          <Settings className="h-4 w-4" />
          Cài đặt
        </Link>
      </div>
    </aside>
  );
}