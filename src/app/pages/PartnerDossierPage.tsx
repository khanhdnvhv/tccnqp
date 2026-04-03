import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import {
  delegations,
  delegationStatusLabels,
  delegationStatusColors,
  type Delegation,
} from '../data/delegationData';
import {
  archiveDocuments,
  docCategoryLabels,
  docCategoryColors,
  type ArchiveDocument,
} from '../data/archiveData';
import {
  partners as initialPartners,
  partnerFieldLabels,
  contractStatusLabels,
  contractStatusColors,
  relationshipLevelLabels,
  relationshipLevelColors,
  getPartnerStats,
  type Partner,
  type PartnerField,
  type PartnerContract,
  type RelationshipLevel,
} from '../data/partnerData';
import {
  Building2, Search, X, ChevronRight, Globe, Mail, Phone,
  MapPin, Calendar, FileText, TrendingUp, Users, Star, ExternalLink,
  Briefcase, DollarSign, History, Eye, Plus, BarChart2,
  ShieldCheck, AlertCircle, CheckCircle2, Clock, Gift, Package,
  ArrowRight, UserCheck, Shield, Flag, ScanLine, Download,
  FileCode, FileImage, FileSpreadsheet, Printer, Tag,
} from 'lucide-react';

const countryFlags: Record<string, string> = {
  'Việt Nam': '🇻🇳', 'Nga': '🇷🇺', 'Israel': '🇮🇱', 'Hàn Quốc': '🇰🇷',
  'Mỹ': '🇺🇸', 'Trung Quốc': '🇨🇳', 'Pháp': '🇫🇷',
};

