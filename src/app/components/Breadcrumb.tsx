import { Link, useLocation } from 'react-router';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  '': 'Tổng quan',
  'visitors': 'Đăng ký đối tác',
  'appointments': 'Lịch hẹn',
  'entry-history': 'Lịch sử ra vào',
  'badges': 'Quản lý thẻ',
  'vehicles': 'Phương tiện',
  'register-book': 'Sổ đăng ký',
  'notifications': 'Thông báo',
  'reports': 'Báo cáo & Thống kê',
  'search': 'Tìm kiếm',
  'settings': 'Cài đặt',
  'users': 'Cán bộ bảo vệ',
  'organization': 'Đơn vị',
  'categories': 'Danh mục',
};

export function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-[11px] text-muted-foreground">
      <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="w-3 h-3" />
      </Link>
      {pathSegments.map((segment, idx) => {
        const path = '/' + pathSegments.slice(0, idx + 1).join('/');
        const label = routeLabels[segment] || segment;
        const isLast = idx === pathSegments.length - 1;

        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
            {isLast ? (
              <span className="text-muted-foreground">{label}</span>
            ) : (
              <Link to={path} className="hover:text-foreground transition-colors">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}