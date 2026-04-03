import { AnimatePresence, motion } from 'motion/react';
import { Tooltip } from './Tooltip';
import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  UserSearch,
  Users,
  ScanSearch,
  BarChart3,
  Bell,
  FolderCog,
  Settings,
  LogOut,
  Menu,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { Permission } from '../data/users';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  requiredPermission?: Permission;
  requiredAnyPermission?: Permission[];
}

interface NavSection {
  title: string;
  items: NavItem[];
  adminOnly?: boolean;
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { hasPermission, hasAnyPermission, logout, user, roles } = useAuth();
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const sections: NavSection[] = [
    {
      title: 'ĐIỀU HÀNH',
      items: [
        { to: '/', icon: LayoutDashboard, label: 'Tổng quan' },
      ],
    },
    {
      title: 'NGHIỆP VỤ ĐỐI NGOẠI',
      items: [
        { to: '/partner-dossier', icon: UserSearch, label: 'Lý lịch Đối tác' },
        { to: '/delegations', icon: Users, label: 'Quản lý Đoàn vào', badge: 3 },
      ],
    },
    {
      title: 'HỆ THỐNG DỮ LIỆU',
      items: [
        { to: '/archive', icon: ScanSearch, label: 'Kho số hóa (OCR)' },
        { to: '/reports', icon: BarChart3, label: 'Báo cáo & Thống kê' },
        { to: '/notifications', icon: Bell, label: 'Cảnh báo', badge: 2 },
      ],
    },
    {
      title: 'QUẢN TRỊ',
      adminOnly: true,
      items: [
        { to: '/categories', icon: FolderCog, label: 'Danh mục', requiredPermission: 'category.view' },
      ],
    },
  ];

  const isVisible = (item: NavItem) => {
    if (item.requiredPermission) return hasPermission(item.requiredPermission);
    if (item.requiredAnyPermission) return hasAnyPermission(...item.requiredAnyPermission);
    return true;
  };

