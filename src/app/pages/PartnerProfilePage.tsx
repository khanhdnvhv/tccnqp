import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
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
  type RelationshipLevel,
} from '../data/partnerData';
import {
  Building2, Search, Filter, X, ChevronRight, Globe, Mail, Phone,
  MapPin, Calendar, FileText, TrendingUp, Users, Star, ExternalLink,
  Briefcase, DollarSign, History, Network, Eye, Plus, BarChart2,
  ShieldCheck, AlertCircle, CheckCircle2, Clock,
} from 'lucide-react';

type ActiveTab = 'profile' | 'relations';
type DetailTab = 'info' | 'contracts' | 'visits';

const countryFlags: Record<string, string> = {
  'Việt Nam': '🇻🇳',
  'Nga': '🇷🇺',
  'Israel': '🇮🇱',
  'Hàn Quốc': '🇰🇷',
  'Mỹ': '🇺🇸',
  'Trung Quốc': '🇨🇳',
  'Pháp': '🇫🇷',
};

function formatCurrency(value: number): string {
  if (value === 0) return '—';
  if (value >= 1000) return `${(value / 1000).toFixed(1)} tỷ`;
  return `${value.toLocaleString('vi-VN')} triệu`;
}

export function PartnerProfilePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('info');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterField, setFilterField] = useState<PartnerField | 'all'>('all');
  const [filterLevel, setFilterLevel] = useState<RelationshipLevel | 'all'>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [relationQuery, setRelationQuery] = useState('');

  const stats = useMemo(() => getPartnerStats(), []);

  const countries = useMemo(() => {
    const set = new Set(initialPartners.map((p) => p.country));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    return initialPartners.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.shortName.toLowerCase().includes(q) ||
        p.contactPerson.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q);
      const matchField = filterField === 'all' || p.field === filterField;
      const matchLevel = filterLevel === 'all' || p.relationshipLevel === filterLevel;
      const matchCountry = filterCountry === 'all' || p.country === filterCountry;
      return matchSearch && matchField && matchLevel && matchCountry;
    });
  }, [searchQuery, filterField, filterLevel, filterCountry]);

  // Relations tab: query partner relationships
  const relationResults = useMemo(() => {
    if (!relationQuery.trim()) return initialPartners;
    const q = relationQuery.toLowerCase();
    return initialPartners.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(q) || p.shortName.toLowerCase().includes(q);
      const contractMatch = p.contracts.some((c) => c.name.toLowerCase().includes(q));
      const fieldMatch = partnerFieldLabels[p.field].toLowerCase().includes(q);
      return nameMatch || contractMatch || fieldMatch;
    });
  }, [relationQuery]);

  const getRelatedPartners = (partner: Partner) => {
    return partner.relations
      .map((r) => {
        const rel = initialPartners.find((p) => p.id === r.partnerId);
        return rel ? { partner: rel, relation: r } : null;
      })
      .filter(Boolean) as { partner: Partner; relation: typeof partner.relations[0] }[];
  };

  const relTypeLabel: Record<string, string> = {
    joint_venture: 'Liên doanh',
    subcontractor: 'Thầu phụ',
    competitor: 'Cạnh tranh',
    referral: 'Giới thiệu',
    consortium: 'Liên danh dự thầu',
  };
  const relTypeColor: Record<string, string> = {
    joint_venture: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
    subcontractor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    competitor: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    referral: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    consortium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  };

  return (
    <PageTransition>
      <div className="flex flex-col h-full">
        <Header title="Hồ sơ Năng lực Đối tác" />

        <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Tổng đối tác', value: stats.total, icon: Building2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Đang hợp tác', value: stats.active, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'Tổng giá trị HĐ', value: formatCurrency(stats.totalContractValue), icon: DollarSign, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              { label: 'Tổng lượt vào làm việc', value: stats.totalVisits, icon: Users, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  <p className="text-[18px] font-bold text-foreground leading-tight">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
            {([
              { key: 'profile', label: 'Hồ sơ đối tác', icon: Briefcase },
              { key: 'relations', label: 'Truy vấn quan hệ', icon: Network },
            ] as { key: ActiveTab; label: string; icon: typeof Briefcase }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-4 min-h-0"
              >
                {/* Left: list */}
                <div className={`flex flex-col gap-3 ${selectedPartner ? 'w-[380px] shrink-0' : 'flex-1'}`}>
                  {/* Search + filter */}
                  <div className="bg-card border border-border rounded-xl p-3 space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Tìm tên, mã, người liên hệ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg text-[13px] bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={filterCountry}
                        onChange={(e) => setFilterCountry(e.target.value)}
                        className="flex-1 min-w-[120px] px-2 py-1.5 rounded-lg text-[12px] bg-background border border-border focus:outline-none"
                      >
                        <option value="all">Tất cả quốc gia</option>
                        {countries.map((c) => <option key={c} value={c}>{countryFlags[c] || '🌐'} {c}</option>)}
                      </select>
                      <select
                        value={filterField}
                        onChange={(e) => setFilterField(e.target.value as PartnerField | 'all')}
                        className="flex-1 min-w-[120px] px-2 py-1.5 rounded-lg text-[12px] bg-background border border-border focus:outline-none"
                      >
                        <option value="all">Tất cả lĩnh vực</option>
                        {Object.entries(partnerFieldLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value as RelationshipLevel | 'all')}
                        className="flex-1 min-w-[120px] px-2 py-1.5 rounded-lg text-[12px] bg-background border border-border focus:outline-none"
                      >
                        <option value="all">Tất cả mức quan hệ</option>
                        {Object.entries(relationshipLevelLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Tìm thấy {filtered.length} đối tác</p>
                  </div>

                  {/* Partner cards */}
                  <div className="space-y-2 overflow-y-auto">
                    {filtered.map((partner) => {
                      const levelColor = relationshipLevelColors[partner.relationshipLevel];
                      const isSelected = selectedPartner?.id === partner.id;
                      return (
                        <button
                          key={partner.id}
                          onClick={() => { setSelectedPartner(partner); setDetailTab('info'); }}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border bg-card hover:border-primary/30 hover:bg-accent/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 text-[16px]">
                              {countryFlags[partner.country] || '🌐'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-[13px] font-semibold text-foreground truncate">{partner.shortName}</p>
                                <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${levelColor.bg} ${levelColor.text}`}>
                                  {relationshipLevelLabels[partner.relationshipLevel]}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground truncate">{partner.name}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[11px] text-muted-foreground">{countryFlags[partner.country] || '🌐'} {partner.country}</span>
                                <span className="text-[11px] text-muted-foreground">•</span>
                                <span className="text-[11px] text-muted-foreground">{partner.totalVisits} lượt</span>
                                {partner.totalContractValue > 0 && (
                                  <>
                                    <span className="text-[11px] text-muted-foreground">•</span>
                                    <span className="text-[11px] font-medium text-primary">{formatCurrency(partner.totalContractValue)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground/40'}`} />
                          </div>
                        </button>
                      );
                    })}
                    {filtered.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-[13px]">Không tìm thấy đối tác phù hợp</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: detail panel */}
                <AnimatePresence>
                  {selectedPartner && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.25 }}
                      className="flex-1 bg-card border border-border rounded-xl overflow-hidden flex flex-col min-w-0"
                    >
                      {/* Detail header */}
                      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-[22px] shrink-0">
                            {countryFlags[selectedPartner.country] || '🌐'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="text-[15px] font-bold text-foreground leading-tight">{selectedPartner.name}</h2>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">{selectedPartner.code}</span>
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${relationshipLevelColors[selectedPartner.relationshipLevel].bg} ${relationshipLevelColors[selectedPartner.relationshipLevel].text}`}>
                                {relationshipLevelLabels[selectedPartner.relationshipLevel]}
                              </span>
                              <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">{partnerFieldLabels[selectedPartner.field]}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedPartner(null)}
                            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>

                      {/* Detail tabs */}
                      <div className="flex border-b border-border px-4">
                        {([
                          { key: 'info', label: 'Thông tin', icon: Eye },
                          { key: 'contracts', label: `Hợp đồng (${selectedPartner.contracts.length})`, icon: FileText },
                          { key: 'visits', label: `Lịch sử vào (${selectedPartner.visitHistory.length})`, icon: History },
                        ] as { key: DetailTab; label: string; icon: typeof Eye }[]).map((t) => (
                          <button
                            key={t.key}
                            onClick={() => setDetailTab(t.key)}
                            className={`flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium border-b-2 transition-colors ${
                              detailTab === t.key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <t.icon className="w-3.5 h-3.5" />
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {/* Detail content */}
                      <div className="flex-1 overflow-y-auto p-4">
                        <AnimatePresence mode="wait">
                          {detailTab === 'info' && (
                            <motion.div
                              key="info"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="space-y-4"
                            >
                              {/* Basic info grid */}
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { icon: MapPin, label: 'Địa chỉ', value: selectedPartner.address },
                                  { icon: Globe, label: 'Quốc gia', value: `${countryFlags[selectedPartner.country] || '🌐'} ${selectedPartner.country}` },
                                  { icon: Calendar, label: 'Năm thành lập', value: selectedPartner.foundingYear.toString() },
                                  { icon: Mail, label: 'Email', value: selectedPartner.email },
                                  { icon: Phone, label: 'Điện thoại', value: selectedPartner.phone },
                                  { icon: Users, label: 'Người liên hệ', value: `${selectedPartner.contactPerson} — ${selectedPartner.contactPosition}` },
                                  { icon: Calendar, label: 'Ngày tiếp xúc đầu', value: new Date(selectedPartner.firstContactDate).toLocaleDateString('vi-VN') },
                                  { icon: Clock, label: 'Lần vào gần nhất', value: selectedPartner.lastVisitDate ? new Date(selectedPartner.lastVisitDate).toLocaleDateString('vi-VN') : '—' },
                                ].map((item) => (
                                  <div key={item.label} className="bg-muted/30 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</p>
                                    </div>
                                    <p className="text-[13px] text-foreground font-medium">{item.value}</p>
                                  </div>
                                ))}
                              </div>

                              {/* KPIs */}
                              <div className="grid grid-cols-3 gap-3">
                                <div className="bg-primary/8 rounded-xl p-3 text-center">
                                  <p className="text-[22px] font-bold text-primary">{selectedPartner.totalVisits}</p>
                                  <p className="text-[11px] text-muted-foreground">Tổng lượt vào</p>
                                </div>
                                <div className="bg-amber-500/8 rounded-xl p-3 text-center">
                                  <p className="text-[18px] font-bold text-amber-600 dark:text-amber-400">{formatCurrency(selectedPartner.totalContractValue)}</p>
                                  <p className="text-[11px] text-muted-foreground">Tổng giá trị HĐ</p>
                                </div>
                                <div className="bg-emerald-500/8 rounded-xl p-3 text-center">
                                  <p className="text-[18px] font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedPartner.totalProfit)}</p>
                                  <p className="text-[11px] text-muted-foreground">Lợi nhuận</p>
                                </div>
                              </div>

                              {/* Relations */}
                              {getRelatedPartners(selectedPartner).length > 0 && (
                                <div>
                                  <p className="text-[12px] font-semibold text-foreground mb-2 flex items-center gap-1.5">
                                    <Network className="w-3.5 h-3.5" /> Quan hệ với đối tác khác
                                  </p>
                                  <div className="space-y-2">
                                    {getRelatedPartners(selectedPartner).map(({ partner: rel, relation }) => (
                                      <div key={rel.id} className="flex items-center gap-3 p-2.5 bg-muted/30 rounded-xl">
                                        <span className="text-[18px]">{countryFlags[rel.country] || '🌐'}</span>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[12px] font-medium text-foreground truncate">{rel.shortName}</p>
                                          <p className="text-[11px] text-muted-foreground truncate">{relation.description}</p>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${relTypeColor[relation.type]}`}>
                                          {relTypeLabel[relation.type]}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Notes */}
                              {selectedPartner.notes && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3">
                                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> Ghi chú
                                  </p>
                                  <p className="text-[12px] text-amber-800 dark:text-amber-300">{selectedPartner.notes}</p>
                                </div>
                              )}
                            </motion.div>
                          )}

                          {detailTab === 'contracts' && (
                            <motion.div
                              key="contracts"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="space-y-3"
                            >
                              {selectedPartner.contracts.map((contract) => {
                                const sc = contractStatusColors[contract.status];
                                return (
                                  <div key={contract.id} className="border border-border rounded-xl p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className="text-[13px] font-semibold text-foreground">{contract.name}</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">{contract.contractNumber}</p>
                                      </div>
                                      <span className={`shrink-0 text-[11px] px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.text}`}>
                                        {contractStatusLabels[contract.status]}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[12px]">
                                      <div>
                                        <span className="text-muted-foreground">Ký ngày: </span>
                                        <span className="font-medium">{new Date(contract.signDate).toLocaleDateString('vi-VN')}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Hết hạn: </span>
                                        <span className="font-medium">{new Date(contract.endDate).toLocaleDateString('vi-VN')}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Giá trị: </span>
                                        <span className="font-semibold text-primary">{formatCurrency(contract.value)}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Lợi nhuận: </span>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(contract.profit)}</span>
                                      </div>
                                    </div>
                                    {contract.products.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5">
                                        {contract.products.map((prod) => (
                                          <span key={prod} className="text-[10px] bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                                            {prod}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">{contract.description}</p>
                                  </div>
                                );
                              })}
                              {selectedPartner.contracts.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground">
                                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                  <p className="text-[13px]">Chưa có hợp đồng nào</p>
                                </div>
                              )}
                            </motion.div>
                          )}

                          {detailTab === 'visits' && (
                            <motion.div
                              key="visits"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="space-y-2"
                            >
                              {selectedPartner.visitHistory.map((v, i) => (
                                <div key={v.id} className="flex gap-3">
                                  <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                      <span className="text-[11px] font-bold text-primary">{i + 1}</span>
                                    </div>
                                    {i < selectedPartner.visitHistory.length - 1 && (
                                      <div className="w-px flex-1 bg-border mt-1" />
                                    )}
                                  </div>
                                  <div className="flex-1 pb-4">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[11px] font-semibold text-primary">{new Date(v.date).toLocaleDateString('vi-VN')}</span>
                                      <span className="text-[11px] text-muted-foreground">• {v.attendees} người</span>
                                    </div>
                                    <p className="text-[13px] text-foreground font-medium">{v.purpose}</p>
                                    <div className="mt-1.5 flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                      <p className="text-[12px] text-muted-foreground">{v.result}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {selectedPartner.visitHistory.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground">
                                  <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                  <p className="text-[13px]">Chưa có lịch sử vào làm việc</p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'relations' && (
              <motion.div
                key="relations"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Query input */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <h3 className="text-[13px] font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Network className="w-4 h-4 text-primary" />
                    Truy vấn mối quan hệ & lịch sử hợp tác đối tác
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Nhập tên đối tác, lĩnh vực, hoặc tên hợp đồng để tra cứu..."
                      value={relationQuery}
                      onChange={(e) => setRelationQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Tìm thấy {relationResults.length} kết quả
                    {relationQuery && ` cho "${relationQuery}"`}
                  </p>
                </div>

                {/* Relation results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relationResults.map((partner) => {
                    const related = getRelatedPartners(partner);
                    const activeContracts = partner.contracts.filter((c) => c.status === 'active');
                    return (
                      <div key={partner.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-[18px] shrink-0">
                            {countryFlags[partner.country] || '🌐'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[13px] font-bold text-foreground">{partner.shortName}</p>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${relationshipLevelColors[partner.relationshipLevel].bg} ${relationshipLevelColors[partner.relationshipLevel].text}`}>
                                {relationshipLevelLabels[partner.relationshipLevel]}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">{partner.name}</p>
                          </div>
                        </div>

                        {/* Quick stats */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center bg-muted/30 rounded-lg p-2">
                            <p className="text-[14px] font-bold text-foreground">{partner.totalVisits}</p>
                            <p className="text-[10px] text-muted-foreground">Lượt vào</p>
                          </div>
                          <div className="text-center bg-muted/30 rounded-lg p-2">
                            <p className="text-[14px] font-bold text-primary">{partner.contracts.length}</p>
                            <p className="text-[10px] text-muted-foreground">Hợp đồng</p>
                          </div>
                          <div className="text-center bg-muted/30 rounded-lg p-2">
                            <p className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400">{activeContracts.length}</p>
                            <p className="text-[10px] text-muted-foreground">Đang HH</p>
                          </div>
                        </div>

                        {/* Has cooperated */}
                        <div className={`flex items-center gap-2 p-2.5 rounded-xl text-[12px] ${partner.totalVisits > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-muted/30'}`}>
                          {partner.totalVisits > 0 ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="text-emerald-700 dark:text-emerald-400">
                                Đã hợp tác — lần đầu {new Date(partner.firstContactDate).toLocaleDateString('vi-VN')}
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="text-muted-foreground">Chưa có hoạt động ghi nhận</span>
                            </>
                          )}
                        </div>

                        {/* Related partners */}
                        {related.length > 0 && (
                          <div>
                            <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">Quan hệ với:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {related.map(({ partner: rel, relation }) => (
                                <div
                                  key={rel.id}
                                  className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium ${relTypeColor[relation.type]}`}
                                >
                                  <span>{countryFlags[rel.country] || '🌐'}</span>
                                  <span>{rel.shortName}</span>
                                  <span className="opacity-60">({relTypeLabel[relation.type]})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => { setActiveTab('profile'); setSelectedPartner(partner); setDetailTab('info'); }}
                          className="w-full text-[12px] text-primary hover:underline flex items-center justify-center gap-1 pt-1"
                        >
                          Xem hồ sơ đầy đủ <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
