import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import type { Permission } from '../data/users';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredAnyPermission?: Permission[];
}

export function ProtectedRoute({ children, requiredPermission, requiredAnyPermission }: ProtectedRouteProps) {
  const { isAuthenticated, hasPermission, hasAnyPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-foreground mb-2">Không có quyền truy cập</h2>
          <p className="text-[14px] text-muted-foreground">
            Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên để được cấp quyền.
          </p>
        </div>
      </div>
    );
  }

  if (requiredAnyPermission && requiredAnyPermission.length > 0 && !hasAnyPermission(...requiredAnyPermission)) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-foreground mb-2">Không có quyền truy cập</h2>
          <p className="text-[14px] text-muted-foreground">
            Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên để được cấp quyền.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}