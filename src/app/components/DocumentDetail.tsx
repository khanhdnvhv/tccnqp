import { useState, useEffect } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import {
  X, FileText, Paperclip, MessageSquare, GitBranch, Clock, CheckCircle2,
  AlertCircle, Send, ArrowRight, XCircle, User, Calendar, Shield,
  Download, Hash, Building2, Eye, Printer,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  type EnhancedDocument, type WorkflowStep,
  getStatusConfig, priorityLabels, securityLabels,
} from '../data/documentData';
import { WorkflowStepper } from './WorkflowStepper';

interface DocumentDetailProps {
  document: EnhancedDocument;
  onClose: () => void;
  onAction: (docId: string, action: string, data?: Record<string, string>) => void;
}

export function DocumentDetail({ document: doc, onClose, onAction }: DocumentDetailProps) {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'workflow' | 'comments' | 'attachments'>('info');
  const [comment, setComment] = useState('');
  const [actionComment, setActionComment] = useState('');
  const [showActionModal, setShowActionModal] = useState<string | null>(null);
  const [assignees, setAssignees] = useState('');

  // Focus trap for the dialog
  const dialogRef = useFocusTrap<HTMLDivElement>(!showActionModal);
  const actionDialogRef = useFocusTrap<HTMLDivElement>(!!showActionModal);

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showActionModal) setShowActionModal(null);
        else onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showActionModal, onClose]);

  const statusCfg = getStatusConfig(doc);
  const priorityCfg = priorityLabels[doc.priority];
  const secCfg = securityLabels[doc.security];

  const getAvailableActions = () => {
    const actions: { key: string; label: string; icon: typeof Send; color: string; bgColor: string }[] = [];
    if (!user) return actions;
    const isClerk = hasRole('role-clerk');
    const isLeader = hasRole('role-leader');
    const isDeptHead = hasRole('role-dept-head');
    const isAdmin = hasRole('role-admin');

    if (doc.type === 'incoming') {
      if (doc.status === 'received' && (isLeader || isAdmin))
        actions.push({ key: 'assign', label: 'Phân công xử lý', icon: ArrowRight, color: 'text-blue-700', bgColor: 'bg-blue-600' });
      if ((doc.status === 'assigned' || doc.status === 'processing') && (doc.processorId === user.id || doc.assignedTo?.includes(user.id) || isAdmin))
        actions.push({ key: 'process', label: 'Báo cáo kết quả', icon: CheckCircle2, color: 'text-emerald-700', bgColor: 'bg-emerald-600' });
      if (doc.status === 'processing' && (isLeader || isDeptHead || isAdmin))
        actions.push({ key: 'return', label: 'Trả lại', icon: XCircle, color: 'text-orange-700', bgColor: 'bg-orange-500' });
    }
    if (doc.type === 'outgoing') {
      if (doc.status === 'draft' && (doc.createdBy === user.id || isAdmin))
        actions.push({ key: 'submit_review', label: 'Trình duyệt', icon: Send, color: 'text-blue-700', bgColor: 'bg-blue-600' });
      if (doc.status === 'dept_review' && (isDeptHead || isAdmin)) {
        actions.push({ key: 'dept_approve', label: 'Đồng ý trình LĐ', icon: CheckCircle2, color: 'text-emerald-700', bgColor: 'bg-emerald-600' });
        actions.push({ key: 'reject', label: 'Trả lại chỉnh sửa', icon: XCircle, color: 'text-red-700', bgColor: 'bg-red-500' });
      }
      if (doc.status === 'leader_review' && (isLeader || isAdmin)) {
        actions.push({ key: 'leader_approve', label: 'Phê duyệt', icon: CheckCircle2, color: 'text-emerald-700', bgColor: 'bg-emerald-600' });
        actions.push({ key: 'reject', label: 'Từ chối', icon: XCircle, color: 'text-red-700', bgColor: 'bg-red-500' });
      }
      if (doc.status === 'approved' && (isClerk || isAdmin))
        actions.push({ key: 'publish', label: 'Phát hành', icon: Send, color: 'text-emerald-800', bgColor: 'bg-emerald-700' });
    }
    if (doc.type === 'internal') {
      if (doc.status === 'draft' && (doc.createdBy === user.id || isAdmin))
        actions.push({ key: 'submit_review', label: 'Trình duyệt', icon: Send, color: 'text-blue-700', bgColor: 'bg-blue-600' });
      if (doc.status === 'review' && (isLeader || isDeptHead || isAdmin)) {
        actions.push({ key: 'approve', label: 'Phê duyệt', icon: CheckCircle2, color: 'text-emerald-700', bgColor: 'bg-emerald-600' });
        actions.push({ key: 'reject', label: 'Từ chối', icon: XCircle, color: 'text-red-700', bgColor: 'bg-red-500' });
      }
      if (doc.status === 'approved' && (isClerk || isAdmin))
        actions.push({ key: 'distribute', label: 'Phân phối', icon: Send, color: 'text-emerald-800', bgColor: 'bg-emerald-700' });
    }
    return actions;
  };

  const actions = getAvailableActions();

  const handleAction = (actionKey: string) => { setShowActionModal(actionKey); };

  const confirmAction = () => {
    if (showActionModal) {
      onAction(doc.id, showActionModal, {
        comment: actionComment,
        ...(showActionModal === 'assign' ? { assignees } : {}),
      });
      setShowActionModal(null);
      setActionComment('');
      setAssignees('');
    }
  };

  const getWorkflowIcon = (step: WorkflowStep) => {
    if (step.status === 'completed') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (step.status === 'current') return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
    if (step.status === 'rejected') return <XCircle className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />;
  };

  const tabs = [
    { key: 'info', label: 'Thông tin', icon: FileText },
    { key: 'workflow', label: 'Luồng xử lý', icon: GitBranch, count: doc.workflow.length },
    { key: 'comments', label: 'Ý kiến', icon: MessageSquare, count: doc.comments.length },
    { key: 'attachments', label: 'Đính km', icon: Paperclip, count: doc.attachments.length },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-labelledby="doc-detail-title"
        style={{ boxShadow: 'var(--shadow-xl)' }}
        ref={dialogRef}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {doc.number && (
                  <span className="text-[12px] px-2 py-0.5 rounded bg-primary/10 text-primary flex items-center gap-1">
                    <Hash className="w-3 h-3" /> {doc.number}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] ${statusCfg?.bg} ${statusCfg?.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg?.dot}`} />
                  {statusCfg?.label}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded ${priorityCfg.bg} ${priorityCfg.color}`}>{priorityCfg.label}</span>
                {doc.security !== 'normal' && (
                  <span className={`text-[11px] px-2 py-0.5 rounded ${secCfg.bg} ${secCfg.color} flex items-center gap-1`}>
                    <Shield className="w-3 h-3" /> {secCfg.label}
                  </span>
                )}
                {doc.isLocked && <span className="text-[11px] px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Đã khóa</span>}
              </div>
              <h2 id="doc-detail-title" className="text-foreground text-[16px] leading-snug" style={{ fontFamily: "var(--font-display)" }}>{doc.title}</h2>
              <p className="text-[12px] text-muted-foreground mt-1">{doc.category} | {doc.field} | {doc.pageCount} trang</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent shrink-0 transition-colors" aria-label="Đóng chi tiết văn bản"><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>

          {/* Workflow Stepper - Visual Overview */}
          <div className="mt-3 px-2 py-2 bg-accent/20 rounded-xl border border-border/50">
            <WorkflowStepper workflow={doc.workflow} type={doc.type} />
          </div>

          {/* Action buttons */}
          {(actions.length > 0 && !doc.isLocked) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {actions.map((action) => (
                <button key={action.key} onClick={() => handleAction(action.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 ${action.bgColor} text-white rounded-lg text-[12px] hover:opacity-90 transition-opacity shadow-sm`}>
                  <action.icon className="w-3.5 h-3.5" /> {action.label}
                </button>
              ))}
              <div className="flex items-center gap-1 ml-auto">
                <button onClick={() => toast.success('Đã tải file văn bản')}
                  className="flex items-center gap-1 px-3 py-2 bg-input-background rounded-lg text-[12px] text-muted-foreground hover:bg-muted transition-colors" aria-label="Tải về văn bản">
                  <Download className="w-3.5 h-3.5" /> Tải về
                </button>
                <button onClick={() => { toast.info('Đang mở hộp thoại in...'); setTimeout(() => window.print(), 300); }}
                  className="flex items-center gap-1 px-3 py-2 bg-input-background rounded-lg text-[12px] text-muted-foreground hover:bg-muted transition-colors" aria-label="In văn bản">
                  <Printer className="w-3.5 h-3.5" /> In
                </button>
              </div>
            </div>
          )}
          {actions.length === 0 && (
            <div className="flex items-center gap-1 mt-3 justify-end">
              <button onClick={() => toast.success('Đã tải file văn bản')}
                className="flex items-center gap-1 px-3 py-2 bg-input-background rounded-lg text-[12px] text-muted-foreground hover:bg-muted transition-colors" aria-label="Tải về văn bản">
                <Download className="w-3.5 h-3.5" /> Tải về
              </button>
              <button onClick={() => { toast.info('Đang mở hộp thoại in...'); setTimeout(() => window.print(), 300); }}
                className="flex items-center gap-1 px-3 py-2 bg-input-background rounded-lg text-[12px] text-muted-foreground hover:bg-muted transition-colors" aria-label="In văn bản">
                <Printer className="w-3.5 h-3.5" /> In
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-5 py-3 text-[13px] transition-colors relative ${
                activeTab === tab.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {'count' in tab && tab.count > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-muted text-[10px] flex items-center justify-center">{tab.count}</span>
              )}
              {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow icon={Building2} label="Nơi gửi" value={`${doc.sender} - ${doc.senderUnit}`} />
                <InfoRow icon={Building2} label="Nơi nhận" value={`${doc.receiver}${doc.receiverUnit ? ' - ' + doc.receiverUnit : ''}`} />
                <InfoRow icon={Calendar} label="Ngày văn bản" value={formatDate(doc.date)} />
                {doc.receivedDate && <InfoRow icon={Calendar} label="Ngày tiếp nhận" value={formatDate(doc.receivedDate)} />}
                {doc.deadline && (
                  <InfoRow icon={Clock} label="Hạn xử lý" value={formatDate(doc.deadline)}
                    valueClass={new Date(doc.deadline) < new Date() ? 'text-red-600 dark:text-red-400' : 'text-foreground'} />
                )}
                <InfoRow icon={User} label="Người tạo" value={doc.createdByName} />
                {doc.assignedToNames && doc.assignedToNames.length > 0 && (
                  <InfoRow icon={User} label="Người xử lý" value={doc.assignedToNames.join(', ')} />
                )}
                {doc.bookNumber && <InfoRow icon={Hash} label="Số thứ tự sổ" value={`#${doc.bookNumber}`} />}
              </div>
              <div>
                <h4 className="text-[13px] text-foreground mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" /> Nội dung trích yếu
                </h4>
                <div className="p-4 bg-accent/30 rounded-lg text-[13px] text-foreground leading-relaxed">{doc.content}</div>
              </div>
              {doc.relatedDocIds.length > 0 && (
                <div>
                  <h4 className="text-[13px] text-foreground mb-2">Văn bản liên quan</h4>
                  <div className="flex flex-wrap gap-2">
                    {doc.relatedDocIds.map((id) => (
                      <span key={id} className="text-[12px] px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50">{id}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Workflow Tab */}
          {activeTab === 'workflow' && (
            <div className="p-6">
              {/* Detailed timeline */}
              <h4 className="text-[13px] text-foreground mb-4 flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-primary" /> Lịch sử xử lý chi tiết
              </h4>
              <div className="relative">
                {doc.workflow.map((step, idx) => (
                  <div key={step.id} className="flex gap-4 mb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        step.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/40' :
                        step.status === 'current' ? 'bg-blue-100 dark:bg-blue-900/40' :
                        step.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/40' :
                        'bg-muted'
                      }`}>
                        {getWorkflowIcon(step)}
                      </div>
                      {idx < doc.workflow.length - 1 && (
                        <div className={`w-0.5 flex-1 min-h-[40px] ${step.status === 'completed' ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-border'}`} />
                      )}
                    </div>
                    <div className={`flex-1 pb-6 ${step.status === 'pending' ? 'opacity-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <h4 className="text-[13px] text-foreground">{step.action}</h4>
                        {step.timestamp && (
                          <span className="text-[11px] text-muted-foreground">{new Date(step.timestamp).toLocaleString('vi-VN')}</span>
                        )}
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">{step.actorName} - {step.actorRole}</p>
                      {step.comment && (
                        <div className="mt-2 p-3 bg-accent/40 rounded-lg text-[12px] text-foreground leading-relaxed border-l-3 border-primary/30">
                          {step.comment}
                        </div>
                      )}
                      {step.status === 'current' && (
                        <span className="inline-flex items-center gap-1 mt-2 text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Đang chờ xử lý
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="p-6 space-y-4">
              {doc.comments.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground">Chưa có ý kiến nào</p>
                </div>
              )}
              {doc.comments.map((cmt) => (
                <div key={cmt.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-blue-400 flex items-center justify-center text-white text-[10px] shrink-0">
                    {cmt.userAvatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] text-foreground">{cmt.userName}</span>
                      <span className="text-[11px] text-muted-foreground">{new Date(cmt.timestamp).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="p-3 bg-accent/40 rounded-lg text-[13px] text-foreground leading-relaxed">{cmt.content}</div>
                  </div>
                </div>
              ))}
              {!doc.isLocked && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-blue-400 flex items-center justify-center text-white text-[10px] shrink-0">
                    {user?.avatar}
                  </div>
                  <div className="flex-1">
                    <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Thêm ý kiến..."
                      className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none resize-none" />
                    <div className="flex justify-end mt-2">
                      <button onClick={() => { if (comment.trim()) { onAction(doc.id, 'comment', { comment: comment.trim() }); setComment(''); } }}
                        disabled={!comment.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] hover:opacity-90 disabled:opacity-40 shadow-sm">
                        <Send className="w-3.5 h-3.5" /> Gửi
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === 'attachments' && (
            <div className="p-6 space-y-2">
              {doc.attachments.length === 0 && (
                <div className="text-center py-8">
                  <Paperclip className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground">Không có file đính kèm</p>
                </div>
              )}
              {doc.attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors group">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    att.type === 'pdf' ? 'bg-red-100 dark:bg-red-900/40' :
                    att.type === 'xlsx' ? 'bg-emerald-100 dark:bg-emerald-900/40' :
                    att.type === 'docx' ? 'bg-blue-100 dark:bg-blue-900/40' :
                    'bg-muted'
                  }`}>
                    <span className={`text-[10px] uppercase ${
                      att.type === 'pdf' ? 'text-red-600 dark:text-red-400' :
                      att.type === 'xlsx' ? 'text-emerald-600 dark:text-emerald-400' :
                      att.type === 'docx' ? 'text-blue-600 dark:text-blue-400' :
                      'text-muted-foreground'
                    }`}>{att.type}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground truncate">{att.name}</p>
                    <p className="text-[11px] text-muted-foreground">{att.size} | {att.uploadedBy} | {att.uploadedAt}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toast.success(`Đang xem ${att.name}`)} className="p-2 rounded-lg hover:bg-accent transition-colors" title="Xem" aria-label={`Xem file ${att.name}`}><Eye className="w-4 h-4 text-muted-foreground" /></button>
                    <button onClick={() => toast.success(`Đã tải ${att.name}`)} className="p-2 rounded-lg hover:bg-accent transition-colors" title="Tải xuống" aria-label={`Tải xuống ${att.name}`}><Download className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-md"
            role="dialog" aria-modal="true" aria-labelledby="action-modal-title"
            style={{ boxShadow: 'var(--shadow-xl)' }}
            ref={actionDialogRef}>
            <div className="px-6 py-4 border-b border-border">
              <h3 id="action-modal-title" className="text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                {showActionModal === 'assign' ? 'Phân công xử lý' :
                 showActionModal === 'reject' ? 'Từ chối / Trả lại' :
                 showActionModal === 'publish' ? 'Phát hành văn bản' :
                 showActionModal === 'distribute' ? 'Phân phối văn bản' :
                 'Xác nhận thao tác'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {showActionModal === 'assign' && (
                <div>
                  <label className="block text-[13px] text-foreground mb-1.5">Giao cho (phòng ban / cá nhân)</label>
                  <input type="text" value={assignees} onChange={(e) => setAssignees(e.target.value)}
                    placeholder="VD: Phòng CNTT, Nguyễn Văn An..."
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                </div>
              )}
              <div>
                <label className="block text-[13px] text-foreground mb-1.5">
                  {showActionModal === 'reject' ? 'Lý do trả lại *' : 'Ý kiến / Ghi chú'}
                </label>
                <textarea rows={3} value={actionComment} onChange={(e) => setActionComment(e.target.value)} placeholder="Nhập ý kiến..."
                  className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none resize-none" />
              </div>
              {showActionModal === 'publish' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg text-[12px] text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p>Lưu ý quan trọng</p>
                    <p className="mt-0.5">Sau khi phát hành, văn bản sẽ được cấp số hiệu chính thức và <strong>không thể chỉnh sửa hoặc xóa</strong>.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => { setShowActionModal(null); setActionComment(''); setAssignees(''); }} className="px-4 py-2 rounded-xl text-[13px] text-muted-foreground hover:bg-accent transition-colors">Hủy</button>
              <button onClick={confirmAction}
                disabled={showActionModal === 'reject' && !actionComment.trim()}
                className={`px-5 py-2 rounded-xl text-[13px] text-white hover:opacity-90 disabled:opacity-40 transition-all active:scale-[0.98] ${
                  showActionModal === 'reject' ? 'bg-red-600' : 'bg-primary'
                }`}
                style={{ boxShadow: 'var(--shadow-sm)' }}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, valueClass = 'text-foreground' }: {
  icon: typeof FileText; label: string; value: string; valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-accent/20">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={`text-[13px] mt-0.5 ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}