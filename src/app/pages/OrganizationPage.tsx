import { Plus, Pencil, Trash2, X, Check, AlertCircle, ChevronRight, ChevronDown, Building2, Users, FolderTree } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useFocusReturn } from '../hooks/useFocusReturn';

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  parentId?: string;
  headId: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

interface User {
  id: string;
  fullName: string;
  avatar: string;
  email: string;
  position: string;
  departmentId: string;
  isActive: boolean;
}

const initialDepts: Department[] = [
  { id: 'dept-root', name: 'UBND Tỉnh', code: 'UBND', description: 'Ủy ban nhân dân tỉnh', headId: 'user-1', order: 1, isActive: true, createdAt: '2023-01-01' },
  { id: 'dept-1', name: 'Văn phòng', code: 'VP', description: 'Văn phòng điều hành', parentId: 'dept-root', headId: 'user-2', order: 1, isActive: true, createdAt: '2023-01-01' },
  { id: 'dept-2', name: 'Phòng Tổ chức - Hành chính', code: 'TCHC', description: 'Quản lý tổ chức bộ máy', parentId: 'dept-root', headId: 'user-3', order: 2, isActive: true, createdAt: '2023-01-01' },
  { id: 'dept-3', name: 'Phòng Kế hoạch - Tài chính', code: 'KHTC', description: 'Lập kế hoạch và quản lý tài chính', parentId: 'dept-root', headId: 'user-4', order: 3, isActive: true, createdAt: '2023-01-01' },
  { id: 'dept-4', name: 'Phòng Pháp chế', code: 'PC', description: 'Tham mưu pháp lý', parentId: 'dept-root', headId: null, order: 4, isActive: true, createdAt: '2023-02-01' },
  { id: 'dept-5', name: 'Phòng Văn thư', code: 'VT', description: 'Quản lý văn bản và lưu trữ', parentId: 'dept-1', headId: 'user-5', order: 1, isActive: true, createdAt: '2023-03-01' },
  { id: 'dept-6', name: 'Phòng Công nghệ thông tin', code: 'CNTT', description: 'Quản lý hệ thống CNTT', parentId: 'dept-1', headId: 'user-6', order: 2, isActive: true, createdAt: '2023-03-01' },
];

const users: User[] = [
  { id: 'user-1', fullName: 'Nguyễn Văn An', avatar: 'NVA', email: 'an@ubnd.vn', position: 'Chủ tịch UBND', departmentId: 'dept-root', isActive: true },
  { id: 'user-2', fullName: 'Trần Thị Bình', avatar: 'TTB', email: 'binh@ubnd.vn', position: 'Chánh Văn phòng', departmentId: 'dept-1', isActive: true },
  { id: 'user-3', fullName: 'Lê Văn Cường', avatar: 'LVC', email: 'cuong@ubnd.vn', position: 'Trưởng phòng TCHC', departmentId: 'dept-2', isActive: true },
  { id: 'user-4', fullName: 'Phạm Thị Dung', avatar: 'PTD', email: 'dung@ubnd.vn', position: 'Trưởng phòng KHTC', departmentId: 'dept-3', isActive: true },
  { id: 'user-5', fullName: 'Hoàng Văn Đức', avatar: 'HVD', email: 'duc@ubnd.vn', position: 'Trưởng phòng VT', departmentId: 'dept-5', isActive: true },
  { id: 'user-6', fullName: 'Vũ Minh Hiếu', avatar: 'VMH', email: 'hieu@ubnd.vn', position: 'Trưởng phòng CNTT', departmentId: 'dept-6', isActive: true },
  { id: 'user-7', fullName: 'Đỗ Thị Lan', avatar: 'DTL', email: 'lan@ubnd.vn', position: 'Chuyên viên TCHC', departmentId: 'dept-2', isActive: true },
  { id: 'user-8', fullName: 'Bùi Văn Nam', avatar: 'BVN', email: 'nam@ubnd.vn', position: 'Chuyên viên KHTC', departmentId: 'dept-3', isActive: true },
  { id: 'user-9', fullName: 'Ngô Thị Mai', avatar: 'NTM', email: 'mai@ubnd.vn', position: 'Văn thư', departmentId: 'dept-5', isActive: true },
  { id: 'user-10', fullName: 'Trương Văn Quân', avatar: 'TVQ', email: 'quan@ubnd.vn', position: 'Kỹ thuật viên', departmentId: 'dept-6', isActive: true },
];

