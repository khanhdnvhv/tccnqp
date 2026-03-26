import { useState, useEffect } from 'react';
import { X, FileText, AlertCircle, Check, Paperclip } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { type EnhancedDocument, type DocPriority, type DocSecurity, incomingDocs, outgoingDocs, internalDocs } from '../data/documentData';

interface DocumentCreateProps {
  type: 'incoming' | 'outgoing' | 'internal';
  onClose: () => void;
  onSave: (doc: EnhancedDocument) => void;
}

const docCategories = ['Công văn', 'Báo cáo', 'Kế hoạch', 'Quyết định', 'Thông báo', 'Tờ trình', 'Biên bản', 'Hướng dẫn', 'Nội quy', 'Đề xuất'];
const docFields = ['Hành chính', 'Tài chính - Ngân sách', 'Giáo dục', 'Y tế', 'Công nghệ thông tin', 'Tài nguyên - Môi trường', 'Kinh tế'];
const contacts = ['UBND Tỉnh', 'Sở Nội vụ', 'Sở Tài chính', 'Sở GD&ĐT', 'Sở Y tế', 'Sở KH&ĐT', 'Sở TN&MT', 'Bộ Tài chính', 'Bộ Nội vụ', 'Sở LĐ-TB&XH', 'Các phòng ban', 'Toàn cơ quan'];

