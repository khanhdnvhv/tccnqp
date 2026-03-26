import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useColumnResize } from '../hooks/useColumnResize';
import { useColumnOrder } from '../hooks/useColumnOrder';
import { ResizeHandle } from '../components/ResizeHandle';
import { ResetWidthsButton } from '../components/ResetWidthsButton';
import { DraggableHeader } from '../components/DraggableHeader';
import { useAuth } from '../context/AuthContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useFocusReturn } from '../hooks/useFocusReturn';
import { useDebounce } from '../hooks/useDebounce';
import { useSortState } from '../hooks/useSortState';
import { useColumnVisibility, type ColumnDef } from '../hooks/useColumnVisibility';
import { users as allUsers, roles, departments, getUserRoles, getDepartmentName, type User, type Role } from '../data/users';
import { ColumnToggle } from '../components/ColumnToggle';
import {
  Search, Plus, Filter, Eye, Pencil, Trash2, Lock, Unlock, X, Shield,
  ChevronLeft, ChevronRight, Check, AlertCircle, Clock, Monitor,
  ChevronUp, ChevronDown, ArrowUpDown, Columns, CheckSquare, Square,
} from 'lucide-react';
import { toast } from 'sonner';

type ModalMode = 'view' | 'edit' | 'create' | 'password' | 'history' | null;

