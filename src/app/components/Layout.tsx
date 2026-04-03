import { CommandPalette } from './CommandPalette';
import { ScrollToTop } from './ScrollToTop';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { ErrorBoundary } from './ErrorBoundary';
import { Outlet, Navigate, useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Toaster } from 'sonner';
import { useEffect, useRef } from 'react';

const routeTitles: Record<string, string> = {
  '/': 'Tổng quan',
  '/partner-dossier': 'Lý lịch Đối tác',
  '/delegations': 'Quản lý Đoàn vào',
  '/archive': 'Kho số hóa (OCR)',
  '/reports': 'Báo cáo & Thống kê',
  '/notifications': 'Cảnh báo',
  '/categories': 'Danh mục',
  '/settings': 'Cài đặt',
};

export function Layout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const main = document.querySelector('main');
    if (main) {
      const scrollEl = main.querySelector('.overflow-y-auto') || main;
      scrollEl.scrollTo({ top: 0 });
    }

    const pageTitle = routeTitles[location.pathname] || 'VMS';
    document.title = `${pageTitle} | QL Đối tác VLV — TCCNQP`;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const heading = document.getElementById('page-heading');
      if (heading) {
        heading.focus({ preventScroll: true });
      }

      const liveRegion = document.getElementById('live-region');
      if (liveRegion) {
        liveRegion.textContent = `Đã chuyển đến trang ${pageTitle}`;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "var(--font-body)" }}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-xl focus:text-[13px]"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        Bỏ qua điều hướng
      </a>
      <Sidebar />
      <main id="main-content" className="flex-1 flex flex-col overflow-hidden">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <CommandPalette />
      <ScrollToTop />
      <KeyboardShortcutsHelp />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '14px',
            fontSize: '13px',
            padding: '12px 16px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
          },
        }}
        richColors
        closeButton
        closeButtonAriaLabel="Đóng thông báo"
        containerAriaLabel="Danh sách thông báo"
      />
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="live-region" />
    </div>
  );
}