export function DocumentCreate({ type, onClose, onSave }: DocumentCreateProps) {
  const { user, hasRole } = useAuth();
  const isClerk = hasRole('role-clerk');
  const dialogRef = useFocusTrap<HTMLDivElement>(true);

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const [formData, setFormData] = useState({
    number: '',
    title: '',
    content: '',
    sender: type === 'incoming' ? '' : 'UBND Huyện Bình Minh',
    senderUnit: '',
    receiver: type === 'outgoing' ? '' : (type === 'internal' ? 'Toàn cơ quan' : 'UBND Huyện Bình Minh'),
    receiverUnit: '',
    date: new Date().toISOString().split('T')[0],
    deadline: '',
    category: 'Công văn',
    field: 'Hành chính',
    priority: 'medium' as DocPriority,
    security: 'normal' as DocSecurity,
    pageCount: 1,
  });
  const [error, setError] = useState('');
  const [mockFiles, setMockFiles] = useState<{ name: string; size: string }[]>([]);

  const validate = (): boolean => {
    if (!formData.title.trim()) { setError('Trích yếu nội dung không được để trống'); return false; }
    if (type === 'incoming' && !formData.sender.trim()) { setError('Nơi gửi không được để trống'); return false; }
    if (type === 'incoming' && !isClerk) { setError('Chỉ Văn thư mới được phép tiếp nhận văn bản đến'); return false; }
    if (type === 'incoming' && !formData.number.trim()) { setError('Số hiệu văn bản đến không được để trống'); return false; }
    // Validate unique document number within same year
    if (type === 'incoming' && formData.number.trim()) {
      const currentYear = new Date().getFullYear();
      const allDocs = [...incomingDocs, ...outgoingDocs, ...internalDocs];
      const duplicate = allDocs.find((d) => d.number === formData.number.trim() && d.year === currentYear);
      if (duplicate) {
        setError(`Số hiệu "${formData.number}" đã tồn tại trong năm ${currentYear}. Vui lòng kiểm tra lại.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    setError('');
    if (!validate()) return;

    const prefix = type === 'incoming' ? 'INC' : type === 'outgoing' ? 'OUT' : 'INT';
    const now = new Date().toISOString();

    const newDoc: EnhancedDocument = {
      id: `${prefix}-${Date.now()}`,
      number: type === 'incoming' ? formData.number : '',
      title: formData.title,
      content: formData.content || formData.title,
      sender: formData.sender,
      senderUnit: formData.senderUnit,
      receiver: formData.receiver,
      receiverUnit: formData.receiverUnit,
      date: formData.date,
      receivedDate: type === 'incoming' ? new Date().toISOString().split('T')[0] : undefined,
      deadline: formData.deadline || undefined,
      status: type === 'incoming' ? 'received' : 'draft',
      priority: formData.priority,
      security: formData.security,
      type,
      category: formData.category,
      field: formData.field,
      pageCount: formData.pageCount,
      createdBy: user?.id || '',
      createdByName: user?.fullName || '',
      updatedAt: now,
      attachments: mockFiles.map((f, i) => ({
        id: `att-new-${i}`,
        name: f.name,
        size: f.size,
        type: f.name.split('.').pop() || 'pdf',
        uploadedBy: user?.fullName || '',
        uploadedAt: new Date().toISOString().split('T')[0],
      })),
      workflow: type === 'incoming'
        ? [{ id: `wf-new-1`, action: 'Tiếp nhận văn bản', actorId: user?.id || '', actorName: user?.fullName || '', actorRole: 'Văn thư', timestamp: now, comment: 'Tiếp nhận và đăng ký', status: 'completed' as const },
           { id: `wf-new-2`, action: 'Trình lãnh đạo phân công', actorId: user?.id || '', actorName: user?.fullName || '', actorRole: 'Văn thư', timestamp: '', comment: '', status: 'current' as const }]
        : [{ id: `wf-new-1`, action: 'Soạn thảo văn bản', actorId: user?.id || '', actorName: user?.fullName || '', actorRole: user?.position || '', timestamp: now, comment: 'Bắt đầu soạn thảo', status: 'current' as const }],
      comments: [],
      relatedDocIds: [],
      year: new Date().getFullYear(),
      isLocked: false,
    };

    onSave(newDoc);
  };

  const handleAddMockFile = () => {
    const names = ['VanBan.pdf', 'PhuLuc.xlsx', 'BaoCao.docx', 'BieuMau.pdf'];
    const sizes = ['1.2 MB', '856 KB', '2.4 MB', '340 KB'];
    const idx = mockFiles.length % names.length;
    setMockFiles([...mockFiles, { name: `${formData.category}_${names[idx]}`, size: sizes[idx] }]);
  };

  const typeLabels = { incoming: 'Tiếp nhận Văn bản Đến', outgoing: 'Soạn Văn bản Đi', internal: 'Tạo Văn bản Nội bộ' };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-labelledby="doc-create-title"
        style={{ boxShadow: 'var(--shadow-xl)' }}
        ref={dialogRef}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h3 id="doc-create-title" className="text-foreground" style={{ fontFamily: "var(--font-display)" }}>{typeLabels[type]}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors" aria-label="Đóng"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div id="doc-create-error" role="alert" className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-[13px] text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Incoming specific: doc number */}
          {type === 'incoming' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="doc-number" className="block text-[13px] text-foreground mb-1.5">Số hiệu văn bản *</label>
                <input id="doc-number" type="text" value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="VD: 1245/UBND-VP"
                  aria-describedby={error ? 'doc-create-error' : undefined}
                  className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
              </div>
              <div>
                <label htmlFor="doc-date" className="block text-[13px] text-foreground mb-1.5">Ngày văn bản *</label>
                <input id="doc-date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="doc-title" className="block text-[13px] text-foreground mb-1.5">Trích yếu nội dung *</label>
            <textarea id="doc-title" rows={2} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nhập trích yếu nội dung văn bản..."
              aria-describedby={error ? 'doc-create-error' : undefined}
              aria-required="true"
              className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none resize-none" />
          </div>

          {/* Content */}
          {type !== 'incoming' && (
            <div>
              <label htmlFor="doc-content" className="block text-[13px] text-foreground mb-1.5">Nội dung chi tiết</label>
              <textarea id="doc-content" rows={4} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Nhập nội dung chi tiết..."
                className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none resize-none" />
            </div>
          )}

          {/* Sender / Receiver */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="doc-sender" className="block text-[13px] text-foreground mb-1.5">
                {type === 'incoming' ? 'Nơi gửi *' : 'Đơn vị soạn'}
              </label>
              {type === 'incoming' ? (
                <select id="doc-sender" value={formData.sender} onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                  aria-describedby={error ? 'doc-create-error' : undefined}
                  className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                  <option value="">-- Chọn --</option>
                  {contacts.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input type="text" value={formData.sender} onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none" />
              )}
            </div>
            <div>
              <label htmlFor="doc-receiver" className="block text-[13px] text-foreground mb-1.5">
                {type === 'incoming' ? 'Đơn vị nhận' : 'Nơi nhận'}
              </label>
              {type === 'outgoing' ? (
                <select id="doc-receiver" value={formData.receiver} onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                  <option value="">-- Chọn --</option>
                  {contacts.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input type="text" value={formData.receiver} onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
                  placeholder={type === 'internal' ? 'Toàn cơ quan' : ''}
                  className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none" />
              )}
            </div>
          </div>

          {/* Category & Field */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="doc-category" className="block text-[13px] text-foreground mb-1.5">Loại văn bản</label>
              <select id="doc-category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                {docCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="doc-field" className="block text-[13px] text-foreground mb-1.5">Lĩnh vực</label>
              <select id="doc-field" value={formData.field} onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                {docFields.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Priority, Security, Deadline */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="doc-priority" className="block text-[13px] text-foreground mb-1.5">Mức độ khẩn</label>
              <select id="doc-priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as DocPriority })}
                className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                <option value="low">Thường</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn</option>
                <option value="urgent_top">Hỏa tốc</option>
              </select>
            </div>
            <div>
              <label htmlFor="doc-security" className="block text-[13px] text-foreground mb-1.5">Mức độ mật</label>
              <select id="doc-security" value={formData.security} onChange={(e) => setFormData({ ...formData, security: e.target.value as DocSecurity })}
                className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                <option value="normal">Thường</option>
                <option value="confidential">Mật</option>
                <option value="secret">Tối mật</option>
                <option value="top_secret">Tuyệt mật</option>
              </select>
            </div>
            <div>
              <label htmlFor="doc-deadline" className="block text-[13px] text-foreground mb-1.5">Hạn xử lý</label>
              <input id="doc-deadline" type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
            </div>
          </div>

          {/* Page count */}
          <div className="w-32">
            <label htmlFor="doc-pagecount" className="block text-[13px] text-foreground mb-1.5">Số trang</label>
            <input id="doc-pagecount" type="number" min={1} value={formData.pageCount} onChange={(e) => setFormData({ ...formData, pageCount: parseInt(e.target.value) || 1 })}
              className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none" />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-[13px] text-foreground mb-1.5">Đính kèm file</label>
            {mockFiles.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {mockFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-accent/30">
                    <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[12px] text-foreground flex-1">{f.name}</span>
                    <span className="text-[11px] text-muted-foreground">{f.size}</span>
                    <button onClick={() => setMockFiles(mockFiles.filter((_, idx) => idx !== i))}
                      aria-label={`Xóa file ${f.name}`}
                      className="p-1 rounded hover:bg-accent"><X className="w-3 h-3 text-muted-foreground" /></button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleAddMockFile}
              className="w-full border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/30 transition-colors cursor-pointer">
              <FileText className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1" />
              <p className="text-[12px] text-muted-foreground">Click để thêm file đính kèm (demo)</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">PDF, DOC, DOCX, XLS, XLSX (tối đa 10MB)</p>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border sticky bottom-0 bg-card">
          <p className="text-[11px] text-muted-foreground">
            {type === 'incoming' ? 'Văn bản sẽ được đăng ký vào sổ văn bản đến' :
             type === 'outgoing' ? 'Văn bản sẽ ở trạng thái Nháp, cần trình duyệt' :
             'Văn bản nội bộ sẽ ở trạng thái Nháp'}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-accent">Hủy</button>
            <button onClick={handleSubmit} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-[13px] hover:opacity-90 flex items-center gap-1.5 transition-all active:scale-[0.98]"
              style={{ boxShadow: 'var(--shadow-sm)' }}>
              <Check className="w-4 h-4" /> Lưu văn bản
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}