function formatCurrency(value: number): string {
  if (value === 0) return '—';
  if (value >= 1000) return `${(value / 1000).toFixed(1)} tỷ`;
  return `${value.toLocaleString('vi-VN')} triệu`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fileTypeIcon(ft: string) {
  if (ft === 'pdf') return <FileText className="w-4 h-4 text-red-500" />;
  if (ft === 'docx') return <FileCode className="w-4 h-4 text-blue-500" />;
  if (ft === 'xlsx') return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
  if (ft === 'jpg' || ft === 'png') return <FileImage className="w-4 h-4 text-amber-500" />;
  return <FileText className="w-4 h-4 text-muted-foreground" />;
}

// ---- Find archive docs related to a partner + keywords ----
function findRelatedDocs(partnerShortName: string, keywords: string[]): ArchiveDocument[] {
  const kw = keywords.map((k) => k.toLowerCase());
  return archiveDocuments.filter((doc) => {
    const matchPartner = doc.relatedPartner?.toLowerCase().includes(partnerShortName.toLowerCase());
    const matchKeyword = kw.some((k) =>
      doc.title.toLowerCase().includes(k) ||
      doc.ocrContent?.toLowerCase().includes(k) ||
      doc.tags.some((t) => t.toLowerCase().includes(k))
    );
    return matchPartner || matchKeyword;
  });
}

// ---- Linked Documents Component ----
function LinkedDocuments({ docs, title }: { docs: ArchiveDocument[]; title: string }) {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  if (docs.length === 0) return (
    <div className="mt-3 p-3 border border-dashed border-border rounded-xl text-center">
      <ScanLine className="w-6 h-6 mx-auto mb-1.5 text-muted-foreground/30" />
      <p className="text-[12px] text-muted-foreground">Chưa có tài liệu số hóa liên quan trong Kho lưu trữ</p>
    </div>
  );
  return (
    <div className="mt-3">
      <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1.5">
        <ScanLine className="w-3.5 h-3.5 text-violet-500" /> {title} ({docs.length} tài liệu)
      </p>
      <div className="space-y-1.5">
        {docs.map((doc) => {
          const cc = docCategoryColors[doc.category];
          const isExpanded = expandedDoc === doc.id;
          return (
            <div key={doc.id} className="border border-border rounded-lg overflow-hidden">
              <div
                onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                className="flex items-center gap-2.5 p-2.5 cursor-pointer hover:bg-accent/30 transition-colors"
              >
                {fileTypeIcon(doc.fileType)}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground truncate" style={{ fontWeight: 500 }}>{doc.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${cc.bg} ${cc.text}`}>{cc.icon} {docCategoryLabels[doc.category]}</span>
                    <span className="text-[10px] text-muted-foreground">{doc.number}</span>
                    <span className="text-[10px] text-muted-foreground">{formatDate(doc.date)}</span>
                  </div>
                </div>
                {doc.ocrStatus === 'done' && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 flex items-center gap-0.5 shrink-0"><ScanLine className="w-2.5 h-2.5" /> OCR</span>}
                <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground/40 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </div>
              {isExpanded && (
                <div className="px-3 pb-3 pt-0 border-t border-border/50">
                  <div className="grid grid-cols-3 gap-2 mt-2 mb-2">
                    <div className="bg-muted/30 rounded-lg p-2"><p className="text-[9px] text-muted-foreground uppercase">Từ</p><p className="text-[11px] text-foreground truncate">{doc.sender}</p></div>
                    <div className="bg-muted/30 rounded-lg p-2"><p className="text-[9px] text-muted-foreground uppercase">Đến</p><p className="text-[11px] text-foreground truncate">{doc.receiver}</p></div>
                    <div className="bg-muted/30 rounded-lg p-2"><p className="text-[9px] text-muted-foreground uppercase">Kích thước</p><p className="text-[11px] text-foreground">{doc.size}{doc.pages ? ` — ${doc.pages} trang` : ''}</p></div>
                  </div>
                  {doc.ocrContent ? (
                    <div className="bg-muted/20 border border-border rounded-lg p-3 text-[12px] text-foreground/80 leading-relaxed max-h-40 overflow-y-auto">
                      {doc.ocrContent}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground/50 italic">Chưa có nội dung OCR</p>
                  )}
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.tags.map((tag) => <span key={tag} className="text-[10px] bg-muted/50 px-2 py-0.5 rounded-full border border-border text-muted-foreground">{tag}</span>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Detail modal types ----
type DetailModal =
  | { type: 'contract'; contract: PartnerContract; partner: Partner }
  | { type: 'delegation'; delegation: Delegation; partner: Partner }
  | { type: 'visit'; visit: Partner['visitHistory'][0]; partner: Partner }
  | null;

export function PartnerDossierPage() {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [detailModal, setDetailModal] = useState<DetailModal>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterField, setFilterField] = useState<PartnerField | 'all'>('all');
  const [filterLevel, setFilterLevel] = useState<RelationshipLevel | 'all'>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');

  const stats = useMemo(() => getPartnerStats(), []);
  const countries = useMemo(() => [...new Set(initialPartners.map((p) => p.country))].sort(), []);
  const totalProfit = useMemo(() => initialPartners.reduce((s, p) => s + p.totalProfit, 0), []);

  const filtered = useMemo(() => {
    return initialPartners.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.shortName.toLowerCase().includes(q) || p.contactPerson.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
      return matchSearch && (filterField === 'all' || p.field === filterField) && (filterLevel === 'all' || p.relationshipLevel === filterLevel) && (filterCountry === 'all' || p.country === filterCountry);
    });
  }, [searchQuery, filterField, filterLevel, filterCountry]);

  const getRelatedPartners = (partner: Partner) => partner.relations.map((r) => { const rel = initialPartners.find((p) => p.id === r.partnerId); return rel ? { partner: rel, relation: r } : null; }).filter(Boolean) as { partner: Partner; relation: typeof partner.relations[0] }[];
  const relTypeLabel: Record<string, string> = { joint_venture: 'Liên doanh', subcontractor: 'Thầu phụ', competitor: 'Cạnh tranh', referral: 'Giới thiệu', consortium: 'Liên danh' };
  const getPartnerDelegations = (partnerId: string) => delegations.filter((d) => d.partnerId === partnerId);
  const getPartnerGifts = (partnerId: string) => {
    return getPartnerDelegations(partnerId).flatMap((d) => d.gifts.map((g) => ({ ...g, delegationCode: d.code, delegationTitle: d.title, scheduledDate: d.scheduledDate })));
  };

  return (
    <PageTransition>
      <Header title="Lý lịch Đối tác" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Building2, label: 'Tổng đối tác', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { icon: ShieldCheck, label: 'Đang hoạt động', value: stats.active, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { icon: DollarSign, label: 'Tổng giá trị HĐ', value: formatCurrency(stats.totalContractValue), color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
            { icon: TrendingUp, label: 'Tổng lợi nhuận', value: formatCurrency(totalProfit), color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}><s.icon className={`w-4.5 h-4.5 ${s.color}`} /></div>
              <div><p className="text-[18px] text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{s.value}</p><p className="text-[11px] text-muted-foreground">{s.label}</p></div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3" style={{ boxShadow: 'var(--shadow-xs)' }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              <input type="text" placeholder="Tìm tên, mã, người liên hệ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 outline-none transition-all" />
            </div>
            <select value={filterField} onChange={(e) => setFilterField(e.target.value as PartnerField | 'all')} className="px-3 py-2 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer">
              <option value="all">Tất cả lĩnh vực</option>
              {(Object.keys(partnerFieldLabels) as PartnerField[]).map((f) => <option key={f} value={f}>{partnerFieldLabels[f]}</option>)}
            </select>
            <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value as RelationshipLevel | 'all')} className="px-3 py-2 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer">
              <option value="all">Tất cả cấp độ</option>
              {(Object.keys(relationshipLevelLabels) as RelationshipLevel[]).map((l) => <option key={l} value={l}>{relationshipLevelLabels[l]}</option>)}
            </select>
            <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} className="px-3 py-2 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer">
              <option value="all">Tất cả quốc gia</option>
              {countries.map((c) => <option key={c} value={c}>{countryFlags[c] || ''} {c}</option>)}
            </select>
          </div>
          <p className="text-[12px] text-muted-foreground">Hiển thị {filtered.length} / {initialPartners.length} đối tác</p>
        </div>

        {/* Partner List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((partner) => {
            const levelC = relationshipLevelColors[partner.relationshipLevel];
            const activeContracts = partner.contracts.filter((c) => c.status === 'active').length;
            const delCount = getPartnerDelegations(partner.id).length;
            return (
              <div key={partner.id} onClick={() => setSelectedPartner(partner)} className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 cursor-pointer transition-all group" style={{ boxShadow: 'var(--shadow-xs)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] text-muted-foreground">{partner.code}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] ${levelC.bg} ${levelC.text}`}>{relationshipLevelLabels[partner.relationshipLevel]}</span>
                    </div>
                    <h3 className="text-[14px] text-foreground truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{partner.shortName}</h3>
                    <p className="text-[12px] text-muted-foreground truncate">{partner.name}</p>
                  </div>
                  <div className="text-[16px] shrink-0 ml-2">{countryFlags[partner.country] || '🌐'}</div>
                </div>
                <div className="space-y-1.5 text-[12px]">
                  <div className="flex items-center gap-2 text-muted-foreground"><Briefcase className="w-3 h-3 shrink-0" /><span className="truncate">{partnerFieldLabels[partner.field]}</span></div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-3 h-3 shrink-0" /><span className="truncate">{partner.contactPerson} — {partner.contactPosition}</span></div>
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                  <div className="flex-1"><p className="text-[10px] text-muted-foreground">Giá trị HĐ</p><p className="text-[13px] text-foreground" style={{ fontWeight: 600 }}>{formatCurrency(partner.totalContractValue)}</p></div>
                  <div className="flex-1"><p className="text-[10px] text-muted-foreground">Lợi nhuận</p><p className="text-[13px] text-foreground" style={{ fontWeight: 600 }}>{formatCurrency(partner.totalProfit)}</p></div>
                  <div className="flex-1"><p className="text-[10px] text-muted-foreground">HĐ hiệu lực</p><p className="text-[13px] text-foreground" style={{ fontWeight: 600 }}>{activeContracts}</p></div>
                  <div><p className="text-[10px] text-muted-foreground">Đoàn VLV</p><p className="text-[13px] text-foreground" style={{ fontWeight: 600 }}>{partner.totalVisits + delCount}</p></div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground"><Building2 className="w-8 h-8 mx-auto mb-2 opacity-20" /><p className="text-[13px]">Không tìm thấy đối tác phù hợp</p></div>}
        </div>
      </div>

      {/* ===== PARTNER DETAIL DRAWER ===== */}
      <AnimatePresence>
        {selectedPartner && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setSelectedPartner(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-card border-l border-border z-50 flex flex-col overflow-hidden" style={{ boxShadow: '-4px 0 24px rgba(0,0,0,0.15)' }}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[16px]">{countryFlags[selectedPartner.country] || '🌐'}</span>
                    <span className="text-[11px] text-muted-foreground">{selectedPartner.code}</span>
                    {(() => { const lc = relationshipLevelColors[selectedPartner.relationshipLevel]; return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] ${lc.bg} ${lc.text}`}>{relationshipLevelLabels[selectedPartner.relationshipLevel]}</span>; })()}
                  </div>
                  <h2 className="text-[17px] text-foreground truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{selectedPartner.name}</h2>
                  <p className="text-[12px] text-muted-foreground">{partnerFieldLabels[selectedPartner.field]} — {selectedPartner.contactPerson}</p>
                </div>
                <button onClick={() => setSelectedPartner(null)} className="p-2 rounded-lg hover:bg-accent shrink-0"><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">
                {/* Quick stats */}
                <div className="grid grid-cols-4 gap-3 px-6 py-4 border-b border-border bg-surface-2/30">
                  {[
                    { label: 'Giá trị HĐ', value: formatCurrency(selectedPartner.totalContractValue), color: 'text-emerald-600' },
                    { label: 'Lợi nhuận', value: formatCurrency(selectedPartner.totalProfit), color: 'text-amber-600' },
                    { label: 'Hợp đồng', value: String(selectedPartner.contracts.length), color: 'text-blue-600' },
                    { label: 'Lượt thăm', value: String(selectedPartner.totalVisits + getPartnerDelegations(selectedPartner.id).length), color: 'text-violet-600' },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className={`text-[18px] ${s.color}`} style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-5 space-y-6">
                  {/* 1. THÔNG TIN */}
                  <section>
                    <h3 className="text-[13px] text-foreground mb-3 flex items-center gap-2 pb-2 border-b border-border" style={{ fontWeight: 600 }}><Building2 className="w-4 h-4 text-primary" /> Thông tin định danh</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      {[
                        { icon: Globe, label: 'Quốc gia', value: `${countryFlags[selectedPartner.country] || ''} ${selectedPartner.country}` },
                        { icon: Briefcase, label: 'Lĩnh vực', value: partnerFieldLabels[selectedPartner.field] },
                        { icon: MapPin, label: 'Địa chỉ', value: selectedPartner.address },
                        { icon: Calendar, label: 'Năm thành lập', value: String(selectedPartner.foundingYear) },
                        { icon: Mail, label: 'Email', value: selectedPartner.email },
                        { icon: Phone, label: 'Điện thoại', value: selectedPartner.phone },
                        { icon: Users, label: 'Người liên hệ', value: `${selectedPartner.contactPerson} — ${selectedPartner.contactPosition}` },
                        { icon: Calendar, label: 'Lần đầu liên hệ', value: formatDate(selectedPartner.firstContactDate) },
                        { icon: History, label: 'Lần thăm gần nhất', value: selectedPartner.lastVisitDate ? formatDate(selectedPartner.lastVisitDate) : '—' },
                        ...(selectedPartner.taxCode ? [{ icon: FileText, label: 'Mã số thuế', value: selectedPartner.taxCode }] : []),
                        ...(selectedPartner.website ? [{ icon: ExternalLink, label: 'Website', value: selectedPartner.website }] : []),
                      ].map((row) => (
                        <div key={row.label} className="flex items-start gap-2"><row.icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" /><div><p className="text-[10px] text-muted-foreground">{row.label}</p><p className="text-[13px] text-foreground">{row.value}</p></div></div>
                      ))}
                    </div>
                    {selectedPartner.notes && <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl"><p className="text-[12px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{selectedPartner.notes}</p></div>}
                    {getRelatedPartners(selectedPartner).length > 0 && (
                      <div className="mt-3"><p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1"><Star className="w-3 h-3" /> Quan hệ đối tác</p>
                        <div className="space-y-1.5">{getRelatedPartners(selectedPartner).map(({ partner: rp, relation }) => (
                          <div key={rp.id} className="flex items-center gap-3 p-2 bg-surface-2 rounded-lg"><div className="flex-1 min-w-0"><p className="text-[12px] text-foreground truncate">{rp.shortName}</p><p className="text-[10px] text-muted-foreground truncate">{relation.description}</p></div><span className="text-[10px] px-2 py-0.5 bg-muted rounded-md text-muted-foreground shrink-0">{relTypeLabel[relation.type] || relation.type}</span></div>
                        ))}</div>
                      </div>
                    )}
                  </section>

                  {/* 2. HỢP ĐỒNG — clickable */}
                  <section>
                    <h3 className="text-[13px] text-foreground mb-3 flex items-center gap-2 pb-2 border-b border-border" style={{ fontWeight: 600 }}>
                      <DollarSign className="w-4 h-4 text-emerald-600" /> Hợp đồng ({selectedPartner.contracts.length})
                      <span className="ml-auto text-[11px] text-muted-foreground font-normal">Tổng: {formatCurrency(selectedPartner.totalContractValue)} — LN: {formatCurrency(selectedPartner.totalProfit)}</span>
                    </h3>
                    {selectedPartner.contracts.length > 0 ? (
                      <div className="space-y-2">
                        {selectedPartner.contracts.map((c) => {
                          const sc = contractStatusColors[c.status];
                          return (
                            <div key={c.id}
                              onClick={() => setDetailModal({ type: 'contract', contract: c, partner: selectedPartner })}
                              className="p-3.5 border border-border rounded-xl space-y-2 hover:border-primary/30 cursor-pointer transition-all group/card">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] text-muted-foreground font-mono">{c.contractNumber}</p>
                                  <p className="text-[13px] text-foreground group-hover/card:text-primary transition-colors" style={{ fontWeight: 600 }}>{c.name}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] ${sc.bg} ${sc.text}`}>{contractStatusLabels[c.status]}</span>
                                  <Eye className="w-3.5 h-3.5 text-muted-foreground/30 group-hover/card:text-primary transition-colors" />
                                </div>
                              </div>
                              <p className="text-[12px] text-muted-foreground">{c.description}</p>
                              <div className="flex items-center gap-4 text-[12px] flex-wrap">
                                <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="w-3 h-3" /> {formatDate(c.signDate)} → {formatDate(c.endDate)}</span>
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><DollarSign className="w-3 h-3" /> {formatCurrency(c.value)}</span>
                                {c.profit > 0 && <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><TrendingUp className="w-3 h-3" /> LN: {formatCurrency(c.profit)}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : <p className="text-center text-[12px] text-muted-foreground py-4">Chưa có hợp đồng</p>}
                  </section>

                  {/* 3. LỊCH SỬ RA VÀO — clickable */}
                  <section>
                    {(() => {
                      const partnerDels = getPartnerDelegations(selectedPartner.id);
                      const allHistory = [
                        ...selectedPartner.visitHistory.map((v) => ({ type: 'visit' as const, date: v.date, visit: v })),
                        ...partnerDels.map((d) => ({ type: 'delegation' as const, date: d.scheduledDate, delegation: d })),
                      ].sort((a, b) => b.date.localeCompare(a.date));
                      return (
                        <>
                          <h3 className="text-[13px] text-foreground mb-3 flex items-center gap-2 pb-2 border-b border-border" style={{ fontWeight: 600 }}>
                            <History className="w-4 h-4 text-blue-600" /> Lịch sử ra vào làm việc ({allHistory.length})
                          </h3>
                          {allHistory.length > 0 ? (
                            <div className="space-y-2">
                              {allHistory.map((item, idx) => {
                                if (item.type === 'delegation') {
                                  const d = item.delegation;
                                  const sc = delegationStatusColors[d.status];
                                  return (
                                    <div key={`del-${d.id}`}
                                      onClick={() => setDetailModal({ type: 'delegation', delegation: d, partner: selectedPartner })}
                                      className="p-3 border border-border rounded-xl hover:border-primary/30 cursor-pointer transition-all group/card">
                                      <div className="flex items-start justify-between gap-2 mb-1.5">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">Đoàn VLV</span>
                                            <span className="text-[10px] text-muted-foreground">{d.code}</span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] ${sc.bg} ${sc.text}`}><span className={`w-1 h-1 rounded-full ${sc.dot}`} />{delegationStatusLabels[d.status]}</span>
                                          </div>
                                          <p className="text-[13px] text-foreground group-hover/card:text-primary transition-colors" style={{ fontWeight: 500 }}>{d.title}</p>
                                        </div>
                                        <Eye className="w-3.5 h-3.5 text-muted-foreground/30 group-hover/card:text-primary transition-colors shrink-0 mt-1" />
                                      </div>
                                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(d.scheduledDate)}</span>
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {d.members.length} người</span>
                                        <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> {d.hostName}</span>
                                        {d.gifts.length > 0 && <span className="flex items-center gap-1 text-amber-600"><Gift className="w-3 h-3" /> {d.gifts.length} quà</span>}
                                      </div>
                                    </div>
                                  );
                                } else {
                                  const v = item.visit;
                                  return (
                                    <div key={`visit-${v.id}`}
                                      onClick={() => setDetailModal({ type: 'visit', visit: v, partner: selectedPartner })}
                                      className="p-3 border border-border rounded-xl hover:border-primary/30 cursor-pointer transition-all group/card">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-medium">Thăm quan</span>
                                        <span className="text-[11px] text-muted-foreground"><Calendar className="w-3 h-3 inline mr-1" />{formatDate(v.date)}</span>
                                        <span className="text-[11px] text-muted-foreground"><Users className="w-3 h-3 inline mr-1" />{v.attendees} người</span>
                                        <Eye className="w-3.5 h-3.5 text-muted-foreground/30 group-hover/card:text-primary transition-colors ml-auto" />
                                      </div>
                                      <p className="text-[13px] text-foreground group-hover/card:text-primary transition-colors" style={{ fontWeight: 500 }}>{v.purpose}</p>
                                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1"><CheckCircle2 className="w-3 h-3" /> {v.result}</p>
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          ) : <p className="text-center text-[12px] text-muted-foreground py-4">Chưa có lịch sử</p>}
                        </>
                      );
                    })()}
                  </section>

                  {/* 4. QUÀ TẶNG */}
                  <section>
                    {(() => {
                      const allGifts = getPartnerGifts(selectedPartner.id);
                      return (
                        <>
                          <h3 className="text-[13px] text-foreground mb-3 flex items-center gap-2 pb-2 border-b border-border" style={{ fontWeight: 600 }}><Gift className="w-4 h-4 text-amber-600" /> Quà tặng ({allGifts.length})</h3>
                          {allGifts.length > 0 ? (
                            <div className="space-y-2">{allGifts.map((g) => (
                              <div key={g.id} className="flex items-center gap-3 p-3 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 rounded-lg">
                                <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                                <div className="flex-1 min-w-0"><p className="text-[13px] text-foreground">{g.description}</p><p className="text-[10px] text-muted-foreground">{g.delegationCode} — {formatDate(g.scheduledDate)}</p></div>
                                <span className="text-[11px] text-muted-foreground shrink-0">x{g.quantity}</span>
                                {g.estimatedValue && <span className="text-[11px] text-amber-600 shrink-0">~{g.estimatedValue} tr</span>}
                                <span className={`text-[10px] px-2 py-0.5 rounded-md shrink-0 ${g.fromPartner ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700'}`}>{g.fromPartner ? 'Từ đối tác' : 'Tặng đối tác'}</span>
                              </div>
                            ))}</div>
                          ) : <p className="text-center text-[12px] text-muted-foreground py-4">Chưa có quà tặng</p>}
                        </>
                      );
                    })()}
                  </section>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== DETAIL MODAL (Contract / Delegation / Visit) ===== */}
      <AnimatePresence>
        {detailModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setDetailModal(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-[5%] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-card border border-border rounded-2xl z-[60] flex flex-col overflow-hidden"
              style={{ boxShadow: 'var(--shadow-xl)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* CONTRACT DETAIL */}
              {detailModal.type === 'contract' && (() => {
                const { contract: c, partner } = detailModal;
                const sc = contractStatusColors[c.status];
                const relDocs = findRelatedDocs(partner.shortName, [c.contractNumber, c.name, ...c.products.slice(0, 2)]);
                return (
                  <>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <span className="text-[11px] text-muted-foreground font-mono">{c.contractNumber}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] ${sc.bg} ${sc.text}`}>{contractStatusLabels[c.status]}</span>
                        </div>
                        <h3 className="text-[15px] text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{c.name}</h3>
                      </div>
                      <button onClick={() => setDetailModal(null)} className="p-2 rounded-lg hover:bg-accent shrink-0"><X className="w-5 h-5 text-muted-foreground" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      <p className="text-[13px] text-muted-foreground">{c.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: 'Đối tác', value: partner.shortName },
                          { label: 'Ngày ký', value: formatDate(c.signDate) },
                          { label: 'Ngày kết thúc', value: formatDate(c.endDate) },
                          { label: 'Giá trị', value: formatCurrency(c.value) },
                          { label: 'Lợi nhuận', value: formatCurrency(c.profit) },
                          { label: 'Trạng thái', value: contractStatusLabels[c.status] },
                        ].map((r) => (
                          <div key={r.label} className="bg-muted/30 rounded-xl p-2.5"><p className="text-[9px] text-muted-foreground uppercase">{r.label}</p><p className="text-[12px] text-foreground" style={{ fontWeight: 500 }}>{r.value}</p></div>
                        ))}
                      </div>
                      <div><p className="text-[11px] text-muted-foreground mb-1.5">Sản phẩm / Dịch vụ</p><div className="flex flex-wrap gap-1.5">{c.products.map((p) => <span key={p} className="px-2.5 py-1 bg-muted rounded-lg text-[11px] text-foreground">{p}</span>)}</div></div>
                      <LinkedDocuments docs={relDocs} title="Tài liệu liên quan trong Kho số hóa" />
                    </div>
                  </>
                );
              })()}

              {/* DELEGATION DETAIL */}
              {detailModal.type === 'delegation' && (() => {
                const { delegation: d, partner } = detailModal;
                const sc = delegationStatusColors[d.status];
                const relDocs = findRelatedDocs(partner.shortName, [d.code, d.title, d.partnerName, 'biên bản', 'công văn']);
                return (
                  <>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-[11px] text-muted-foreground">{d.code}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${sc.bg} ${sc.text}`}><span className={`w-1 h-1 rounded-full ${sc.dot}`} />{delegationStatusLabels[d.status]}</span>
                        </div>
                        <h3 className="text-[15px] text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{d.title}</h3>
                      </div>
                      <button onClick={() => setDetailModal(null)} className="p-2 rounded-lg hover:bg-accent shrink-0"><X className="w-5 h-5 text-muted-foreground" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      <p className="text-[13px] text-muted-foreground">{d.purpose}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Đối tác', value: d.partnerName, icon: Building2 },
                          { label: 'Ngày', value: `${formatDate(d.scheduledDate)}${d.scheduledEndDate !== d.scheduledDate ? ` → ${formatDate(d.scheduledEndDate)}` : ''}`, icon: Calendar },
                          { label: 'Người tiếp', value: `${d.hostName} — ${d.hostUnit}`, icon: UserCheck },
                          { label: 'Phòng họp', value: d.meetingRoom || '—', icon: MapPin },
                          { label: 'VB đồng ý', value: d.approvalDocNumber || (d.priority === 'directive' ? 'Miễn (TT chỉ đạo)' : 'Chưa có'), icon: FileText },
                        ].map((r) => (
                          <div key={r.label} className="flex items-start gap-2"><r.icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" /><div><p className="text-[10px] text-muted-foreground">{r.label}</p><p className="text-[12px] text-foreground">{r.value}</p></div></div>
                        ))}
                      </div>
                      {/* Members */}
                      <div>
                        <p className="text-[12px] text-foreground mb-1.5" style={{ fontWeight: 600 }}>Nhân sự ({d.members.length})</p>
                        <div className="bg-surface-2 rounded-xl divide-y divide-border/50">
                          {d.members.map((m, i) => (
                            <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 text-[11px]">
                              <span className="text-muted-foreground w-5">{i + 1}</span>
                              <span className="text-foreground flex-1">{m.fullName}{m.isLeader && <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">Trưởng đoàn</span>}</span>
                              <span className="text-muted-foreground">{m.position}</span>
                              <span className="text-muted-foreground font-mono text-[10px]">{m.idNumber}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Gifts */}
                      {d.gifts.length > 0 && (
                        <div>
                          <p className="text-[12px] text-foreground mb-1.5 flex items-center gap-1" style={{ fontWeight: 600 }}><Gift className="w-3.5 h-3.5 text-amber-600" /> Quà tặng ({d.gifts.length})</p>
                          {d.gifts.map((g) => (
                            <div key={g.id} className="flex items-center gap-2 p-2.5 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg mb-1">
                              <span className="text-[12px] text-foreground flex-1">{g.description}</span>
                              <span className="text-[11px] text-muted-foreground">x{g.quantity}</span>
                              {g.estimatedValue && <span className="text-[11px] text-amber-600">~{g.estimatedValue} tr</span>}
                            </div>
                          ))}
                        </div>
                      )}
                      {d.result && <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl"><p className="text-[12px] text-emerald-700 dark:text-emerald-400 flex items-start gap-1.5"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span><strong>Kết quả:</strong> {d.result}</span></p></div>}
                      {d.note && <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl"><p className="text-[12px] text-amber-700 dark:text-amber-400">{d.note}</p></div>}
                      <LinkedDocuments docs={relDocs} title="Tài liệu liên quan trong Kho số hóa" />
                    </div>
                  </>
                );
              })()}

              {/* VISIT DETAIL */}
              {detailModal.type === 'visit' && (() => {
                const { visit: v, partner } = detailModal;
                const relDocs = findRelatedDocs(partner.shortName, [v.purpose, v.date, 'biên bản']);
                return (
                  <>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <History className="w-4 h-4 text-violet-600" />
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-medium">Thăm quan</span>
                          <span className="text-[11px] text-muted-foreground">{formatDate(v.date)}</span>
                        </div>
                        <h3 className="text-[15px] text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{v.purpose}</h3>
                      </div>
                      <button onClick={() => setDetailModal(null)} className="p-2 rounded-lg hover:bg-accent shrink-0"><X className="w-5 h-5 text-muted-foreground" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-muted/30 rounded-xl p-3"><p className="text-[9px] text-muted-foreground uppercase">Đối tác</p><p className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>{partner.shortName}</p></div>
                        <div className="bg-muted/30 rounded-xl p-3"><p className="text-[9px] text-muted-foreground uppercase">Ngày</p><p className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>{formatDate(v.date)}</p></div>
                        <div className="bg-muted/30 rounded-xl p-3"><p className="text-[9px] text-muted-foreground uppercase">Số người</p><p className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>{v.attendees} người</p></div>
                      </div>
                      <div><p className="text-[12px] text-foreground mb-1" style={{ fontWeight: 600 }}>Mục đích</p><p className="text-[13px] text-foreground">{v.purpose}</p></div>
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl">
                        <p className="text-[12px] text-emerald-700 dark:text-emerald-400 flex items-start gap-1.5"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span><strong>Kết quả:</strong> {v.result}</span></p>
                      </div>
                      <LinkedDocuments docs={relDocs} title="Biên bản / Công văn liên quan trong Kho số hóa" />
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