export function UsersPage() {
  const { hasPermission } = useAuth();
  const [usersList, setUsersList] = useState<User[]>(allUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Focus return for modals
  useFocusReturn(!!modalMode);
  useFocusReturn(!!deleteConfirm);

  const itemsPerPage = 8;

  const debouncedSearch = useDebounce(searchQuery, 250);

  // Sort state
  type UserSortKey = 'fullName' | 'username' | 'department' | 'status' | 'lastLogin';
  const userSortLabels: Record<UserSortKey, string> = {
    fullName: 'Người dùng', username: 'Username',
    department: 'Phòng ban', status: 'Trạng thái', lastLogin: 'Đăng nhập cuối',
  };
  const { sortKey: userSortKey, sortDir: userSortDir, announcement: userSortAnnouncement, handleSort: handleUserSort, handleSortKeyDown: handleUserSortKeyDown, getAriaSort: getUserAriaSort, resetSort: resetUserSort, isSorted: isUserSorted } = useSortState<UserSortKey>({
    storageKey: 'users_list',
    labels: userSortLabels,
  });

  const UserSortIcon = ({ col }: { col: UserSortKey }) => (
    <span className="inline-flex ml-1 align-middle">
      {userSortKey === col
        ? (userSortDir === 'ascending' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
        : <ArrowUpDown className="w-3 h-3 opacity-0 group-hover/th:opacity-40 transition-opacity" />
      }
    </span>
  );

  // Escape key handler for modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteConfirm) setDeleteConfirm(null);
        else if (modalMode) setModalMode(null);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [modalMode, deleteConfirm]);

  const filtered = useMemo(() => {
    return usersList.filter((u) => {
      const matchSearch = u.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        u.username.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchRole = roleFilter === 'all' || u.roleIds.includes(roleFilter);
      const matchDept = deptFilter === 'all' || u.departmentId === deptFilter;
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && u.isActive && !u.isLocked) ||
        (statusFilter === 'locked' && u.isLocked) ||
        (statusFilter === 'inactive' && !u.isActive);
      return matchSearch && matchRole && matchDept && matchStatus;
    });
  }, [usersList, debouncedSearch, roleFilter, deptFilter, statusFilter]);

  // Sorted filtered users
  const sorted = useMemo(() => {
    if (!userSortKey) return filtered;
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (userSortKey) {
        case 'fullName': cmp = a.fullName.localeCompare(b.fullName, 'vi'); break;
        case 'username': cmp = a.username.localeCompare(b.username); break;
        case 'department': cmp = getDepartmentName(a.departmentId).localeCompare(getDepartmentName(b.departmentId), 'vi'); break;
        case 'status': {
          const statusOrder = (u: User) => u.isLocked ? 2 : !u.isActive ? 1 : 0;
          cmp = statusOrder(a) - statusOrder(b);
          break;
        }
        case 'lastLogin': {
          const aTime = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          const bTime = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          cmp = aTime - bTime;
          break;
        }
      }
      return userSortDir === 'ascending' ? cmp : -cmp;
    });
  }, [filtered, userSortKey, userSortDir]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Row selection helpers
  const toggleUserSelect = useCallback((id: string) => {
    setSelectedUserIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }, []);
  const toggleUserSelectAll = useCallback(() => {
    setSelectedUserIds(prev => prev.size === paginated.length ? new Set() : new Set(paginated.map(u => u.id)));
  }, [paginated]);
  const handleBulkUserToggle = useCallback(() => {
    setUsers(prev => prev.map(u => selectedUserIds.has(u.id) ? { ...u, status: u.status === 'active' ? 'inactive' as const : 'active' as const } : u));
    toast.success(`Đã đổi trạng thái ${selectedUserIds.size} người dùng`);
    setSelectedUserIds(new Set());
  }, [selectedUserIds]);
  const handleBulkUserDelete = useCallback(() => {
    setUsers(prev => prev.filter(u => !selectedUserIds.has(u.id)));
    toast.success(`Đã xóa ${selectedUserIds.size} người dùng`);
    setSelectedUserIds(new Set());
  }, [selectedUserIds]);

  const openCreateModal = () => {
    setFormData({
      username: '',
      fullName: '',
      email: '',
      phone: '',
      password: '',
      roleIds: ['role-employee'],
      departmentId: departments[1]?.id || '',
      position: '',
      isActive: true,
    });
    setFormError('');
    setFormSuccess('');
    setModalMode('create');
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({ ...user });
    setFormError('');
    setFormSuccess('');
    setModalMode('edit');
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setModalMode('view');
  };

  const openHistoryModal = (user: User) => {
    setSelectedUser(user);
    setModalMode('history');
  };

  const handleToggleLock = (user: User) => {
    const updated = usersList.map((u) => {
      if (u.id === user.id) {
        return { ...u, isLocked: !u.isLocked, failedLoginAttempts: u.isLocked ? 0 : u.failedLoginAttempts };
      }
      return u;
    });
    setUsersList(updated);
    toast.success(user.isLocked ? `Đã mở khóa tài khoản ${user.fullName}` : `Đã khóa tài khoản ${user.fullName}`);
  };

  const handleToggleActive = (user: User) => {
    const updated = usersList.map((u) => {
      if (u.id === user.id) return { ...u, isActive: !u.isActive };
      return u;
    });
    setUsersList(updated);
    toast.success(user.isActive ? `Đã vô hiệu hóa ${user.fullName}` : `Đã kích hoạt ${user.fullName}`);
  };

  const validateForm = (): boolean => {
    if (!formData.username?.trim()) { setFormError('Tên đăng nhập không được để trống'); return false; }
    if (!formData.fullName?.trim()) { setFormError('Họ và tên không được để trống'); return false; }
    if (!formData.email?.trim()) { setFormError('Email không được để trống'); return false; }
    if (modalMode === 'create' && !formData.password) { setFormError('Mật khẩu không được để trống'); return false; }
    if (modalMode === 'create') {
      const exists = usersList.some((u) => u.username === formData.username);
      if (exists) { setFormError('Tên đăng nhập đã tồn tại'); return false; }
    }
    if (!formData.roleIds?.length) { setFormError('Phải chọn ít nhất 1 vai trò'); return false; }
    if (!formData.departmentId) { setFormError('Phải chọn phòng ban'); return false; }
    return true;
  };

  const handleSave = () => {
    setFormError('');
    if (!validateForm()) return;

    if (modalMode === 'create') {
      const newUser: User = {
        id: 'user-' + Date.now(),
        username: formData.username!,
        password: formData.password || 'Temp@123',
        fullName: formData.fullName!,
        email: formData.email!,
        phone: formData.phone || '',
        avatar: formData.fullName!.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase(),
        roleIds: formData.roleIds || ['role-employee'],
        departmentId: formData.departmentId!,
        position: formData.position || '',
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0,
        lastLogin: null,
        loginHistory: [],
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsersList([...usersList, newUser]);
      toast.success('Tạo tài khoản thành công!');
      setModalMode(null);
    } else if (modalMode === 'edit' && selectedUser) {
      const updated = usersList.map((u) => {
        if (u.id === selectedUser.id) {
          return {
            ...u,
            fullName: formData.fullName || u.fullName,
            email: formData.email || u.email,
            phone: formData.phone || u.phone,
            roleIds: formData.roleIds || u.roleIds,
            departmentId: formData.departmentId || u.departmentId,
            position: formData.position || u.position,
            avatar: (formData.fullName || u.fullName).split(' ').map((w: string) => w[0]).slice(-2).join('').toUpperCase(),
          };
        }
        return u;
      });
      setUsersList(updated);
      toast.success('Cập nhật thông tin thành công!');
      setModalMode(null);
    }
  };

  const handleResetPassword = () => {
    if (!selectedUser) return;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setFormError('Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường, số và ký tự đặc biệt');
      return;
    }
    const updated = usersList.map((u) => {
      if (u.id === selectedUser.id) return { ...u, password: newPassword };
      return u;
    });
    setUsersList(updated);
    toast.success('Đặt lại mật khẩu thành công!');
    setNewPassword('');
    setModalMode(null);
  };

  const getStatusBadge = (user: User) => {
    if (user.isLocked) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"><Lock className="w-3 h-3" /> Bị khóa</span>;
    if (!user.isActive) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">Vô hiệu hóa</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Hoạt động</span>;
  };

  const userModalRef = useFocusTrap(!!modalMode);

  // Column visibility
  type UserColKey = 'fullName' | 'username' | 'roles' | 'department' | 'status' | 'lastLogin' | 'actions';
  const userColDefs = useMemo<ColumnDef<UserColKey>[]>(() => [
    { key: 'fullName', label: 'Người dùng', required: true },
    { key: 'username', label: 'Username' },
    { key: 'roles', label: 'Vai trò' },
    { key: 'department', label: 'Phòng ban' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'lastLogin', label: 'Đăng nhập cuối' },
    { key: 'actions', label: 'Thao tác', required: true },
  ], []);
  const userColVis = useColumnVisibility<UserColKey>({ storageKey: 'users_list', columns: userColDefs });

  // Column resize
  const userResizeCols = useMemo(() => ['fullName', 'username', 'roles', 'department', 'status', 'lastLogin', 'actions'] as UserColKey[], []);
  const userColResize = useColumnResize<UserColKey>({
    storageKey: 'users_list',
    columns: userResizeCols,
    config: {
      fullName: { defaultWidth: 200, minWidth: 140, maxWidth: 350 },
      username: { defaultWidth: 130, minWidth: 80, maxWidth: 220 },
      roles: { defaultWidth: 160, minWidth: 100, maxWidth: 280 },
      department: { defaultWidth: 150, minWidth: 100, maxWidth: 250 },
      status: { defaultWidth: 120, minWidth: 80, maxWidth: 180 },
      lastLogin: { defaultWidth: 140, minWidth: 100, maxWidth: 220 },
      actions: { defaultWidth: 100, minWidth: 80, maxWidth: 150 },
    },
    defaultMinWidth: 70,
  });
  const userTableRef = useRef<HTMLTableElement>(null);

  // Column order (drag-and-drop reorder)
  const defaultUserColOrder = useMemo<UserColKey[]>(() => ['fullName', 'username', 'roles', 'department', 'status', 'lastLogin', 'actions'], []);
  const userColLabels = useMemo<Record<UserColKey, string>>(() => ({
    fullName: 'Người dùng', username: 'Username', roles: 'Vai trò',
    department: 'Phòng ban', status: 'Trạng thái', lastLogin: 'Đăng nhập cuối', actions: 'Thao tác',
  }), []);
  const userColOrder = useColumnOrder<UserColKey>({ storageKey: 'users_list', defaultOrder: defaultUserColOrder, labels: userColLabels });
  const userOrderedVisibleCols = useMemo(() => userColOrder.order.filter(k => k === 'fullName' || userColVis.isVisible(k)), [userColOrder.order, userColVis]);

  return (
    <PageTransition>
      <Header title="Quản lý Người dùng" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-xs)' }}>
          {/* Toolbar */}
          <div className="p-4 border-b border-border">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, username, email..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  aria-label="Tìm kiếm người dùng"
                  className="w-full pl-9 pr-4 py-2.5 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/40"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground/50" />
                <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                  aria-label="Lọc theo vai trò"
                  className="px-3 py-2 bg-surface-2 rounded-lg text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer text-foreground">
                  <option value="all">Tất cả vai trò</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                  aria-label="Lọc theo phòng ban"
                  className="px-3 py-2 bg-surface-2 rounded-lg text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer text-foreground">
                  <option value="all">Tất cả phòng ban</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  aria-label="Lọc theo trạng thái"
                  className="px-3 py-2 bg-surface-2 rounded-lg text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer text-foreground">
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="locked">Bị khóa</option>
                  <option value="inactive">Vô hiệu hóa</option>
                </select>
              </div>
              <div className="lg:ml-auto flex items-center gap-2 shrink-0">
                <ColumnToggle
                  isOpen={userColVis.isOpen}
                  setIsOpen={userColVis.setIsOpen}
                  columns={userColVis.columns}
                  isVisible={userColVis.isVisible}
                  toggle={userColVis.toggle}
                  resetAll={userColVis.resetAll}
                  showOnlyRequired={userColVis.showOnlyRequired}
                  hideAllOptional={userColVis.hideAllOptional}
                  allOptionalVisible={userColVis.allOptionalVisible}
                  allOptionalHidden={userColVis.allOptionalHidden}
                  handleMenuKeyDown={userColVis.handleMenuKeyDown}
                  visibleCount={userColVis.visibleCount}
                  totalCount={userColVis.totalCount}
                  hasHidden={userColVis.hasHidden}
                  announcement={userColVis.announcement}
                />
              {hasPermission('user.create') && (
                <button onClick={openCreateModal}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-[13px] hover:opacity-90 transition-all active:scale-[0.98]"
                  style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <Plus className="w-4 h-4" /> Thêm người dùng
                </button>
              )}
              </div>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedUserIds.size > 0 && (
            <div className="px-4 py-2.5 border-b border-primary/20 bg-primary/5 flex items-center gap-3">
              <span className="text-[12px] text-primary">Đã chọn {selectedUserIds.size} người dùng</span>
              <button onClick={handleBulkUserToggle} className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-[11px] hover:opacity-90">
                <Lock className="w-3.5 h-3.5" /> Đổi trạng thái
              </button>
              <button onClick={handleBulkUserDelete} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-[11px] hover:opacity-90">
                <Trash2 className="w-3.5 h-3.5" /> Xóa
              </button>
              <button onClick={() => setSelectedUserIds(new Set())} className="flex items-center gap-1 px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-accent rounded-lg ml-auto">
                <X className="w-3.5 h-3.5" /> Bỏ chọn
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-auto max-h-[65vh]">
            <table ref={userTableRef} className="w-full" style={{ tableLayout: 'fixed' }} aria-rowcount={sorted.length + 1}>
              <caption className="sr-only">Danh sách người dùng hệ thống</caption>
              <thead className="sticky-header">
                <tr className="bg-accent/30">
                  <th scope="col" role="columnheader" className="w-10 px-3 py-3">
                    <div className="cursor-pointer" role="checkbox" aria-checked={selectedUserIds.size === paginated.length && paginated.length > 0} aria-label="Chọn tất cả người dùng"
                      onClick={toggleUserSelectAll}>
                      {selectedUserIds.size === paginated.length && paginated.length > 0
                        ? <CheckSquare className="w-4 h-4 text-primary" />
                        : <Square className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </th>
                  {userOrderedVisibleCols.map((colKey, idx) => {
                    const colIdx = idx + 2;
                    const sortableClass = "relative text-left px-5 py-3 text-[11px] text-muted-foreground tracking-wide cursor-pointer select-none hover:text-foreground transition-colors group/th";
                    const headerLabels: Record<UserColKey, string> = {
                      fullName: 'NGƯỜI DÙNG', username: 'USERNAME', roles: 'VAI TRÒ',
                      department: 'PHÒNG BAN', status: 'TRẠNG THÁI', lastLogin: 'ĐĂNG NHẬP CUỐI', actions: 'THAO TÁC',
                    };
                    if (colKey === 'actions') {
                      return <th key={colKey} scope="col" role="columnheader" aria-colindex={colIdx} className="text-center px-5 py-3 text-[11px] text-muted-foreground tracking-wide" style={userColResize.getHeaderProps('actions').style}>THAO TÁC</th>;
                    }
                    if (colKey === 'roles') {
                      return (
                        <DraggableHeader key={colKey} colKey={colKey} index={userColOrder.getColumnIndex(colKey)} onMove={userColOrder.moveColumn} onKeyboardMove={(k, d) => userColOrder.moveColumnByKey(k as UserColKey, d)}
                          scope="col" role="columnheader" aria-colindex={colIdx} tabIndex={0} title="Alt+← → để di chuyển cột"
                          className="relative text-left px-5 py-3 text-[11px] text-muted-foreground tracking-wide" style={userColResize.getHeaderProps('roles').style}>
                          VAI TRÒ
                          <ResizeHandle onResizeStart={(e) => userColResize.onResizeStart('roles', e)} onDoubleClick={() => userColResize.autoFit('roles', userTableRef.current)} onKeyboardResize={(d) => userColResize.keyboardResize('roles', d)} />
                        </DraggableHeader>
                      );
                    }
                    const sortCol = colKey as UserSortKey;
                    return (
                      <DraggableHeader key={colKey} colKey={colKey} index={userColOrder.getColumnIndex(colKey)} onMove={userColOrder.moveColumn} onKeyboardMove={(k, d) => userColOrder.moveColumnByKey(k as UserColKey, d)}
                        scope="col" role="columnheader" aria-colindex={colIdx} aria-sort={getUserAriaSort(sortCol)} tabIndex={0}
                        title="Nhấn Enter để sắp xếp, Alt+← → để di chuyển cột" aria-describedby="user-sort-hint"
                        className={sortableClass} style={userColResize.getHeaderProps(colKey).style}
                        onClick={() => handleUserSort(sortCol)} onKeyDown={(e) => handleUserSortKeyDown(e, sortCol)}>
                        {headerLabels[colKey]} <UserSortIcon col={sortCol} />
                        <ResizeHandle onResizeStart={(e) => userColResize.onResizeStart(colKey, e)} onDoubleClick={() => userColResize.autoFit(colKey, userTableRef.current)} onKeyboardResize={(d) => userColResize.keyboardResize(colKey, d)} />
                      </DraggableHeader>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {paginated.map((u, idx) => {
                  const userRoles = getUserRoles(u);
                  return (
                    <tr key={u.id} aria-rowindex={(currentPage - 1) * itemsPerPage + idx + 2} className="border-b border-border/50 hover:bg-accent/20 transition-colors group"
                      tabIndex={0} onKeyDown={(e) => { if (e.key === ' ') { e.preventDefault(); toggleUserSelect(u.id); } }}>
                      <td className="w-10 px-3 py-3" onClick={() => toggleUserSelect(u.id)}>
                        <div className="cursor-pointer" role="checkbox" aria-checked={selectedUserIds.has(u.id)} aria-label={`Chọn ${u.fullName}`}>
                          {selectedUserIds.has(u.id)
                            ? <CheckSquare className="w-4 h-4 text-primary" />
                            : <Square className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />}
                        </div>
                      </td>
                      {userOrderedVisibleCols.map((colKey) => {
                        switch (colKey) {
                          case 'fullName': return (
                            <td key="fullName" className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-blue-400 flex items-center justify-center text-white text-[11px] shrink-0">{u.avatar}</div>
                                <div><p className="text-[13px] text-foreground">{u.fullName}</p><p className="text-[11px] text-muted-foreground">{u.email}</p></div>
                              </div>
                            </td>
                          );
                          case 'username': return <td key="username" className="px-5 py-3 text-[13px] text-muted-foreground">{u.username}</td>;
                          case 'roles': return (
                            <td key="roles" className="px-5 py-3">
                              <div className="flex flex-wrap gap-1">
                                {userRoles.map((r) => (
                                  <span key={r.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-secondary text-secondary-foreground">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.color }} />{r.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                          );
                          case 'department': return <td key="department" className="px-5 py-3 text-[13px] text-muted-foreground">{getDepartmentName(u.departmentId)}</td>;
                          case 'status': return <td key="status" className="px-5 py-3">{getStatusBadge(u)}</td>;
                          case 'lastLogin': return (
                            <td key="lastLogin" className="px-5 py-3 text-[12px] text-muted-foreground">
                              {u.lastLogin ? new Date(u.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                            </td>
                          );
                          case 'actions': return (
                            <td key="actions" className="px-5 py-3">
                              <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openViewModal(u)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Xem" aria-label="Xem chi tiết"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                                {hasPermission('user.edit') && <button onClick={() => openEditModal(u)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Sửa" aria-label="Chỉnh sửa"><Pencil className="w-4 h-4 text-muted-foreground" /></button>}
                                {hasPermission('user.edit') && <button onClick={() => handleToggleLock(u)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title={u.isLocked ? 'Mở khóa' : 'Khóa'} aria-label={u.isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}>{u.isLocked ? <Unlock className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-amber-500" />}</button>}
                                {hasPermission('user.edit') && <button onClick={() => { setSelectedUser(u); setNewPassword(''); setFormError(''); setFormSuccess(''); setModalMode('password'); }} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Đặt lại mật khẩu" aria-label="Đặt lại mật khẩu"><Shield className="w-4 h-4 text-muted-foreground" /></button>}
                                <button onClick={() => openHistoryModal(u)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Lịch sử đăng nhập" aria-label="Xem lịch sử đăng nhập"><Clock className="w-4 h-4 text-muted-foreground" /></button>
                              </div>
                            </td>
                          );
                          default: return null;
                        }
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface-2/30">
              <p className="text-[13px] text-muted-foreground" aria-live="polite">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} / {filtered.length}
              </p>
              {isUserSorted && (
                <button onClick={() => { resetUserSort(); setCurrentPage(1); }}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors ml-3"
                  aria-label="Xóa sắp xếp">
                  <X className="w-3 h-3" /> Xóa sắp xếp
                </button>
              )}
              <ResetWidthsButton isResized={userColResize.isResized} onReset={userColResize.resetWidths} />
              {userColOrder.isReordered && (
                <button onClick={userColOrder.resetOrder} className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" aria-label="Đặt lại thứ tự cột">
                  <ArrowUpDown className="w-3 h-3" /> Đặt lại thứ tự
                </button>
              )}
              <nav className="flex items-center gap-1" aria-label="Phân trang">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                  aria-label="Trang trước"
                  className="p-2 rounded-lg hover:bg-accent disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    aria-current={p === currentPage ? 'page' : undefined}
                    aria-label={`Trang ${p}`}
                    className={`w-8 h-8 rounded-lg text-[13px] ${p === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  aria-label="Trang sau"
                  className="p-2 rounded-lg hover:bg-accent disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setModalMode(null)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog" aria-modal="true"
            aria-labelledby="user-modal-title"
            style={{ boxShadow: 'var(--shadow-xl)' }}
            ref={userModalRef}>
            {/* View Modal */}
            {modalMode === 'view' && selectedUser && (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h3 id="user-modal-title" style={{ fontFamily: "var(--font-display)" }}>Thông tin người dùng</h3>
                  <button onClick={() => setModalMode(null)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" aria-label="Đóng"><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-[20px]">
                      {selectedUser.avatar}
                    </div>
                    <div>
                      <h3 className="text-foreground">{selectedUser.fullName}</h3>
                      <p className="text-[13px] text-muted-foreground">{selectedUser.position}</p>
                      <div className="flex gap-1 mt-1">
                        {getUserRoles(selectedUser).map((r) => (
                          <span key={r.id} className="px-2 py-0.5 rounded-full text-[11px] text-white" style={{ backgroundColor: r.color }}>{r.name}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      ['Username', selectedUser.username],
                      ['Email', selectedUser.email],
                      ['Điện thoại', selectedUser.phone || 'Chưa cập nhật'],
                      ['Phòng ban', getDepartmentName(selectedUser.departmentId)],
                      ['Trạng thái', selectedUser.isLocked ? 'Bị khóa' : selectedUser.isActive ? 'Hoạt động' : 'Vô hiệu hóa'],
                      ['Đăng nhập cuối', selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'],
                      ['Ngày tạo', selectedUser.createdAt],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between py-2 border-b border-border/50">
                        <span className="text-[13px] text-muted-foreground">{label}</span>
                        <span className="text-[13px] text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Create / Edit Modal */}
            {(modalMode === 'create' || modalMode === 'edit') && (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h3 id="user-modal-title" style={{ fontFamily: "var(--font-display)" }}>{modalMode === 'create' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}</h3>
                  <button onClick={() => setModalMode(null)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" aria-label="Đóng"><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
                <div className="p-6 space-y-4">
                  {formError && (
                    <div id="user-form-error" role="alert" className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-[13px] text-red-600 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                    </div>
                  )}
                  {formSuccess && (
                    <div role="status" className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[13px] text-emerald-600 dark:text-emerald-400">
                      <Check className="w-4 h-4 shrink-0" /> {formSuccess}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="user-username" className="block text-[13px] text-foreground mb-1.5">Tên đăng nhập *</label>
                      <input id="user-username" type="text" value={formData.username || ''} onChange={(e) => setFormData({ ...formData, username: e.target.value })} disabled={modalMode === 'edit'}
                        aria-describedby={formError ? 'user-form-error' : undefined}
                        aria-required="true"
                        className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none disabled:opacity-50" />
                    </div>
                    <div>
                      <label htmlFor="user-fullname" className="block text-[13px] text-foreground mb-1.5">Họ và tên *</label>
                      <input id="user-fullname" type="text" value={formData.fullName || ''} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        aria-describedby={formError ? 'user-form-error' : undefined}
                        aria-required="true"
                        className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="user-email" className="block text-[13px] text-foreground mb-1.5">Email *</label>
                      <input id="user-email" type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        aria-describedby={formError ? 'user-form-error' : undefined}
                        aria-required="true"
                        className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                    </div>
                    <div>
                      <label htmlFor="user-phone" className="block text-[13px] text-foreground mb-1.5">Điện thoại</label>
                      <input id="user-phone" type="tel" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                    </div>
                  </div>
                  {modalMode === 'create' && (
                    <div>
                      <label htmlFor="user-password" className="block text-[13px] text-foreground mb-1.5">Mật khẩu *</label>
                      <input id="user-password" type="password" value={formData.password || ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Tối thiểu 8 ký tự..."
                        aria-describedby={formError ? 'user-form-error' : undefined}
                        aria-required="true"
                        className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="user-dept" className="block text-[13px] text-foreground mb-1.5">Phòng ban *</label>
                      <select id="user-dept" value={formData.departmentId || ''} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                        aria-required="true"
                        className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                        {departments.filter((d) => d.parentId).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="user-position" className="block text-[13px] text-foreground mb-1.5">Chức vụ</label>
                      <input id="user-position" type="text" value={formData.position || ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label id="user-roles-label" className="block text-[13px] text-foreground mb-2">Vai trò *</label>
                    <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="user-roles-label">
                      {roles.map((r) => (
                        <label key={r.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-accent/30 cursor-pointer transition-colors">
                          <input type="checkbox" checked={formData.roleIds?.includes(r.id) || false}
                            onChange={(e) => {
                              const current = formData.roleIds || [];
                              setFormData({
                                ...formData,
                                roleIds: e.target.checked ? [...current, r.id] : current.filter((id) => id !== r.id),
                              });
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                          <span className="text-[12px] text-foreground">{r.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                  <button onClick={() => setModalMode(null)} className="px-4 py-2 rounded-xl text-[13px] text-muted-foreground hover:bg-accent transition-colors">Hủy</button>
                  <button onClick={handleSave} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-[13px] hover:opacity-90 transition-all active:scale-[0.98]"
                    style={{ boxShadow: 'var(--shadow-sm)' }}>
                    {modalMode === 'create' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
                  </button>
                </div>
              </>
            )}

            {/* Password Reset Modal */}
            {modalMode === 'password' && selectedUser && (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h3 id="user-modal-title" style={{ fontFamily: "var(--font-display)" }}>Đặt lại mật khẩu - {selectedUser.fullName}</h3>
                  <button onClick={() => setModalMode(null)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" aria-label="Đóng"><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
                <div className="p-6 space-y-4">
                  {formError && <div id="password-form-error" role="alert" className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-[13px] text-red-600 dark:text-red-400"><AlertCircle className="w-4 h-4" /> {formError}</div>}
                  {formSuccess && <div role="status" className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[13px] text-emerald-600 dark:text-emerald-400"><Check className="w-4 h-4" /> {formSuccess}</div>}
                  <div>
                    <label htmlFor="new-password" className="block text-[13px] text-foreground mb-1.5">Mật khẩu mới</label>
                    <input id="new-password" type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setFormError(''); }}
                      placeholder="Tối thiểu 8 ký tự, chữ hoa, thường, số, ký tự đặc biệt"
                      aria-describedby={formError ? 'password-form-error' : undefined}
                      className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                  <button onClick={() => setModalMode(null)} className="px-4 py-2 rounded-xl text-[13px] text-muted-foreground hover:bg-accent transition-colors">Hủy</button>
                  <button onClick={handleResetPassword} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-[13px] hover:opacity-90 transition-all active:scale-[0.98]"
                    style={{ boxShadow: 'var(--shadow-sm)' }}>Đặt lại mật khẩu</button>
                </div>
              </>
            )}

            {/* Login History Modal */}
            {modalMode === 'history' && selectedUser && (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h3 id="user-modal-title" style={{ fontFamily: "var(--font-display)" }}>Lịch sử đăng nhập - {selectedUser.fullName}</h3>
                  <button onClick={() => setModalMode(null)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" aria-label="Đóng"><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
                <div className="p-6">
                  {selectedUser.loginHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Monitor className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-[13px] text-muted-foreground">Chưa có lịch sử đăng nhập</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedUser.loginHistory.map((record, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/20">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${record.success ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                            {record.success ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-red-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-[13px] text-foreground">{record.success ? 'Đăng nhập thành công' : 'Đăng nhập thất bại'}</p>
                            <p className="text-[11px] text-muted-foreground">{record.device} | IP: {record.ip}</p>
                          </div>
                          <span className="text-[11px] text-muted-foreground">{new Date(record.time).toLocaleString('vi-VN')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sort hint for aria-describedby */}
      <span id="user-sort-hint" className="sr-only">Nhấn Enter hoặc Space để sắp xếp cột, Escape để xóa sắp xếp</span>

      {/* Sort announcement live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {userSortAnnouncement}
      </div>

      {/* Column order announcement live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {userColOrder.announcement}
      </div>
    </PageTransition>
  );
}