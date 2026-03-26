import { useColumnResize } from '../hooks/useColumnResize';
import { useColumnOrder } from '../hooks/useColumnOrder';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useFocusReturn } from '../hooks/useFocusReturn';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useColumnVisibility, type ColumnDef } from '../hooks/useColumnVisibility';
import { ColumnToggle } from '../components/ColumnToggle';
import { ResizeHandle } from '../components/ResizeHandle';
import { ResetWidthsButton } from '../components/ResetWidthsButton';
import { DraggableHeader } from '../components/DraggableHeader';
import { Plus, Pencil, Trash2, X, Check, AlertCircle, FolderCog, FileText, Tag, AlertTriangle, ShieldAlert, BookOpen, Building, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryItem {
  id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  usageCount: number;
}

interface CategoryGroup {
  id: string;
  name: string;
  icon: typeof FileText;
  color: string;
  bgColor: string;
  items: CategoryItem[];
}

const initialCategories: CategoryGroup[] = [
  {
    id: 'doc-type', name: 'Loại văn bản', icon: FileText, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    items: [
      { id: 'dt-1', name: 'Công văn', code: 'CV', description: 'Văn bản hành chính thông thường', isActive: true, usageCount: 245 },
      { id: 'dt-2', name: 'Quyết định', code: 'QD', description: 'Văn bản quyết định', isActive: true, usageCount: 89 },
      { id: 'dt-3', name: 'Báo cáo', code: 'BC', description: 'Văn bản báo cáo', isActive: true, usageCount: 156 },
      { id: 'dt-4', name: 'Kế hoạch', code: 'KH', description: 'Văn bản kế hoạch', isActive: true, usageCount: 67 },
      { id: 'dt-5', name: 'Thông báo', code: 'TB', description: 'Văn bản thông báo', isActive: true, usageCount: 198 },
      { id: 'dt-6', name: 'Tờ trình', code: 'TTr', description: 'Văn bản tờ trình', isActive: true, usageCount: 43 },
      { id: 'dt-7', name: 'Biên bản', code: 'BB', description: 'Biên bản họp, làm việc', isActive: true, usageCount: 72 },
      { id: 'dt-8', name: 'Hướng dẫn', code: 'HD', description: 'Văn bản hướng dẫn nghiệp vụ', isActive: true, usageCount: 34 },
      { id: 'dt-9', name: 'Chỉ thị', code: 'CT', description: 'Văn bản chỉ thị', isActive: false, usageCount: 0 },
    ],
  },
  {
    id: 'doc-field', name: 'Lĩnh vực', icon: Tag, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
    items: [
      { id: 'df-1', name: 'Hành chính', code: 'HC', description: 'Lĩnh vực hành chính', isActive: true, usageCount: 312 },
      { id: 'df-2', name: 'Tài chính - Ngân sách', code: 'TCNS', description: 'Lĩnh vực tài chính', isActive: true, usageCount: 145 },
      { id: 'df-3', name: 'Giáo dục', code: 'GD', description: 'Lĩnh vực giáo dục đào tạo', isActive: true, usageCount: 89 },
      { id: 'df-4', name: 'Y tế', code: 'YT', description: 'Lĩnh vực y tế sức khỏe', isActive: true, usageCount: 76 },
      { id: 'df-5', name: 'Công nghệ thông tin', code: 'CNTT', description: 'Lĩnh vực CNTT', isActive: true, usageCount: 54 },
      { id: 'df-6', name: 'Tài nguyên - Môi trường', code: 'TNMT', description: 'Lĩnh vực TN&MT', isActive: true, usageCount: 67 },
      { id: 'df-7', name: 'Kinh tế', code: 'KT', description: 'Lĩnh vực kinh tế', isActive: true, usageCount: 98 },
    ],
  },
  {
    id: 'urgency', name: 'Mức độ khẩn', icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    items: [
      { id: 'ug-1', name: 'Thường', code: 'THUONG', description: 'Mức độ bình thường', isActive: true, usageCount: 890 },
      { id: 'ug-2', name: 'Khẩn', code: 'KHAN', description: 'Cần xử lý nhanh', isActive: true, usageCount: 234 },
      { id: 'ug-3', name: 'Hỏa tốc', code: 'HOATOC', description: 'Cần xử lý ngay lập tức', isActive: true, usageCount: 45 },
      { id: 'ug-4', name: 'Thượng khẩn', code: 'THUONGKHAN', description: 'Cấp bách nhất', isActive: true, usageCount: 12 },
    ],
  },
  {
    id: 'security', name: 'Mức độ mật', icon: ShieldAlert, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/30',
    items: [
      { id: 'sc-1', name: 'Thường', code: 'THUONG', description: 'Không hạn chế', isActive: true, usageCount: 1100 },
      { id: 'sc-2', name: 'Mật', code: 'MAT', description: 'Hạn chế truy cập', isActive: true, usageCount: 45 },
      { id: 'sc-3', name: 'Tối mật', code: 'TOIMAT', description: 'Rất hạn chế', isActive: true, usageCount: 8 },
      { id: 'sc-4', name: 'Tuyệt mật', code: 'TUYETMAT', description: 'Chỉ người có thẩm quyền', isActive: true, usageCount: 2 },
    ],
  },
  {
    id: 'positions', name: 'Chức danh', icon: BookOpen, color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-50 dark:bg-violet-900/30',
    items: [
      { id: 'ps-1', name: 'Giám đốc', code: 'GD', description: 'Giám đốc cơ quan', isActive: true, usageCount: 1 },
      { id: 'ps-2', name: 'Phó Giám đốc', code: 'PGD', description: 'Phó Giám đốc', isActive: true, usageCount: 2 },
      { id: 'ps-3', name: 'Trưởng phòng', code: 'TP', description: 'Trưởng phòng ban', isActive: true, usageCount: 8 },
      { id: 'ps-4', name: 'Phó Trưởng phòng', code: 'PTP', description: 'Phó Trưởng phòng', isActive: true, usageCount: 5 },
      { id: 'ps-5', name: 'Chuyên viên chính', code: 'CVC', description: 'Chuyên viên cấp cao', isActive: true, usageCount: 12 },
      { id: 'ps-6', name: 'Chuyên viên', code: 'CV', description: 'Chuyên viên', isActive: true, usageCount: 25 },
      { id: 'ps-7', name: 'Cán sự', code: 'CS', description: 'Cán sự', isActive: true, usageCount: 8 },
    ],
  },
  {
    id: 'contacts', name: 'Sổ danh bạ cơ quan', icon: Building, color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-50 dark:bg-cyan-900/30',
    items: [
      { id: 'ct-1', name: 'UBND Tỉnh', code: 'UBND-T', description: 'Ủy ban nhân dân tỉnh', isActive: true, usageCount: 156 },
      { id: 'ct-2', name: 'Sở Nội vụ', code: 'SNV', description: 'Sở Nội vụ tỉnh', isActive: true, usageCount: 89 },
      { id: 'ct-3', name: 'Sở Tài chính', code: 'STC', description: 'Sở Tài chính tỉnh', isActive: true, usageCount: 123 },
      { id: 'ct-4', name: 'Sở GD&ĐT', code: 'SGDDT', description: 'Sở Giáo dục và Đào tạo', isActive: true, usageCount: 67 },
      { id: 'ct-5', name: 'Sở Y tế', code: 'SYT', description: 'Sở Y tế tỉnh', isActive: true, usageCount: 78 },
      { id: 'ct-6', name: 'Sở KH&ĐT', code: 'SKHDT', description: 'Sở Kế hoạch và Đầu tư', isActive: true, usageCount: 54 },
      { id: 'ct-7', name: 'Bộ Tài chính', code: 'BTC', description: 'Bộ Tài chính', isActive: true, usageCount: 34 },
      { id: 'ct-8', name: 'Bộ Nội v', code: 'BNV', description: 'Bộ Nội vụ', isActive: true, usageCount: 28 },
    ],
  },
];

export function CategoriesPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('category.manage');
  const [categories, setCategories] = useState<CategoryGroup[]>(initialCategories);
  const [activeGroupId, setActiveGroupId] = useState(categories[0].id);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<Partial<CategoryItem>>({});
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedCatIds, setSelectedCatIds] = useState<Set<string>>(new Set());

  // Focus return for modals
  useFocusReturn(showModal);
  useFocusReturn(!!deleteConfirmId);

  // Column visibility
  type CatColKey = 'code' | 'name' | 'description' | 'usage' | 'status' | 'actions';
  const catColDefs = useMemo<ColumnDef<CatColKey>[]>(() => [
    { key: 'code', label: 'Mã' },
    { key: 'name', label: 'Tên danh mục', required: true },
    { key: 'description', label: 'Mô tả' },
    { key: 'usage', label: 'Sử dụng' },
    { key: 'status', label: 'Trạng thái' },
    ...(canManage ? [{ key: 'actions' as CatColKey, label: 'Thao tác', required: true as const }] : []),
  ], [canManage]);
  const catColVis = useColumnVisibility<CatColKey>({ storageKey: 'categories', columns: catColDefs });

  const catResizeCols = useMemo(() => ['code', 'name', 'description', 'usage', 'status', 'actions'] as CatColKey[], []);
  const catColResize = useColumnResize<CatColKey>({
    storageKey: 'categories',
    columns: catResizeCols,
    config: {
      code: { defaultWidth: 100, minWidth: 60, maxWidth: 160 },
      name: { defaultWidth: 200, minWidth: 120, maxWidth: 350 },
      description: { defaultWidth: 250, minWidth: 140, maxWidth: 400 },
      usage: { defaultWidth: 100, minWidth: 60, maxWidth: 160 },
      status: { defaultWidth: 120, minWidth: 80, maxWidth: 180 },
      actions: { defaultWidth: 120, minWidth: 80, maxWidth: 180 },
    },
    defaultMinWidth: 60,
  });
  const catTableRef = useRef<HTMLTableElement>(null);

  // Column order (drag-and-drop reorder)
  const defaultCatColOrder = useMemo<CatColKey[]>(() => ['code', 'name', 'description', 'usage', 'status', 'actions'], []);
  const catColLabels = useMemo<Record<CatColKey, string>>(() => ({
    code: 'Mã', name: 'Tên danh mục', description: 'Mô tả',
    usage: 'Sử dụng', status: 'Trạng thái', actions: 'Thao tác',
  }), []);
  const catColOrder = useColumnOrder<CatColKey>({ storageKey: 'categories', defaultOrder: defaultCatColOrder, labels: catColLabels });
  const catOrderedVisibleCols = useMemo(() => {
    return catColOrder.order.filter(k => {
      if (k === 'name') return true;
      if (k === 'actions') return canManage;
      return catColVis.isVisible(k);
    });
  }, [catColOrder.order, catColVis, canManage]);

  const activeGroup = categories.find((g) => g.id === activeGroupId)!;

  // Row selection helpers
  const toggleCatSelect = useCallback((id: string) => {
    setSelectedCatIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }, []);
  const toggleCatSelectAll = useCallback(() => {
    setSelectedCatIds(prev => prev.size === activeGroup.items.length ? new Set() : new Set(activeGroup.items.map(i => i.id)));
  }, [activeGroup]);
  const handleBulkCatToggle = useCallback(() => {
    setCategories(prev => prev.map(g => g.id === activeGroupId ? { ...g, items: g.items.map(i => selectedCatIds.has(i.id) ? { ...i, isActive: !i.isActive } : i) } : g));
    toast.success(`Đã đổi trạng thái ${selectedCatIds.size} mục`);
    setSelectedCatIds(new Set());
  }, [selectedCatIds, activeGroupId]);
  const handleBulkCatDelete = useCallback(() => {
    const deletable = activeGroup.items.filter(i => selectedCatIds.has(i.id) && i.usageCount === 0);
    if (deletable.length === 0) { toast.error('Không thể xóa: tất cả mục đang được sử dụng'); return; }
    setCategories(prev => prev.map(g => g.id === activeGroupId ? { ...g, items: g.items.filter(i => !selectedCatIds.has(i.id) || i.usageCount > 0) } : g));
    toast.success(`Đã xóa ${deletable.length} mục (bỏ qua ${selectedCatIds.size - deletable.length} mục đang sử dụng)`);
    setSelectedCatIds(new Set());
  }, [selectedCatIds, activeGroupId, activeGroup]);

  // Clear selection when switching groups
  useEffect(() => { setSelectedCatIds(new Set()); }, [activeGroupId]);

  const openCreate = () => {
    setFormData({ name: '', code: '', description: '', isActive: true });
    setFormError('');
    setFormSuccess('');
    setModalMode('create');
    setShowModal(true);
  };

  const openEdit = (item: CategoryItem) => {
    setFormData({ ...item });
    setFormError('');
    setFormSuccess('');
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSave = () => {
    setFormError('');
    if (!formData.name?.trim()) { setFormError('Tên không được để trống'); return; }
    if (!formData.code?.trim()) { setFormError('Mã không được để trống'); return; }

    if (modalMode === 'create') {
      const exists = activeGroup.items.some((i) => i.code === formData.code);
      if (exists) { setFormError('Mã đã tồn tại trong danh mục này'); return; }
      const newItem: CategoryItem = {
        id: activeGroupId + '-' + Date.now(),
        name: formData.name!,
        code: formData.code!,
        description: formData.description || '',
        isActive: true,
        usageCount: 0,
      };
      setCategories(categories.map((g) => g.id === activeGroupId ? { ...g, items: [...g.items, newItem] } : g));
      toast.success('Thêm thành công!');
    } else {
      setCategories(categories.map((g) =>
        g.id === activeGroupId
          ? { ...g, items: g.items.map((i) => i.id === formData.id ? { ...i, ...formData } as CategoryItem : i) }
          : g
      ));
      toast.success('Cập nhật thành công!');
    }
    setTimeout(() => setShowModal(false), 500);
  };

  const handleToggleActive = (itemId: string) => {
    setCategories(categories.map((g) =>
      g.id === activeGroupId
        ? { ...g, items: g.items.map((i) => i.id === itemId ? { ...i, isActive: !i.isActive } : i) }
        : g
    ));
  };

  const handleDelete = (itemId: string) => {
    const item = activeGroup.items.find((i) => i.id === itemId);
    if (item && item.usageCount > 0) {
      setFormError('Không thể xóa danh mục đang được sử dụng. Chỉ có thể vô hiệu hóa.');
      setDeleteConfirmId(null);
      setTimeout(() => setFormError(''), 3000);
      return;
    }
    setCategories(categories.map((g) =>
      g.id === activeGroupId ? { ...g, items: g.items.filter((i) => i.id !== itemId) } : g
    ));
    setDeleteConfirmId(null);
    toast.success('Xóa thành công!');
  };

  const categoryModalRef = useFocusTrap<HTMLDivElement>(showModal);

  return (
    <PageTransition>
      <Header title="Quản lý Danh mục" />
      <div className="flex-1 overflow-y-auto p-6">
        {formError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl text-[13px] text-red-600 dark:text-red-400 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Category Groups Sidebar */}
          <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FolderCog className="w-4 h-4 text-primary" />
                <h3 className="text-foreground" style={{ fontFamily: "var(--font-display)" }}>Nhóm danh mục</h3>
              </div>
            </div>
            <div className="p-3 space-y-1">
              {categories.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setActiveGroupId(group.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    activeGroupId === group.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${group.bgColor} flex items-center justify-center`}>
                    <group.icon className={`w-4 h-4 ${group.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] truncate ${activeGroupId === group.id ? 'text-primary' : 'text-foreground'}`}>{group.name}</p>
                    <p className="text-[11px] text-muted-foreground">{group.items.length} mục</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Category Items */}
          <div className="lg:col-span-3 bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <activeGroup.icon className={`w-4 h-4 ${activeGroup.color}`} />
                <h3 className="text-foreground" style={{ fontFamily: "var(--font-display)" }}>{activeGroup.name}</h3>
                <span className="text-[12px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{activeGroup.items.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <ColumnToggle
                  isOpen={catColVis.isOpen}
                  setIsOpen={catColVis.setIsOpen}
                  columns={catColVis.columns}
                  isVisible={catColVis.isVisible}
                  toggle={catColVis.toggle}
                  resetAll={catColVis.resetAll}
                  showOnlyRequired={catColVis.showOnlyRequired}
                  hideAllOptional={catColVis.hideAllOptional}
                  allOptionalVisible={catColVis.allOptionalVisible}
                  allOptionalHidden={catColVis.allOptionalHidden}
                  handleMenuKeyDown={catColVis.handleMenuKeyDown}
                  visibleCount={catColVis.visibleCount}
                  totalCount={catColVis.totalCount}
                  hasHidden={catColVis.hasHidden}
                  announcement={catColVis.announcement}
                />
                {canManage && (
                  <button onClick={openCreate}
                    className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-[13px] hover:opacity-90 transition-all active:scale-[0.98]"
                    style={{ boxShadow: 'var(--shadow-sm)' }}>
                    <Plus className="w-4 h-4" /> Thêm mới
                  </button>
                )}
              </div>
            </div>

            {canManage && selectedCatIds.size > 0 && (
              <div className="px-4 py-2.5 border-b border-primary/20 bg-primary/5 flex items-center gap-3">
                <span className="text-[12px] text-primary">Đã chọn {selectedCatIds.size} mục</span>
                <button onClick={handleBulkCatToggle} className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-[11px] hover:opacity-90">
                  <AlertTriangle className="w-3.5 h-3.5" /> Đổi trạng thái
                </button>
                <button onClick={handleBulkCatDelete} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-[11px] hover:opacity-90">
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </button>
                <button onClick={() => setSelectedCatIds(new Set())} className="flex items-center gap-1 px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-accent rounded-lg ml-auto">
                  <X className="w-3.5 h-3.5" /> Bỏ chọn
                </button>
              </div>
            )}

            <div className="overflow-auto max-h-[65vh]">
              <table ref={catTableRef} className="w-full" style={{ tableLayout: 'fixed' }} aria-rowcount={activeGroup.items.length + 1}>
                <caption className="sr-only">Danh mục hệ thống</caption>
                <thead className="sticky-header">
                  <tr className="bg-accent/30">
                    {canManage && (
                      <th scope="col" role="columnheader" className="w-10 px-3 py-3">
                        <div className="cursor-pointer" role="checkbox" aria-checked={selectedCatIds.size === activeGroup.items.length && activeGroup.items.length > 0} aria-label="Chọn tất cả"
                          onClick={toggleCatSelectAll}>
                          {selectedCatIds.size === activeGroup.items.length && activeGroup.items.length > 0
                            ? <CheckSquare className="w-4 h-4 text-primary" />
                            : <Square className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </th>
                    )}
                    {catOrderedVisibleCols.map((key, idx) => {
                      const colIdx = idx + 1;
                      const headerLabels: Record<CatColKey, string> = {
                        code: 'Mã', name: 'Tên danh mục', description: 'Mô tả',
                        usage: 'Sử dụng', status: 'Trạng thái', actions: 'Thao tác',
                      };
                      if (key === 'actions') {
                        return <th key={key} scope="col" role="columnheader" aria-colindex={colIdx} className="text-center px-5 py-3 text-[12px] text-muted-foreground" style={catColResize.getHeaderProps(key).style}>Thao tác</th>;
                      }
                      const alignClass = key === 'usage' || key === 'status' ? 'text-center' : 'text-left';
                      return (
                        <DraggableHeader key={key} colKey={key} index={catColOrder.getColumnIndex(key)} onMove={catColOrder.moveColumn} onKeyboardMove={(k, d) => catColOrder.moveColumnByKey(k as CatColKey, d)}
                          scope="col" role="columnheader" aria-colindex={colIdx} tabIndex={0}
                          title="Alt+← → để di chuyển cột"
                          className={`relative ${alignClass} px-5 py-3 text-[12px] text-muted-foreground`} style={catColResize.getHeaderProps(key).style}>
                          {headerLabels[key]}
                          <ResizeHandle onResizeStart={(e) => catColResize.onResizeStart(key, e)} onDoubleClick={() => catColResize.autoFit(key, catTableRef.current)} onKeyboardResize={(d) => catColResize.keyboardResize(key, d)} />
                        </DraggableHeader>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {activeGroup.items.map((item, idx) => (
                    <tr key={item.id} aria-rowindex={idx + 2} className="border-b border-border/50 hover:bg-accent/20 transition-colors group">
                      {canManage && (
                        <td className="px-3 py-3">
                          <div className="cursor-pointer" role="checkbox" aria-checked={selectedCatIds.has(item.id)} aria-label={`Chọn ${item.name}`}
                            onClick={() => toggleCatSelect(item.id)}>
                            {selectedCatIds.has(item.id)
                              ? <CheckSquare className="w-4 h-4 text-primary" />
                              : <Square className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </td>
                      )}
                      {catOrderedVisibleCols.map(key => {
                        if (key === 'code') {
                          return <td key={key} aria-colindex={1} className="px-5 py-3">
                            <span className="text-[12px] px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{item.code}</span>
                          </td>;
                        } else if (key === 'name') {
                          return <td key={key} aria-colindex={2} className="px-5 py-3 text-[13px] text-foreground">{item.name}</td>;
                        } else if (key === 'description') {
                          return <td key={key} aria-colindex={3} className="px-5 py-3 text-[13px] text-muted-foreground">{item.description}</td>;
                        } else if (key === 'usage') {
                          return <td key={key} aria-colindex={4} className="px-5 py-3 text-center text-[13px] text-muted-foreground">{item.usageCount}</td>;
                        } else if (key === 'status') {
                          return <td key={key} aria-colindex={5} className="px-5 py-3 text-center">
                            {canManage ? (
                              <button onClick={() => handleToggleActive(item.id)}
                                role="switch"
                                aria-checked={item.isActive}
                                aria-label={`${item.name}: ${item.isActive ? 'Đang hoạt động' : 'Đã tắt'}`}
                                className={`w-10 h-6 rounded-full relative transition-colors ${item.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                <div className="w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 transition-all"
                                  style={{ left: item.isActive ? '20px' : '4px' }} />
                              </button>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] ${item.isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                                {item.isActive ? 'Hoạt động' : 'Tắt'}
                              </span>
                            )}
                          </td>;
                        } else if (key === 'actions') {
                          return <td key={key} aria-colindex={6} className="px-5 py-3">
                            <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEdit(item)} className="p-1.5 rounded-md hover:bg-accent" title="Sửa" aria-label={`Chỉnh sửa ${item.name}`}>
                                <Pencil className="w-4 h-4 text-muted-foreground" />
                              </button>
                              <button onClick={() => setDeleteConfirmId(item.id)} className="p-1.5 rounded-md hover:bg-red-50" title="Xóa" aria-label={`Xóa ${item.name}`}>
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </td>;
                        }
                        return null;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(catColResize.isResized || catColOrder.isReordered) && (
              <div className="flex items-center gap-2 px-4 py-2 border-t border-border bg-surface-2/30">
                <ResetWidthsButton isResized={catColResize.isResized} onReset={catColResize.resetWidths} />
                {catColOrder.isReordered && (
                  <button onClick={catColOrder.resetOrder} className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" aria-label="Đặt lại thứ tự cột">
                    <X className="w-3 h-3" /> Đặt lại thứ tự
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-md" onClick={(e) => e.stopPropagation()}
            role="dialog" aria-modal="true" aria-labelledby="category-modal-title"
            style={{ boxShadow: 'var(--shadow-xl)' }}
            ref={categoryModalRef}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 id="category-modal-title" style={{ fontFamily: "var(--font-display)" }}>{modalMode === 'create' ? 'Thêm mục mới' : 'Chỉnh sửa'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" aria-label="Đóng"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <div id="cat-form-error" role="alert" className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-lg text-[13px] text-red-600 dark:text-red-400"><AlertCircle className="w-4 h-4" /> {formError}</div>}
              {formSuccess && <div role="status" className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-[13px] text-emerald-600 dark:text-emerald-400"><Check className="w-4 h-4" /> {formSuccess}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cat-name" className="block text-[13px] text-foreground mb-1.5">Tên *</label>
                  <input id="cat-name" type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    aria-describedby={formError ? 'cat-form-error' : undefined}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                </div>
                <div>
                  <label htmlFor="cat-code" className="block text-[13px] text-foreground mb-1.5">Mã *</label>
                  <input id="cat-code" type="text" value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    disabled={modalMode === 'edit'}
                    aria-describedby={formError ? 'cat-form-error' : undefined}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none disabled:opacity-50" />
                </div>
              </div>
              <div>
                <label htmlFor="cat-desc" className="block text-[13px] text-foreground mb-1.5">Mô tả</label>
                <textarea id="cat-desc" rows={2} value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none resize-none" />
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
        isOpen={!!deleteConfirmId}
        title="Xóa mục này?"
        message="Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Column order announcement live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {catColOrder.announcement}
      </div>
    </PageTransition>
  );
}