export function OrganizationPage() {
  const { hasPermission } = useAuth();
  const [depts, setDepts] = useState<Department[]>(initialDepts);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(depts.map((d) => d.id)));
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<Partial<Department>>({});
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const canManage = hasPermission('org.manage');
  const modalRef = useFocusTrap<HTMLDivElement>(showModal);

  // Focus return for modals
  useFocusReturn(showModal);
  useFocusReturn(!!deleteConfirm);

  const [focusedDeptId, setFocusedDeptId] = useState<string | null>(null);
  const treeRef = useRef<HTMLUListElement>(null);
  const typeAheadRef = useRef<{ buffer: string; timer: ReturnType<typeof setTimeout> | null }>({ buffer: '', timer: null });

  // Escape key handler for modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteConfirm) setDeleteConfirm(null);
        else if (showModal) setShowModal(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showModal, deleteConfirm]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const getChildren = useCallback((parentId: string) => depts.filter((d) => d.parentId === parentId).sort((a, b) => a.order - b.order), [depts]);
  const getDeptUsers = (deptId: string) => users.filter((u) => u.departmentId === deptId && u.isActive);
  const getHeadName = (headId: string | null) => {
    if (!headId) return 'Chưa chỉ định';
    return users.find((u) => u.id === headId)?.fullName || 'Không xác định';
  };

  // Build flat list of visible tree items for keyboard navigation
  const visibleTreeItems = useMemo(() => {
    const items: Department[] = [];
    const walk = (parentId: string | undefined) => {
      const children = parentId
        ? depts.filter((d) => d.parentId === parentId).sort((a, b) => a.order - b.order)
        : depts.filter((d) => !d.parentId);
      for (const dept of children) {
        items.push(dept);
        if (expandedIds.has(dept.id)) {
          walk(dept.id);
        }
      }
    };
    walk(undefined);
    return items;
  }, [depts, expandedIds]);

  const handleTreeKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentIndex = visibleTreeItems.findIndex((d) => d.id === focusedDeptId);
    const currentDept = currentIndex >= 0 ? visibleTreeItems[currentIndex] : null;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const nextIdx = Math.min(currentIndex + 1, visibleTreeItems.length - 1);
        const next = visibleTreeItems[Math.max(0, nextIdx)];
        if (next) { setFocusedDeptId(next.id); setSelectedDept(next); }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prevIdx = Math.max(currentIndex - 1, 0);
        const prev = visibleTreeItems[prevIdx];
        if (prev) { setFocusedDeptId(prev.id); setSelectedDept(prev); }
        break;
      }
      case 'ArrowRight': {
        e.preventDefault();
        if (!currentDept) break;
        const hasKids = getChildren(currentDept.id).length > 0;
        if (hasKids && !expandedIds.has(currentDept.id)) {
          toggleExpand(currentDept.id);
        } else if (hasKids && expandedIds.has(currentDept.id)) {
          const firstChild = getChildren(currentDept.id)[0];
          if (firstChild) { setFocusedDeptId(firstChild.id); setSelectedDept(firstChild); }
        }
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        if (!currentDept) break;
        const hasKids = getChildren(currentDept.id).length > 0;
        if (hasKids && expandedIds.has(currentDept.id)) {
          toggleExpand(currentDept.id);
        } else if (currentDept.parentId) {
          const parent = depts.find((d) => d.id === currentDept.parentId);
          if (parent) { setFocusedDeptId(parent.id); setSelectedDept(parent); }
        }
        break;
      }
      case 'Home': {
        e.preventDefault();
        const first = visibleTreeItems[0];
        if (first) { setFocusedDeptId(first.id); setSelectedDept(first); }
        break;
      }
      case 'End': {
        e.preventDefault();
        const last = visibleTreeItems[visibleTreeItems.length - 1];
        if (last) { setFocusedDeptId(last.id); setSelectedDept(last); }
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (currentDept) {
          const hasKids = getChildren(currentDept.id).length > 0;
          if (hasKids) toggleExpand(currentDept.id);
        }
        break;
      }
      default: {
        // Type-ahead: single printable character jumps to matching node
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          const ta = typeAheadRef.current;
          if (ta.timer) clearTimeout(ta.timer);
          ta.buffer += e.key.toLowerCase();
          ta.timer = setTimeout(() => { ta.buffer = ''; }, 500);

          // Search from item after current, then wrap around
          const startIdx = Math.max(0, currentIndex) + 1;
          const searchOrder = [
            ...visibleTreeItems.slice(startIdx),
            ...visibleTreeItems.slice(0, startIdx),
          ];
          const match = searchOrder.find((d) => d.name.toLowerCase().startsWith(ta.buffer));
          if (match) { setFocusedDeptId(match.id); setSelectedDept(match); }
        }
        break;
      }
    }
  }, [focusedDeptId, visibleTreeItems, expandedIds, depts, getChildren, toggleExpand]);

  // Scroll focused tree item into view
  useEffect(() => {
    if (!focusedDeptId || !treeRef.current) return;
    const el = treeRef.current.querySelector(`[data-tree-id="${focusedDeptId}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [focusedDeptId]);

  const openCreate = (parentId: string) => {
    setFormData({ name: '', code: '', description: '', parentId, order: getChildren(parentId).length + 1, isActive: true });
    setFormError('');
    setFormSuccess('');
    setModalMode('create');
    setShowModal(true);
  };

  const openEdit = (dept: Department) => {
    setFormData({ ...dept });
    setFormError('');
    setFormSuccess('');
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSave = () => {
    setFormError('');
    if (!formData.name?.trim()) { setFormError('Tên phòng ban không được để trống'); return; }
    if (!formData.code?.trim()) { setFormError('Mã phòng ban không được để trống'); return; }

    if (modalMode === 'create') {
      const exists = depts.some((d) => d.code === formData.code);
      if (exists) { setFormError('Mã phòng ban đã tồn tại'); return; }
      const newDept: Department = {
        id: 'dept-' + Date.now(),
        name: formData.name!,
        code: formData.code!,
        description: formData.description || '',
        parentId: formData.parentId || 'dept-root',
        headId: formData.headId || null,
        order: formData.order || 1,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setDepts([...depts, newDept]);
      toast.success('Thêm phòng ban thành công!');
    } else {
      setDepts(depts.map((d) => d.id === formData.id ? { ...d, ...formData } as Department : d));
      toast.success('Cập nhật thành công!');
    }
    setTimeout(() => setShowModal(false), 500);
  };

  const handleDelete = (deptId: string) => {
    const children = getChildren(deptId);
    const deptUsers = getDeptUsers(deptId);
    if (children.length > 0 || deptUsers.length > 0) {
      setFormError('Không thể xóa phòng ban đang có phòng ban con hoặc nhân sự');
      setDeleteConfirm(null);
      return;
    }
    setDepts(depts.filter((d) => d.id !== deptId));
    setDeleteConfirm(null);
    if (selectedDept?.id === deptId) setSelectedDept(null);
    toast.success('Xóa phòng ban thành công!');
  };

  const renderTree = (parentId: string, level: number = 0) => {
    const children = getChildren(parentId);
    return children.map((dept) => {
      const hasChildren = getChildren(dept.id).length > 0;
      const isExpanded = expandedIds.has(dept.id);
      const isSelected = selectedDept?.id === dept.id;
      const memberCount = getDeptUsers(dept.id).length;

      return (
        <li key={dept.id} role="treeitem" id={`tree-node-${dept.id}`} aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isSelected}>
          <div
            data-tree-id={dept.id}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors group ${
              isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-accent/50'
            } ${focusedDeptId === dept.id ? 'ring-2 ring-primary/40' : ''}`}
            style={{ paddingLeft: `${level * 24 + 12}px` }}
            onClick={() => setSelectedDept(dept)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpand(dept.id); }}
              className="w-5 h-5 flex items-center justify-center shrink-0"
              aria-expanded={hasChildren ? isExpanded : undefined}
              aria-label={hasChildren ? `${isExpanded ? 'Thu gọn' : 'Mở rộng'} ${dept.name}` : undefined}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />
              ) : <span className="w-4" />}
            </button>
            <Building2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-[13px] flex-1 truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
              {dept.name}
            </span>
            <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{memberCount}</span>
            {canManage && (
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); openCreate(dept.id); }}
                  className="p-1 rounded hover:bg-accent" title="Thêm con" aria-label={`Thêm đơn vị con vào ${dept.name}`}><Plus className="w-3.5 h-3.5 text-muted-foreground" /></button>
                <button onClick={(e) => { e.stopPropagation(); openEdit(dept); }}
                  className="p-1 rounded hover:bg-accent" title="Sửa" aria-label={`Chỉnh sửa phòng ban ${dept.name}`}><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                {dept.parentId && (
                  <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(dept.id); }}
                    className="p-1 rounded hover:bg-red-50" title="Xóa" aria-label={`Xóa phòng ban ${dept.name}`}><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                )}
              </div>
            )}
          </div>
          {hasChildren && isExpanded && <ul role="group" className="list-none">{renderTree(dept.id, level + 1)}</ul>}
        </li>
      );
    });
  };

  const deptMembers = selectedDept ? getDeptUsers(selectedDept.id) : [];

  return (
    <PageTransition>
      <Header title="Cơ cấu tổ chức" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Tree */}
          <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-primary" />
                <h3 className="text-foreground" style={{ fontFamily: "var(--font-display)" }}>Sơ đồ tổ chức</h3>
              </div>
              {canManage && (
                <button onClick={() => openCreate('dept-root')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-[12px] hover:opacity-90 transition-all active:scale-[0.98]"
                  style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <Plus className="w-3.5 h-3.5" /> Thêm
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {/* Root */}
              <ul role="tree" aria-label="Sơ đồ tổ chức" className="list-none" ref={treeRef} onKeyDown={handleTreeKeyDown} tabIndex={0}
                aria-activedescendant={focusedDeptId ? `tree-node-${focusedDeptId}` : undefined}
                style={{ outline: 'none' }}>
              {depts.filter((d) => !d.parentId).map((root) => (
                <li key={root.id} role="treeitem" id={`tree-node-${root.id}`} aria-expanded={expandedIds.has(root.id)} aria-selected={selectedDept?.id === root.id}>
                  <div
                    data-tree-id={root.id}
                    className={`flex items-center gap-2 py-2.5 px-3 rounded-lg cursor-pointer transition-colors ${
                      selectedDept?.id === root.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-accent/50'
                    } ${focusedDeptId === root.id ? 'ring-2 ring-primary/40' : ''}`}
                    onClick={() => setSelectedDept(root)}
                  >
                    <button onClick={(e) => { e.stopPropagation(); toggleExpand(root.id); }} className="w-5 h-5 flex items-center justify-center"
                      aria-expanded={expandedIds.has(root.id)}
                      aria-label={`${expandedIds.has(root.id) ? 'Thu gọn' : 'Mở rộng'} ${root.name}`}>
                      {expandedIds.has(root.id) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    <Building2 className="w-4.5 h-4.5 text-primary" />
                    <span className="text-[13px] text-foreground">{root.name}</span>
                  </div>
                  {expandedIds.has(root.id) && <ul role="group" className="list-none">{renderTree(root.id, 1)}</ul>}
                </li>
              ))}
              </ul>
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-xs)' }}>
            {selectedDept ? (
              <>
                <div className="px-6 py-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-foreground" style={{ fontFamily: "var(--font-display)" }}>{selectedDept.name}</h3>
                      <p className="text-[13px] text-muted-foreground mt-0.5">Mã: {selectedDept.code} | {selectedDept.description}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] ${selectedDept.isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                      {selectedDept.isActive ? 'Hoạt động' : 'Ngưng hoạt động'}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 p-6 border-b border-border">
                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
                    <p className="text-[20px] text-blue-700 dark:text-blue-400" style={{ fontFamily: "var(--font-display)" }}>{deptMembers.length}</p>
                    <p className="text-[12px] text-blue-600/70 dark:text-blue-400/70">Nhân sự</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-center">
                    <p className="text-[20px] text-violet-700 dark:text-violet-400" style={{ fontFamily: "var(--font-display)" }}>{getChildren(selectedDept.id).length}</p>
                    <p className="text-[12px] text-violet-600/70 dark:text-violet-400/70">Phòng ban con</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
                    <p className="text-[13px] text-emerald-700 dark:text-emerald-400 truncate">{getHeadName(selectedDept.headId)}</p>
                    <p className="text-[12px] text-emerald-600/70 dark:text-emerald-400/70">Trưởng phòng</p>
                  </div>
                </div>

                {/* Members */}
                <div className="flex-1 overflow-y-auto">
                  <div className="px-6 py-3 border-b border-border">
                    <h4 className="text-[14px] text-foreground flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                      <Users className="w-4 h-4 text-primary" />
                      Danh sách nhân sự ({deptMembers.length})
                    </h4>
                  </div>
                  {deptMembers.length > 0 ? (
                    <div className="divide-y divide-border/50">
                      {deptMembers.map((u) => (
                        <div key={u.id} className="flex items-center gap-3 px-6 py-3 hover:bg-accent/20 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-blue-400 flex items-center justify-center text-white text-[11px] shrink-0">
                            {u.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-foreground truncate">{u.fullName}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{u.position}</p>
                          </div>
                          <span className="text-[11px] text-muted-foreground">{u.email}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-primary/30" />
                      </div>
                      <p className="text-[13px] text-muted-foreground" style={{ fontFamily: "var(--font-display)" }}>Chưa có nhân sự</p>
                      <p className="text-[12px] text-muted-foreground/40 mt-0.5">Thêm nhân viên vào phòng ban này</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-7 h-7 text-primary/30" />
                  </div>
                  <p className="text-[15px] text-foreground" style={{ fontFamily: "var(--font-display)" }}>Chọn phòng ban</p>
                  <p className="text-[13px] text-muted-foreground/50 mt-1">Chọn phòng ban từ sơ đồ bên trái để xem chi tiết</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="org-modal-title" className="bg-card rounded-2xl border border-border w-full max-w-md" onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: 'var(--shadow-xl)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 id="org-modal-title" style={{ fontFamily: "var(--font-display)" }}>{modalMode === 'create' ? 'Thêm phòng ban' : 'Chỉnh sửa phòng ban'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" aria-label="Đóng"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <div id="org-form-error" role="alert" className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-lg text-[13px] text-red-600 dark:text-red-400"><AlertCircle className="w-4 h-4" /> {formError}</div>}
              {formSuccess && <div role="status" className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-[13px] text-emerald-600 dark:text-emerald-400"><Check className="w-4 h-4" /> {formSuccess}</div>}
              <div>
                <label htmlFor="org-name" className="block text-[13px] text-foreground mb-1.5">Tên phòng ban *</label>
                <input id="org-name" type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  aria-describedby={formError ? 'org-form-error' : undefined}
                  className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
              </div>
              <div>
                <label htmlFor="org-code" className="block text-[13px] text-foreground mb-1.5">Mã phòng ban *</label>
                <input id="org-code" type="text" value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  disabled={modalMode === 'edit'}
                  aria-describedby={formError ? 'org-form-error' : undefined}
                  className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none disabled:opacity-50" />
              </div>
              <div>
                <label htmlFor="org-desc" className="block text-[13px] text-foreground mb-1.5">Mô tả</label>
                <textarea id="org-desc" rows={2} value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none resize-none" />
              </div>
              <div>
                <label htmlFor="org-parent" className="block text-[13px] text-foreground mb-1.5">Phòng ban cha</label>
                <select id="org-parent" value={formData.parentId || ''} onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                  {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="org-head" className="block text-[13px] text-foreground mb-1.5">Trưởng phòng</label>
                <select id="org-head" value={formData.headId || ''} onChange={(e) => setFormData({ ...formData, headId: e.target.value || null })}
                  className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                  <option value="">-- Chưa chỉ định --</option>
                  {users.filter((u) => u.isActive).map((u) => <option key={u.id} value={u.id}>{u.fullName} - {u.position}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-[13px] text-muted-foreground hover:bg-accent transition-colors">Hủy</button>
              <button onClick={handleSave} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-[13px] hover:opacity-90 transition-all active:scale-[0.98]"
                style={{ boxShadow: 'var(--shadow-sm)' }}>
                {modalMode === 'create' ? 'Thêm' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Xóa phòng ban?"
        message="Hành động này không thể hoàn tác. Phòng ban sẽ bị xóa vĩnh viễn."
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => { setDeleteConfirm(null); setFormError(''); }}
      />
    </PageTransition>
  );
}