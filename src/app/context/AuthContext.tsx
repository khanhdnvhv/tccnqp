import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { users as allUsers, getUserPermissions, getUserRoles, type User, type Permission, type Role } from '../data/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  permissions: Permission[];
  roles: Role[];
  sessionExpiry: number | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (...permissions: Permission[]) => boolean;
  hasRole: (roleId: string) => boolean;
  updateProfile: (updates: Partial<Pick<User, 'fullName' | 'email' | 'phone'>>) => void;
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; error?: string };
  resetSessionTimer: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_FAILED_ATTEMPTS = 5;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('eoffice_auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.sessionExpiry && Date.now() < parsed.sessionExpiry) {
          const user = allUsers.find((u) => u.id === parsed.userId);
          if (user && user.isActive && !user.isLocked) {
            return {
              user,
              isAuthenticated: true,
              permissions: getUserPermissions(user),
              roles: getUserRoles(user),
              sessionExpiry: parsed.sessionExpiry,
            };
          }
        }
      } catch {
        // ignore
      }
      localStorage.removeItem('eoffice_auth');
    }
    // Auto-login as Cán bộ P.QHQT by default for demo
    const defaultUser = allUsers.find((u) => u.id === 'user-vms-cb')!;
    const defaultExpiry = Date.now() + SESSION_TIMEOUT;
    localStorage.setItem('eoffice_auth', JSON.stringify({ userId: defaultUser.id, sessionExpiry: defaultExpiry }));
    return {
      user: defaultUser,
      isAuthenticated: true,
      permissions: getUserPermissions(defaultUser),
      roles: getUserRoles(defaultUser),
      sessionExpiry: defaultExpiry,
    };
  });

  // Session timeout check
  useEffect(() => {
    if (!state.isAuthenticated || !state.sessionExpiry) return;

    const checkInterval = setInterval(() => {
      if (Date.now() > state.sessionExpiry!) {
        logout();
      }
    }, 60_000); // check every minute

    return () => clearInterval(checkInterval);
  }, [state.isAuthenticated, state.sessionExpiry]);

  // Reset session on user activity
  const resetSessionTimer = useCallback(() => {
    if (!state.isAuthenticated) return;
    const newExpiry = Date.now() + SESSION_TIMEOUT;
    setState((prev) => ({ ...prev, sessionExpiry: newExpiry }));
    if (state.user) {
      localStorage.setItem('eoffice_auth', JSON.stringify({ userId: state.user.id, sessionExpiry: newExpiry }));
    }
  }, [state.isAuthenticated, state.user]);

  // Listen for activity
  useEffect(() => {
    if (!state.isAuthenticated) return;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    let throttle: ReturnType<typeof setTimeout> | null = null;

    const handler = () => {
      if (throttle) return;
      throttle = setTimeout(() => {
        resetSessionTimer();
        throttle = null;
      }, 60_000); // throttle to once per minute
    };

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (throttle) clearTimeout(throttle);
    };
  }, [state.isAuthenticated, resetSessionTimer]);

  const login = useCallback((username: string, password: string) => {
    const user = allUsers.find((u) => u.username === username);

    if (!user) {
      return { success: false, error: 'Tài khoản không tồn tại' };
    }

    if (user.isLocked) {
      return { success: false, error: 'Tài khoản đã bị khóa do đăng nhập sai nhiều lần. Vui lòng liên hệ quản trị viên.' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Tài khoản đã bị vô hiệu hóa' };
    }

    if (user.password !== password) {
      // Increment failed attempts
      user.failedLoginAttempts += 1;
      user.loginHistory.unshift({
        time: new Date().toISOString(),
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        device: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser',
        success: false,
      });

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.isLocked = true;
        return { success: false, error: `Tài khoản đã bị khóa sau ${MAX_FAILED_ATTEMPTS} lần đăng nhập sai. Vui lòng liên hệ quản trị viên.` };
      }

      const remaining = MAX_FAILED_ATTEMPTS - user.failedLoginAttempts;
      return { success: false, error: `Mật khẩu không đúng. Còn ${remaining} lần thử trước khi tài khoản bị khóa.` };
    }

    // Success
    user.failedLoginAttempts = 0;
    user.lastLogin = new Date().toISOString();
    user.loginHistory.unshift({
      time: new Date().toISOString(),
      ip: '192.168.1.' + Math.floor(Math.random() * 255),
      device: navigator.userAgent.includes('Chrome') ? 'Chrome / ' + navigator.platform : 'Browser',
      success: true,
    });

    const sessionExpiry = Date.now() + SESSION_TIMEOUT;
    const newState: AuthState = {
      user,
      isAuthenticated: true,
      permissions: getUserPermissions(user),
      roles: getUserRoles(user),
      sessionExpiry,
    };

    setState(newState);
    localStorage.setItem('eoffice_auth', JSON.stringify({ userId: user.id, sessionExpiry }));

    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, isAuthenticated: false, permissions: [], roles: [], sessionExpiry: null });
    localStorage.removeItem('eoffice_auth');
  }, []);

  const switchUser = useCallback((userId: string) => {
    const targetUser = allUsers.find((u) => u.id === userId);
    if (!targetUser || !targetUser.isActive || targetUser.isLocked) return;
    const sessionExpiry = Date.now() + SESSION_TIMEOUT;
    const newState: AuthState = {
      user: targetUser,
      isAuthenticated: true,
      permissions: getUserPermissions(targetUser),
      roles: getUserRoles(targetUser),
      sessionExpiry,
    };
    setState(newState);
    localStorage.setItem('eoffice_auth', JSON.stringify({ userId: targetUser.id, sessionExpiry }));
  }, []);

  const hasPermissionFn = useCallback(
    (permission: Permission) => state.permissions.includes(permission),
    [state.permissions]
  );

  const hasAnyPermission = useCallback(
    (...permissions: Permission[]) => permissions.some((p) => state.permissions.includes(p)),
    [state.permissions]
  );

  const hasRole = useCallback(
    (roleId: string) => state.roles.some((r) => r.id === roleId),
    [state.roles]
  );

  const updateProfile = useCallback(
    (updates: Partial<Pick<User, 'fullName' | 'email' | 'phone'>>) => {
      if (!state.user) return;
      Object.assign(state.user, updates);
      setState((prev) => ({ ...prev, user: { ...prev.user!, ...updates } }));
    },
    [state.user]
  );

  const changePassword = useCallback(
    (oldPassword: string, newPassword: string) => {
      if (!state.user) return { success: false, error: 'Chưa đăng nhập' };
      if (state.user.password !== oldPassword) return { success: false, error: 'Mật khẩu cũ không đúng' };

      // Validate new password
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return { success: false, error: 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt' };
      }

      state.user.password = newPassword;
      setState((prev) => ({ ...prev, user: { ...prev.user! } }));
      return { success: true };
    },
    [state.user]
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        switchUser,
        hasPermission: hasPermissionFn,
        hasAnyPermission,
        hasRole,
        updateProfile,
        changePassword,
        resetSessionTimer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