  const renderNavLink = (item: NavItem, isCollapsed: boolean, layoutId: string) => {
    const navLink = (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === '/'}
        aria-current={location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to)) ? 'page' : undefined}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative ${
            isActive
              ? 'bg-sidebar-primary/15 text-sidebar-primary'
              : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground/90'
          } ${isCollapsed ? 'justify-center' : ''}`
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.div
                layoutId={reducedMotion ? undefined : layoutId}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-primary"
                transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <div className={`relative flex items-center justify-center w-5 h-5 shrink-0 ${isActive ? 'text-sidebar-primary' : ''}`}>
              <item.icon className="w-[17px] h-[17px]" />
            </div>
            {!isCollapsed && (
              <>
                <span className="text-[13px] flex-1">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className={`min-w-[18px] h-[18px] px-1 text-[10px] rounded-full flex items-center justify-center ${
                    isActive ? 'bg-sidebar-primary text-white' : 'bg-red-500/90 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {isCollapsed && item.badge && item.badge > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    );

    return isCollapsed ? (
      <Tooltip key={item.to} content={item.label} position="right" delay={200} className="w-full">
        {navLink}
      </Tooltip>
    ) : (
      <div key={item.to}>{navLink}</div>
    );
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isCollapsed = isMobile ? false : collapsed;

    return (
      <>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
          <div className="relative w-9 h-9 shrink-0">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#1a5c32] to-[#0d3d1f]" />
            <div className="absolute inset-0 rounded-xl border border-white/10" />
            <div className="absolute inset-0 rounded-xl flex items-center justify-center">
              <Star className="w-[17px] h-[17px] text-[#c9a547] fill-[#c9a547]" />
            </div>
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden flex-1 min-w-0"
            >
              <h1
                className="text-[13px] text-sidebar-foreground tracking-tight whitespace-nowrap leading-tight"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
              >
                QL. ĐỐI TÁC VLV
              </h1>
              <p className="text-[9.5px] text-[#c9a547]/70 whitespace-nowrap tracking-widest uppercase mt-0.5">
                Bộ Quốc Phòng
              </p>
            </motion.div>
          )}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg hover:bg-sidebar-accent ml-auto transition-colors"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5 text-sidebar-foreground/60" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto" aria-label="Menu chính">
          {sections.map((section, sIdx) => {
            const visibleItems = section.items.filter(isVisible);
            if (section.adminOnly && visibleItems.length === 0) return null;

            return (
              <div key={section.title}>
                {sIdx > 0 && (
                  <div className="pt-4 pb-1">
                    <div className={`${isCollapsed ? 'flex justify-center' : 'px-3'}`}>
                      {isCollapsed ? (
                        <div className="w-6 h-px bg-sidebar-foreground/10" />
                      ) : (
                        <p className="text-[9.5px] uppercase tracking-[0.14em] text-sidebar-foreground/45">
                          {section.title}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {sIdx === 0 && (
                  <p className={`text-[9.5px] uppercase tracking-[0.14em] text-sidebar-foreground/45 mb-2 ${isCollapsed ? 'text-center' : 'px-3'}`}>
                    {isCollapsed ? '•••' : section.title}
                  </p>
                )}
                {visibleItems.map((item) =>
                  renderNavLink(item, isCollapsed, `nav-active-${sIdx}`)
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-sidebar-border p-3 space-y-0.5">
          <NavLink
            to="/settings"
            aria-current={location.pathname === '/settings' ? 'page' : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-sidebar-primary/15 text-white'
                  : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground/90'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
            aria-label="Cài đặt"
          >
            <Settings className="w-[17px] h-[17px] shrink-0" />
            {!isCollapsed && <span className="text-[13px]">Cài đặt</span>}
          </NavLink>

          <button
            onClick={logout}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full text-red-400/70 hover:bg-red-500/10 hover:text-red-400 ${isCollapsed ? 'justify-center' : ''}`}
            aria-label="Đăng xuất"
          >
            <LogOut className="w-[17px] h-[17px] shrink-0" />
            {!isCollapsed && <span className="text-[13px]">Đăng xuất</span>}
          </button>

          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all duration-200 w-full text-sidebar-foreground/45 hover:bg-sidebar-accent hover:text-sidebar-foreground/65 mt-1 ${isCollapsed ? 'justify-center' : ''}`}
              aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <ChevronRight className="w-[16px] h-[16px]" />
              ) : (
                <>
                  <ChevronLeft className="w-[16px] h-[16px]" />
                  <span className="text-[11px]">Thu gọn</span>
                </>
              )}
            </button>
          )}

          {!isCollapsed && (
            <div className="pt-2 px-3">
              <p className="text-[9px] text-sidebar-foreground/35 tracking-wide">VMS v2.0 &copy; TCCNQP 2026</p>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-card rounded-xl border border-border hover:bg-accent transition-colors"
        style={{ boxShadow: 'var(--shadow-md)' }}
        aria-label="Mở menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Desktop Sidebar */}
      <aside
        aria-label="Thanh điều hướng"
        className={`hidden lg:flex h-screen text-sidebar-foreground flex-col transition-all duration-300 ease-in-out shrink-0 ${
          collapsed ? 'w-[72px]' : 'w-[256px]'
        }`}
        style={{
          background: 'linear-gradient(180deg, var(--sidebar-gradient-start) 0%, var(--sidebar-gradient-end) 100%)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={reducedMotion ? false : { x: -280 }}
              animate={{ x: 0 }}
              exit={reducedMotion ? undefined : { x: -280 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              aria-label="Thanh điều hướng"
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] text-sidebar-foreground flex flex-col"
              style={{
                background: 'linear-gradient(180deg, var(--sidebar-gradient-start) 0%, var(--sidebar-gradient-end) 100%)',
                boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
              }}
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
