import { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import {
  archiveDocuments, delegationFolders, docCategoryLabels, docCategoryColors,
  getArchiveStats, sortDocuments,
  type ArchiveDocument, type DelegationFolder, type DocCategory,
  type SortField, type SortDir, type ArchiveFile,
} from '../data/archiveData';
import {
  Search, FolderOpen, Folder, FileText, FileImage, FileSpreadsheet,
  FileCode, Upload, Download, Eye, ScanLine, Calendar,
  Filter, ChevronRight, ChevronDown, Tag, Users,
  Archive, Database, Sparkles, AlertCircle, CheckCircle2, X,
  Plus, ArrowUpDown, Clock, Shield, ShieldAlert, Trash2, Edit2,
  FolderPlus, SquareCheck, Square, CheckSquare, RefreshCw, Printer,
  FileDown, Info, BarChart3,
} from 'lucide-react';

// ─────────────────── helpers ───────────────────
type ActiveTab = 'ocr-search' | 'folders';

const fileTypeIcon = (ft: string, size = 'w-4 h-4') => {
  if (ft === 'pdf') return <FileText className={`${size} text-red-500`} />;
  if (ft === 'docx') return <FileCode className={`${size} text-blue-500`} />;
  if (ft === 'xlsx') return <FileSpreadsheet className={`${size} text-emerald-500`} />;
  if (ft === 'jpg' || ft === 'png') return <FileImage className={`${size} text-amber-500`} />;
  return <FileText className={`${size} text-muted-foreground`} />;
};

const flagMap: Record<string, string> = {
  'Việt Nam': '🇻🇳', 'Nga': '🇷🇺', 'Israel': '🇮🇱', 'Hàn Quốc': '🇰🇷',
  'Pháp': '🇫🇷', 'Indonesia': '🇮🇩', 'Mỹ': '🇺🇸', 'Đức': '🇩🇪',
};

const classificationBadge = (c?: string) => {
  if (c === 'bi-mat') return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold flex items-center gap-0.5"><ShieldAlert className="w-2.5 h-2.5" /> BÍ MẬT</span>;
  if (c === 'mat') return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-bold flex items-center gap-0.5"><Shield className="w-2.5 h-2.5" /> MẬT</span>;
  return null;
};

const ocrBadge = (status: string) => {
  if (status === 'done') return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 flex items-center gap-0.5"><ScanLine className="w-2.5 h-2.5" /> OCR</span>;
  if (status === 'pending') return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> Chờ OCR</span>;
  if (status === 'scanning') return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center gap-0.5 animate-pulse"><RefreshCw className="w-2.5 h-2.5 animate-spin" /> Đang OCR</span>;
  return null;
};

const folderStatusBadge = (s: string) => {
  if (s === 'active') return <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">Đang xử lý</span>;
  if (s === 'closed') return <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">Đã đóng</span>;
  if (s === 'archived') return <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">Lưu trữ</span>;
  return null;
};

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-amber-200 dark:bg-amber-700/50 text-foreground rounded px-0.5">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

// ─────────────────── MODALS ───────────────────

interface UploadModalProps {
  onClose: () => void;
  folderId?: string;
}
function UploadModal({ onClose, folderId }: UploadModalProps) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: string; type: string; status: 'pending' | 'uploading' | 'done' }[]>([]);
  const [category, setCategory] = useState<DocCategory>('cong-van-den');
  const [runOcr, setRunOcr] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const simulateUpload = useCallback((names: string[]) => {
    const newFiles = names.map((n) => ({
      name: n,
      size: `${(Math.random() * 5 + 0.3).toFixed(1)} MB`,
      type: n.split('.').pop() || 'other',
      status: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((_, idx) => {
      const i = files.length + idx;
      setTimeout(() => setFiles((prev) => prev.map((f, fi) => fi === i ? { ...f, status: 'uploading' } : f)), 300 * idx);
      setTimeout(() => setFiles((prev) => prev.map((f, fi) => fi === i ? { ...f, status: 'done' } : f)), 1800 + 300 * idx);
    });
  }, [files.length]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const names = Array.from(e.dataTransfer.files).map((f) => f.name);
    simulateUpload(names);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(e.target.files || []).map((f) => f.name);
    simulateUpload(names);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            <h2 className="text-[15px] font-semibold text-foreground">Tải lên tài liệu</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Category */}
          <div>
            <label className="text-[12px] text-muted-foreground font-medium block mb-1.5">Loại tài liệu</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocCategory)}
              className="w-full px-3 py-2 rounded-xl text-[13px] bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {Object.entries(docCategoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl py-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
              dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-accent/30'
            }`}
          >
            <Upload className={`w-8 h-8 ${dragging ? 'text-primary' : 'text-muted-foreground/40'}`} />
            <p className="text-[13px] text-muted-foreground text-center">
              Kéo thả tệp vào đây hoặc <span className="text-primary font-medium">nhấn để chọn</span>
            </p>
            <p className="text-[11px] text-muted-foreground/60">Hỗ trợ: PDF, DOCX, XLSX, JPG, PNG (tối đa 50MB/tệp)</p>
          </div>
          <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png" className="hidden" onChange={handleFileInput} />

          {/* OCR option */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setRunOcr(!runOcr)}
              className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${runOcr ? 'bg-primary' : 'bg-muted'}`}
            >
              <motion.div animate={{ x: runOcr ? 20 : 0 }} className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </div>
            <div>
              <p className="text-[13px] text-foreground font-medium">Tự động quét OCR sau khi tải lên</p>
              <p className="text-[11px] text-muted-foreground">Trích xuất văn bản từ ảnh scan và PDF</p>
            </div>
          </label>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 border border-border">
                  {fileTypeIcon(f.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground truncate">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">{f.size}</p>
                    {f.status === 'uploading' && (
                      <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5 }} className="h-full bg-primary rounded-full" />
                      </div>
                    )}
                  </div>
                  {f.status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                  {f.status === 'uploading' && <RefreshCw className="w-4 h-4 text-primary animate-spin shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 p-5 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-border text-[13px] text-foreground hover:bg-accent transition-colors">Hủy</button>
          <button
            onClick={() => { if (files.length > 0) onClose(); }}
            className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            {files.filter((f) => f.status === 'done').length > 0
              ? `Xong (${files.filter((f) => f.status === 'done').length} tệp)`
              : 'Tải lên'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface NewFolderModalProps { onClose: () => void; }
function NewFolderModal({ onClose }: NewFolderModalProps) {
  const [partner, setPartner] = useState('');
  const [date, setDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [attendees, setAttendees] = useState('');
  const [country, setCountry] = useState('Việt Nam');

  const folderName = partner && date
    ? `Đoàn - ${partner} - ${date.split('-').reverse().join('/')}`
    : 'Đoàn - [Tên Đối Tác] - [Ngày tháng]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-amber-500" />
            <h2 className="text-[15px] font-semibold text-foreground">Tạo thư mục đoàn mới</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Preview */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3">
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wide mb-1">Tên thư mục sẽ tạo</p>
            <p className="text-[12px] font-mono font-semibold text-amber-800 dark:text-amber-300">{folderName}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[11px] text-muted-foreground font-medium block mb-1">Tên đối tác *</label>
              <input value={partner} onChange={(e) => setPartner(e.target.value)} placeholder="Vd: Viettel, Hanwha Aerospace..." className="w-full px-3 py-2 rounded-xl text-[13px] bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-medium block mb-1">Ngày vào *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 rounded-xl text-[13px] bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-medium block mb-1">Quốc gia</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-3 py-2 rounded-xl text-[13px] bg-background border border-border focus:outline-none">
                {['Việt Nam', 'Nga', 'Hàn Quốc', 'Israel', 'Pháp', 'Indonesia', 'Mỹ', 'Đức', 'Khác'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-medium block mb-1">Số người</label>
              <input type="number" min="1" value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-xl text-[13px] bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] text-muted-foreground font-medium block mb-1">Mục đích công tác</label>
              <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Vd: Đàm phán hợp đồng, demo hệ thống..." className="w-full px-3 py-2 rounded-xl text-[13px] bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-border text-[13px] text-foreground hover:bg-accent transition-colors">Hủy</button>
          <button
            onClick={() => { if (partner && date) onClose(); }}
            disabled={!partner || !date}
            className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Tạo thư mục
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface DocViewerModalProps { doc: ArchiveDocument; query: string; onClose: () => void; onSearch: (q: string) => void; }
function DocViewerModal({ doc, query, onClose, onSearch }: DocViewerModalProps) {
  const cc = docCategoryColors[doc.category];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-border">
          <div className="shrink-0 mt-0.5">{fileTypeIcon(doc.fileType, 'w-5 h-5')}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[14px] font-semibold text-foreground leading-snug">{doc.title}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cc.bg} ${cc.text}`}>{cc.icon} {docCategoryLabels[doc.category]}</span>
              {classificationBadge(doc.classification)}
              {ocrBadge(doc.ocrStatus)}
              <span className="text-[11px] text-muted-foreground">{doc.number}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent shrink-0"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Metadata grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: 'Ngày ban hành', value: new Date(doc.date).toLocaleDateString('vi-VN') },
              { label: 'Năm', value: doc.year.toString() },
              { label: 'Số trang', value: doc.pages ? `${doc.pages} trang` : 'N/A' },
              { label: 'Kích thước', value: doc.size },
              { label: 'Từ', value: doc.sender },
              { label: 'Đến', value: doc.receiver },
              { label: 'Định dạng', value: doc.fileType.toUpperCase() },
              { label: 'Đối tác', value: doc.relatedPartner || '—' },
            ].map((item) => (
              <div key={item.label} className="bg-muted/30 rounded-xl p-2.5">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">{item.label}</p>
                <p className="text-[12px] font-medium text-foreground truncate">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div>
            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mb-2"><Tag className="w-3 h-3" /> Từ khóa</p>
            <div className="flex flex-wrap gap-1.5">
              {doc.tags.map((tag) => (
                <button key={tag} onClick={() => { onSearch(tag); onClose(); }} className="text-[11px] bg-muted/50 hover:bg-primary/10 hover:text-primary px-2 py-0.5 rounded-full border border-border transition-colors">
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* OCR content */}
          {doc.ocrContent && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ScanLine className="w-3.5 h-3.5 text-violet-500" />
                <p className="text-[12px] font-semibold text-foreground">
                  Nội dung trích xuất {doc.isScanned ? '(OCR từ bản scan)' : '(Toàn văn)'}
                </p>
              </div>
              <div className="bg-muted/30 border border-border rounded-xl p-4 text-[13px] text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap">
                <HighlightedText text={doc.ocrContent} query={query} />
              </div>
            </div>
          )}

          {!doc.ocrContent && (
            <div className="bg-muted/20 border border-dashed border-border rounded-xl p-6 text-center">
              <ScanLine className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-[13px] text-muted-foreground">Chưa có nội dung OCR</p>
              <button className="mt-2 text-[12px] text-primary hover:underline flex items-center gap-1 mx-auto">
                <RefreshCw className="w-3 h-3" /> Quét OCR ngay
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 p-5 border-t border-border">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition-opacity">
            <Eye className="w-4 h-4" /> Xem tài liệu
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-[13px] text-foreground hover:bg-accent transition-colors">
            <Download className="w-4 h-4" /> Tải về
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-[13px] text-foreground hover:bg-accent transition-colors">
            <Printer className="w-4 h-4" /> In
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface FileDetailModalProps { file: ArchiveFile; folder: DelegationFolder; onClose: () => void; }
function FileDetailModal({ file, folder, onClose }: FileDetailModalProps) {
  const cc = docCategoryColors[file.category];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            {fileTypeIcon(file.fileType, 'w-5 h-5')}
            <h2 className="text-[13px] font-semibold text-foreground max-w-xs truncate">{file.name}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Thư mục', value: folder.folderName },
              { label: 'Loại', value: `${cc.icon} ${docCategoryLabels[file.category]}` },
              { label: 'Kích thước', value: file.size },
              { label: 'Định dạng', value: file.fileType.toUpperCase() },
              { label: 'Ngày tải lên', value: new Date(file.uploadDate).toLocaleDateString('vi-VN') },
              { label: 'Người tải', value: file.uploadedBy },
            ].map((item) => (
              <div key={item.label} className="bg-muted/30 rounded-xl p-2.5 col-span-1">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">{item.label}</p>
                <p className="text-[12px] font-medium text-foreground truncate">{item.value}</p>
              </div>
            ))}
          </div>

          {file.ocrContent && (
            <div>
              <p className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-2"><ScanLine className="w-3 h-3 text-violet-500" /> Nội dung OCR</p>
              <div className="bg-muted/30 border border-border rounded-xl p-3 text-[12px] text-foreground/80 leading-relaxed">
                {file.ocrContent}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 p-5 border-t border-border">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90">
            <Eye className="w-4 h-4" /> Xem
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-[13px] hover:bg-accent">
            <Download className="w-4 h-4" /> Tải về
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 text-[13px] hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────── MAIN PAGE ───────────────────
export function ArchivePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ocr-search');

  // OCR tab state
  const [ocrQuery, setOcrQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<DocCategory | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedDoc, setSelectedDoc] = useState<ArchiveDocument | null>(null);
  const [viewerDoc, setViewerDoc] = useState<ArchiveDocument | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [ocrSimulating, setOcrSimulating] = useState<Set<string>>(new Set());

  // Folders tab state
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  const [folderSearch, setFolderSearch] = useState('');
  const [folderStatusFilter, setFolderStatusFilter] = useState<'all' | 'active' | 'closed' | 'archived'>('all');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showFolderUpload, setShowFolderUpload] = useState<string | null>(null);
  const [selectedFileDetail, setSelectedFileDetail] = useState<{ file: ArchiveFile; folder: DelegationFolder } | null>(null);

  const stats = useMemo(() => getArchiveStats(), []);
  const years = useMemo(() => Object.keys(stats.byYear).map(Number).sort((a, b) => b - a), [stats]);

  // OCR search results
  const ocrResults = useMemo(() => {
    let results = archiveDocuments.filter((doc) => {
      const q = ocrQuery.toLowerCase();
      const matchText = !q || [doc.title, doc.ocrContent, doc.sender, doc.receiver, ...(doc.tags || [])].some((t) => t?.toLowerCase().includes(q));
      const matchYear = yearFilter === 'all' || doc.year === yearFilter;
      const matchCat = categoryFilter === 'all' || doc.category === categoryFilter;
      return matchText && matchYear && matchCat;
    });
    return sortDocuments(results, sortField, sortDir);
  }, [ocrQuery, yearFilter, categoryFilter, sortField, sortDir]);

  const filteredFolders = useMemo(() => {
    return delegationFolders.filter((f) => {
      const q = folderSearch.toLowerCase();
      const matchText = !q || f.folderName.toLowerCase().includes(q) || f.partnerShort.toLowerCase().includes(q) || f.purpose.toLowerCase().includes(q);
      const matchStatus = folderStatusFilter === 'all' || f.status === folderStatusFilter;
      return matchText && matchStatus;
    });
  }, [folderSearch, folderStatusFilter]);

  const handleOcrSearch = (q: string) => {
    setOcrQuery(q);
    setSelectedIds(new Set());
    if (q.trim()) { setIsSearching(true); setTimeout(() => setIsSearching(false), 500); }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === ocrResults.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(ocrResults.map((d) => d.id)));
  };

  const simulateOcr = (id: string) => {
    setOcrSimulating((prev) => new Set([...prev, id]));
    setTimeout(() => setOcrSimulating((prev) => { const n = new Set(prev); n.delete(id); return n; }), 3000);
  };

  const ocrProgress = Math.round((stats.ocrDone / stats.totalDocs) * 100);

  return (
    <PageTransition>
      <div className="flex flex-col h-full">
        <Header title="Lưu trữ & Số hóa Dữ liệu" />

        <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Tài liệu lưu trữ', value: stats.totalDocs, icon: Archive, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Đã số hóa (OCR)', value: `${stats.ocrDone}/${stats.totalDocs}`, icon: ScanLine, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', sub: `${ocrProgress}%` },
              { label: 'Thư mục đoàn', value: stats.totalFolders, icon: FolderOpen, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              { label: 'Tổng dung lượng', value: `${stats.totalSize} MB`, icon: Database, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', sub: `${stats.totalFiles} tệp` },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  <p className="text-[18px] font-bold text-foreground leading-tight">{s.value}</p>
                  {s.sub && <p className="text-[10px] text-muted-foreground">{s.sub}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* OCR Progress bar */}
          <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-4">
            <ScanLine className="w-4 h-4 text-violet-500 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] text-muted-foreground">Tiến độ số hóa OCR</p>
                <p className="text-[11px] font-semibold text-foreground">{ocrProgress}%</p>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${ocrProgress}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground shrink-0">{stats.ocrDone}/{stats.totalDocs} tài liệu</span>
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
              {([
                { key: 'ocr-search', label: 'Tra cứu thông minh (OCR)', icon: ScanLine },
                { key: 'folders', label: 'Tệp theo đoàn', icon: FolderOpen },
              ] as { key: ActiveTab; label: string; icon: typeof ScanLine }[]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${activeTab === tab.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            {activeTab === 'ocr-search' && (
              <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition-opacity">
                <Upload className="w-4 h-4" /> Tải lên tài liệu
              </button>
            )}
            {activeTab === 'folders' && (
              <button onClick={() => setShowNewFolderModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-white text-[13px] font-medium hover:opacity-90 transition-opacity">
                <FolderPlus className="w-4 h-4" /> Tạo thư mục mới
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">

            {/* ══════════════════════════════════════════════
                TAB 1: OCR SEARCH (Epic 2.1)
            ══════════════════════════════════════════════ */}
            {activeTab === 'ocr-search' && (
              <motion.div key="ocr" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

                {/* Search box */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <h3 className="text-[13px] font-semibold text-foreground">Tra cứu toàn văn (OCR)</h3>
                    <span className="text-[11px] text-muted-foreground">— Tìm kiếm từ khóa bên trong nội dung tài liệu</span>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    {isSearching && <ScanLine className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 animate-pulse" />}
                    <input
                      type="text"
                      placeholder="Nhập từ khóa: tên đối tác, số hợp đồng, loại thiết bị, nội dung công văn..."
                      value={ocrQuery}
                      onChange={(e) => handleOcrSearch(e.target.value)}
                      className="w-full pl-9 pr-10 py-3 rounded-xl text-[13px] bg-background border border-border focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                    />
                  </div>

                  {/* Filters row */}
                  <div className="flex gap-2 flex-wrap items-center">
                    <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="px-3 py-1.5 rounded-lg text-[12px] bg-background border border-border focus:outline-none">
                      <option value="all">Tất cả năm</option>
                      {years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as DocCategory | 'all')} className="px-3 py-1.5 rounded-lg text-[12px] bg-background border border-border focus:outline-none">
                      <option value="all">Tất cả loại</option>
                      {Object.entries(docCategoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>

                    {/* Sort */}
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-[11px] text-muted-foreground mr-1">Sắp xếp:</span>
                      {(['date', 'name', 'year'] as SortField[]).map((f) => (
                        <button key={f} onClick={() => toggleSort(f)} className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] border transition-colors ${sortField === f ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:bg-accent'}`}>
                          {f === 'date' ? 'Ngày' : f === 'name' ? 'Tên' : 'Năm'}
                          {sortField === f && <ArrowUpDown className="w-3 h-3" />}
                        </button>
                      ))}
                      <button onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')} className="p-1.5 rounded-lg border border-border hover:bg-accent transition-colors" title={sortDir === 'desc' ? 'Giảm dần' : 'Tăng dần'}>
                        <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>

                    {(ocrQuery || yearFilter !== 'all' || categoryFilter !== 'all') && (
                      <button onClick={() => { setOcrQuery(''); setYearFilter('all'); setCategoryFilter('all'); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] text-muted-foreground hover:text-foreground border border-border hover:bg-accent transition-colors">
                        <X className="w-3 h-3" /> Xóa bộ lọc
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground">
                      Tìm thấy <span className="font-semibold text-foreground">{ocrResults.length}</span> tài liệu
                      {ocrQuery && <> chứa từ khóa "<span className="text-violet-600 dark:text-violet-400 font-medium">{ocrQuery}</span>"</>}
                    </p>
                    {/* Batch actions */}
                    {selectedIds.size > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Đã chọn {selectedIds.size}</span>
                        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] bg-muted/50 border border-border hover:bg-accent text-foreground transition-colors">
                          <Download className="w-3 h-3" /> Tải về
                        </button>
                        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] bg-muted/50 border border-border hover:bg-accent text-foreground transition-colors">
                          <FileDown className="w-3 h-3" /> Xuất danh sách
                        </button>
                        <button onClick={() => setSelectedIds(new Set())} className="p-1 rounded-lg hover:bg-accent text-muted-foreground">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick tags */}
                {!ocrQuery && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[11px] text-muted-foreground self-center">Tìm nhanh:</span>
                    {['S-300', 'Viettel', 'composite', 'nhìn đêm', 'hợp đồng', '2023', 'biên bản', 'hộ chiếu', 'radar', 'K9', 'đạn dược', 'VTQS-5G'].map((tag) => (
                      <button key={tag} onClick={() => handleOcrSearch(tag)} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] bg-muted/50 hover:bg-primary/10 hover:text-primary border border-border transition-colors">
                        <Tag className="w-3 h-3" /> {tag}
                      </button>
                    ))}
                  </div>
                )}

                {/* Results area */}
                <div className="flex gap-4">
                  {/* Document list */}
                  <div className={`space-y-2 ${selectedDoc ? 'w-[420px] shrink-0' : 'flex-1'}`}>
                    {/* Select all row */}
                    {ocrResults.length > 0 && (
                      <div className="flex items-center gap-2 px-1">
                        <button onClick={toggleSelectAll} className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                          {selectedIds.size === ocrResults.length
                            ? <CheckSquare className="w-3.5 h-3.5 text-primary" />
                            : selectedIds.size > 0
                            ? <SquareCheck className="w-3.5 h-3.5 text-primary/50" />
                            : <Square className="w-3.5 h-3.5" />
                          }
                          {selectedIds.size === ocrResults.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                        </button>
                      </div>
                    )}

                    {ocrResults.map((doc) => {
                      const cc = docCategoryColors[doc.category];
                      const isSelected = selectedDoc?.id === doc.id;
                      const isChecked = selectedIds.has(doc.id);
                      const isOcrSim = ocrSimulating.has(doc.id);
                      const excerpt = ocrQuery && doc.ocrContent
                        ? (() => {
                            const idx = doc.ocrContent.toLowerCase().indexOf(ocrQuery.toLowerCase());
                            if (idx < 0) return doc.ocrContent.slice(0, 100) + '...';
                            const start = Math.max(0, idx - 30);
                            const end = Math.min(doc.ocrContent.length, idx + 100);
                            return (start > 0 ? '...' : '') + doc.ocrContent.slice(start, end) + (end < doc.ocrContent.length ? '...' : '');
                          })()
                        : undefined;

                      return (
                        <div key={doc.id} className={`rounded-xl border transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30 hover:bg-accent/20'}`}>
                          <div className="flex items-start gap-2 p-3">
                            {/* Checkbox */}
                            <button onClick={() => toggleSelect(doc.id)} className="mt-0.5 shrink-0">
                              {isChecked ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground/40 hover:text-muted-foreground" />}
                            </button>

                            {/* Content */}
                            <button className="flex-1 text-left min-w-0" onClick={() => setSelectedDoc(isSelected ? null : doc)}>
                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                {fileTypeIcon(doc.fileType)}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cc.bg} ${cc.text}`}>{cc.icon} {docCategoryLabels[doc.category]}</span>
                                <span className="text-[10px] text-muted-foreground">{doc.year}</span>
                                {classificationBadge(doc.classification)}
                                {isOcrSim ? ocrBadge('scanning') : ocrBadge(doc.ocrStatus)}
                              </div>
                              <p className="text-[13px] font-medium text-foreground line-clamp-1">
                                <HighlightedText text={doc.title} query={ocrQuery} />
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{doc.number} • {doc.sender}</p>
                              {excerpt && ocrQuery && (
                                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed line-clamp-2 bg-muted/30 rounded-lg px-2 py-1">
                                  <HighlightedText text={excerpt} query={ocrQuery} />
                                </p>
                              )}
                            </button>

                            {/* Actions */}
                            <div className="flex flex-col gap-1 shrink-0">
                              <button onClick={() => setViewerDoc(doc)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Xem chi tiết">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {doc.ocrStatus === 'not-scanned' || doc.ocrStatus === 'pending' ? (
                                <button onClick={() => simulateOcr(doc.id)} className="p-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 text-violet-400 hover:text-violet-600 transition-colors" title="Quét OCR">
                                  <ScanLine className="w-3.5 h-3.5" />
                                </button>
                              ) : null}
                              <button className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Tải về">
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {ocrResults.length === 0 && (
                      <div className="text-center py-16 text-muted-foreground">
                        <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-[13px]">Không tìm thấy tài liệu phù hợp</p>
                        <p className="text-[11px] mt-1">Thử từ khóa khác hoặc thay đổi bộ lọc</p>
                      </div>
                    )}
                  </div>

                  {/* Inline detail panel */}
                  <AnimatePresence>
                    {selectedDoc && (
                      <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="flex-1 bg-card border border-border rounded-xl overflow-hidden flex flex-col min-w-0">
                        <div className="p-4 border-b border-border flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {fileTypeIcon(selectedDoc.fileType)}
                            <span className="text-[13px] font-semibold text-foreground line-clamp-1">{selectedDoc.title}</span>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => setViewerDoc(selectedDoc)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground" title="Xem đầy đủ">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setSelectedDoc(null)} className="p-1.5 rounded-lg hover:bg-accent">
                              <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: 'Số hiệu', value: selectedDoc.number },
                              { label: 'Ngày', value: new Date(selectedDoc.date).toLocaleDateString('vi-VN') },
                              { label: 'Từ', value: selectedDoc.sender },
                              { label: 'Đến', value: selectedDoc.receiver },
                              { label: 'Kích thước', value: selectedDoc.size },
                              { label: 'Định dạng', value: `${selectedDoc.fileType.toUpperCase()} • ${selectedDoc.pages || '?'} tr.` },
                            ].map((item) => (
                              <div key={item.label} className="bg-muted/30 rounded-xl p-2.5">
                                <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">{item.label}</p>
                                <p className="text-[11px] font-medium text-foreground truncate">{item.value}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedDoc.tags.map((tag) => (
                              <button key={tag} onClick={() => handleOcrSearch(tag)} className="text-[11px] bg-muted/50 hover:bg-primary/10 hover:text-primary px-2 py-0.5 rounded-full border border-border transition-colors">
                                {tag}
                              </button>
                            ))}
                          </div>
                          {selectedDoc.ocrContent && (
                            <div>
                              <p className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-2"><ScanLine className="w-3 h-3 text-violet-500" /> Nội dung OCR</p>
                              <div className="bg-muted/30 rounded-xl p-3 text-[11px] text-muted-foreground leading-relaxed border border-border max-h-40 overflow-y-auto">
                                <HighlightedText text={selectedDoc.ocrContent} query={ocrQuery} />
                              </div>
                            </div>
                          )}
                          <div className="flex gap-2 pt-1">
                            <button onClick={() => setViewerDoc(selectedDoc)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-primary-foreground text-[12px] font-medium hover:opacity-90">
                              <Eye className="w-3.5 h-3.5" /> Xem đầy đủ
                            </button>
                            <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-border text-[12px] hover:bg-accent">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════
                TAB 2: FOLDERS (Epic 2.2)
            ══════════════════════════════════════════════ */}
            {activeTab === 'folders' && (
              <motion.div key="folders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

                {/* Toolbar */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-amber-500" />
                    <h3 className="text-[13px] font-semibold text-foreground">Quản lý hồ sơ tài liệu theo đoàn</h3>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-amber-700 dark:text-amber-300">
                      Thư mục tự động được tạo theo cấu trúc <span className="font-mono font-semibold">Đoàn - [Tên Đối Tác] - [Ngày tháng]</span> khi đăng ký đoàn mới.
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="text" placeholder="Tìm tên đoàn, đối tác, mục đích..." value={folderSearch} onChange={(e) => setFolderSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl text-[13px] bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <select value={folderStatusFilter} onChange={(e) => setFolderStatusFilter(e.target.value as typeof folderStatusFilter)} className="px-3 py-2 rounded-xl text-[12px] bg-background border border-border focus:outline-none">
                      <option value="all">Tất cả trạng thái</option>
                      <option value="active">Đang xử lý</option>
                      <option value="closed">Đã đóng</option>
                      <option value="archived">Lưu trữ</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{filteredFolders.length} thư mục</p>
                </div>

                {/* Folder list */}
                <div className="space-y-2">
                  {filteredFolders.map((folder) => {
                    const isExpanded = expandedFolder === folder.id;
                    const catCount: Record<string, number> = {};
                    folder.files.forEach((f) => { catCount[f.category] = (catCount[f.category] || 0) + 1; });
                    const totalSize = folder.files.reduce((s, f) => s + parseFloat(f.size), 0);
                    const scannedFiles = folder.files.filter((f) => f.ocrStatus === 'done').length;

                    return (
                      <div key={folder.id} className="bg-card border border-border rounded-xl overflow-hidden">
                        {/* Folder header */}
                        <button
                          onClick={() => setExpandedFolder(isExpanded ? null : folder.id)}
                          className="w-full flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                            {isExpanded ? <FolderOpen className="w-5 h-5 text-amber-600" /> : <Folder className="w-5 h-5 text-amber-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[13px] font-semibold text-foreground">{folder.folderName}</p>
                              <span>{flagMap[folder.country] || '🌐'}</span>
                              {folderStatusBadge(folder.status)}
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(folder.visitDate).toLocaleDateString('vi-VN')}</span>
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{folder.attendees} người</span>
                              <span className="text-[11px] text-muted-foreground truncate max-w-[220px]">{folder.purpose}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right hidden sm:block">
                              <p className="text-[13px] font-bold text-foreground">{folder.files.length}</p>
                              <p className="text-[10px] text-muted-foreground">tệp</p>
                            </div>
                            <div className="text-right hidden md:block">
                              <p className="text-[12px] font-medium text-foreground">{totalSize.toFixed(1)} MB</p>
                              <p className="text-[10px] text-muted-foreground">{scannedFiles}/{folder.files.length} OCR</p>
                            </div>
                            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </motion.div>
                          </div>
                        </button>

                        {/* Folder content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-border">
                                {/* Category chips */}
                                <div className="px-4 py-3 flex flex-wrap gap-2 bg-muted/20 items-center justify-between">
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(catCount).map(([cat, count]) => {
                                      const cc = docCategoryColors[cat as DocCategory];
                                      return (
                                        <span key={cat} className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${cc.bg} ${cc.text}`}>
                                          {cc.icon} {docCategoryLabels[cat as DocCategory]} ({count})
                                        </span>
                                      );
                                    })}
                                  </div>
                                  <div className="flex gap-2">
                                    <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                                      <Download className="w-3 h-3" /> Tải tất cả
                                    </button>
                                    <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                                      <BarChart3 className="w-3 h-3" /> Báo cáo
                                    </button>
                                  </div>
                                </div>

                                {/* File list */}
                                <div className="divide-y divide-border">
                                  {folder.files.map((file) => {
                                    const cc = docCategoryColors[file.category];
                                    return (
                                      <div key={file.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/20 transition-colors group">
                                        <div className="shrink-0">{fileTypeIcon(file.fileType)}</div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[12px] font-medium text-foreground truncate">{file.name}</p>
                                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cc.bg} ${cc.text}`}>{cc.icon} {docCategoryLabels[file.category]}</span>
                                            <span className="text-[10px] text-muted-foreground">{file.size}</span>
                                            <span className="text-[10px] text-muted-foreground">{new Date(file.uploadDate).toLocaleDateString('vi-VN')}</span>
                                            <span className="text-[10px] text-muted-foreground">{file.uploadedBy}</span>
                                            {ocrBadge(file.ocrStatus)}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => setSelectedFileDetail({ file, folder })} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Chi tiết">
                                            <Info className="w-3.5 h-3.5" />
                                          </button>
                                          <button className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Xem">
                                            <Eye className="w-3.5 h-3.5" />
                                          </button>
                                          <button className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Tải về">
                                            <Download className="w-3.5 h-3.5" />
                                          </button>
                                          <button className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Đổi tên">
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Upload area */}
                                <div className="px-4 py-3 bg-muted/10">
                                  <button
                                    onClick={() => setShowFolderUpload(folder.id)}
                                    className="w-full border-2 border-dashed border-border rounded-xl py-3 flex items-center justify-center gap-2 text-[12px] text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
                                  >
                                    <Upload className="w-4 h-4" />
                                    Kéo thả hoặc nhấn để tải lên tệp mới vào thư mục này
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}

                  {filteredFolders.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                      <Folder className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-[13px]">Không tìm thấy thư mục phù hợp</p>
                      <button onClick={() => setShowNewFolderModal(true)} className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-border hover:border-amber-400 hover:text-amber-600 text-[12px] text-muted-foreground transition-colors mx-auto">
                        <FolderPlus className="w-4 h-4" /> Tạo thư mục đoàn mới
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} />}
        {showNewFolderModal && <NewFolderModal onClose={() => setShowNewFolderModal(false)} />}
        {(showFolderUpload !== null) && <UploadModal onClose={() => setShowFolderUpload(null)} folderId={showFolderUpload ?? undefined} />}
        {viewerDoc && <DocViewerModal doc={viewerDoc} query={ocrQuery} onClose={() => setViewerDoc(null)} onSearch={handleOcrSearch} />}
        {selectedFileDetail && <FileDetailModal file={selectedFileDetail.file} folder={selectedFileDetail.folder} onClose={() => setSelectedFileDetail(null)} />}
      </AnimatePresence>
    </PageTransition>
  );
}
