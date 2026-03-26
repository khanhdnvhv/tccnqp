import { useState, useMemo } from 'react';
import { useRovingTabindex } from '../hooks/useRovingTabindex';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getDepartmentName } from '../data/users';
import {
  User, Shield, Bell, Database, Pencil, X, Check, AlertCircle, Eye, EyeOff,
  Clock, Monitor, Sun, Moon, Palette, Globe, Keyboard, HelpCircle,
  ChevronRight, Command, Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'display' | 'system';

export function SettingsPage() {
  const { user, roles, updateProfile, changePassword } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const settingsTabKeys = useMemo(() => ['profile', 'security', 'notifications', 'display', 'system'] as const, []);
  const { getTabIndex: getSettingsTabIndex, handleTablistKeyDown: handleSettingsTablistKeyDown } = useRovingTabindex(
    settingsTabKeys as unknown as string[],
    activeTab,
    (key) => setActiveTab(key as SettingsTab),
  );

  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '' });

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [notifSettings, setNotifSettings] = useState({
    emailNotif: true,
    docNotif: true,
    taskNotif: true,
    calendarNotif: true,
    deadlineReminder: '1day',
    quietHours: false,
    sound: true,
    desktopNotif: false,
  });

  const [displaySettings, setDisplaySettings] = useState({
    compactMode: false,
    sidebarCollapsed: false,
    language: 'vi',
    dateFormat: 'dd/MM/yyyy',
    itemsPerPage: '20',
  });

  const handleSaveProfile = () => {
    if (!profileForm.fullName.trim() || !profileForm.email.trim()) return;
    updateProfile(profileForm);
    setEditProfile(false);
    toast.success('Cập nhật thông tin thành công!');
  };

  const handleChangePassword = () => {
    setPwError('');
    if (!pwForm.oldPassword) { setPwError('Vui lòng nhập mật khẩu cũ'); return; }
    if (!pwForm.newPassword) { setPwError('Vui lòng nhập mật khẩu mới'); return; }
    if (pwForm.newPassword.length < 8) { setPwError('Mật khẩu mới phải có ít nhất 8 ký tự'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('Mật khẩu xác nhận không khớp'); return; }

    const result = changePassword(pwForm.oldPassword, pwForm.newPassword);
    if (result.success) {
      toast.success('Đổi mật khẩu thành công!');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
    } else {
      setPwError(result.error || 'Có lỗi xảy ra');
    }
  };

  if (!user) return null;

  const tabs = [
    { key: 'profile' as SettingsTab, label: 'Cá nhân', icon: User },
    { key: 'security' as SettingsTab, label: 'Bảo mật', icon: Shield },
    { key: 'notifications' as SettingsTab, label: 'Thông báo', icon: Bell },
    { key: 'display' as SettingsTab, label: 'Hiển thị', icon: Palette },
    { key: 'system' as SettingsTab, label: 'Hệ thống', icon: Database },
  ];

  const ToggleSwitch = ({ value, onChange, label }: { value: boolean; onChange: () => void; label?: string }) => (
    <button onClick={onChange}
      role="switch"
      aria-checked={value}
      aria-label={label}
      className={`w-11 h-6 rounded-full relative transition-colors ${value ? 'bg-primary' : 'bg-switch-background'}`}>
      <div className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all"
        style={{ left: value ? '22px' : '2px' }} />
    </button>
  );

  return (
    <PageTransition>
      <Header title="Cài đặt" />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-card rounded-xl border border-border p-1 mb-6 overflow-x-auto" style={{ boxShadow: 'var(--shadow-xs)' }} role="tablist" aria-label="Cài đặt hệ thống" onKeyDown={handleSettingsTablistKeyDown}>
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                role="tab" aria-selected={activeTab === tab.key} aria-controls={`tabpanel-settings-${tab.key}`} id={`tab-settings-${tab.key}`}
                tabIndex={getSettingsTabIndex(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] whitespace-nowrap transition-all ${
                  activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                }`}
                style={activeTab === tab.key ? { boxShadow: 'var(--shadow-sm)' } : undefined}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5" role="tabpanel" id="tabpanel-settings-profile" aria-labelledby="tab-settings-profile">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-foreground text-[14px]" style={{ fontFamily: "var(--font-display)" }}>Thông tin cá nhân</h3>
                      <p className="text-[12px] text-muted-foreground">Quản lý hồ sơ cá nhân</p>
                    </div>
                  </div>
                  <button onClick={() => { setEditProfile(!editProfile); setProfileForm({ fullName: user.fullName, email: user.email, phone: user.phone }); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-primary hover:bg-primary/5 transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> {editProfile ? 'Hủy' : 'Chỉnh sửa'}
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-[24px] ring-4 ring-primary/10">
                        {user.avatar}
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Pencil className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-foreground text-[18px]">{user.fullName}</h3>
                      <p className="text-[13px] text-muted-foreground">{user.position}</p>
                      <div className="flex gap-1.5 mt-2">
                        {roles.map((r) => (
                          <span key={r.id} className="px-2.5 py-0.5 rounded-full text-[11px] text-white" style={{ backgroundColor: r.color }}>{r.name}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {editProfile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="settings-fullname" className="block text-[12px] text-muted-foreground mb-1.5">Họ và tên</label>
                          <input id="settings-fullname" type="text" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                        </div>
                        <div>
                          <label htmlFor="settings-email" className="block text-[12px] text-muted-foreground mb-1.5">Email</label>
                          <input id="settings-email" type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                        </div>
                        <div>
                          <label htmlFor="settings-phone" className="block text-[12px] text-muted-foreground mb-1.5">Số điện thoại</label>
                          <input id="settings-phone" type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditProfile(false)} className="px-4 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-accent">Hủy</button>
                        <button onClick={handleSaveProfile}
                          className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] hover:opacity-90 shadow-sm">Lưu thay đổi</button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      {[
                        ['Tên đăng nhập', user.username],
                        ['Email', user.email],
                        ['Số điện thoại', user.phone || 'Chưa cập nhật'],
                        ['Phòng ban', getDepartmentName(user.departmentId)],
                        ['Chức vụ', user.position],
                        ['Ngày tạo tài khoản', user.createdAt],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between py-2.5 border-b border-border/50">
                          <span className="text-[12px] text-muted-foreground">{label}</span>
                          <span className="text-[13px] text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5" role="tabpanel" id="tabpanel-settings-security" aria-labelledby="tab-settings-security">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                  <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-[14px]">Bảo mật tài khoản</h3>
                    <p className="text-[12px] text-muted-foreground">Quản lý mật khẩu và phiên đăng nhập</p>
                  </div>
                </div>

                <div className="p-6">
                  {!showChangePassword ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-3 border-b border-border/50">
                        <div>
                          <p className="text-[13px] text-foreground">Mật khẩu</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Lần đổi cuối: 10/03/2026</p>
                        </div>
                        <button onClick={() => setShowChangePassword(true)}
                          aria-expanded={false}
                          className="px-4 py-2 bg-primary/5 text-primary rounded-lg text-[13px] hover:bg-primary/10 transition-colors">
                          Đổi mật khẩu
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-border/50">
                        <div>
                          <p className="text-[13px] text-foreground">Xác thực 2 yếu tố (2FA)</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Tăng cường bảo mật tài khoản</p>
                        </div>
                        <span className="text-[12px] text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">Chưa bật</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-border/50">
                        <div>
                          <p className="text-[13px] text-foreground">Phiên đăng nhập hiện tại</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser'} · Đang hoạt động</p>
                        </div>
                        <span className="flex items-center gap-1 text-[12px] text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-md space-y-4">
                      {pwError && (
                        <div id="pw-error" role="alert" className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-[13px] text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4" /> {pwError}
                        </div>
                      )}
                      <div>
                        <label htmlFor="settings-old-pw" className="block text-[12px] text-muted-foreground mb-1.5">Mật khẩu hiện tại</label>
                        <div className="relative">
                          <input id="settings-old-pw" type={showOld ? 'text' : 'password'} value={pwForm.oldPassword}
                            onChange={(e) => { setPwForm({ ...pwForm, oldPassword: e.target.value }); setPwError(''); }}
                            aria-describedby={pwError ? 'pw-error' : undefined}
                            className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none pr-10" />
                          <button type="button" onClick={() => setShowOld(!showOld)} aria-label={showOld ? 'Ẩn mật khẩu hiện tại' : 'Hiện mật khẩu hiện tại'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="settings-new-pw" className="block text-[12px] text-muted-foreground mb-1.5">Mật khẩu mới</label>
                        <div className="relative">
                          <input id="settings-new-pw" type={showNew ? 'text' : 'password'} value={pwForm.newPassword}
                            onChange={(e) => { setPwForm({ ...pwForm, newPassword: e.target.value }); setPwError(''); }}
                            placeholder="Tối thiểu 8 ký tự, chữ hoa, thường, số"
                            aria-describedby={pwError ? 'pw-error' : undefined}
                            className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none pr-10" />
                          <button type="button" onClick={() => setShowNew(!showNew)} aria-label={showNew ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {/* Password strength indicator */}
                        {pwForm.newPassword && (
                          <div className="flex items-center gap-1.5 mt-2" role="group" aria-label={`Độ mạnh mật khẩu: ${pwForm.newPassword.length >= 12 ? 'Mạnh' : pwForm.newPassword.length >= 10 ? 'Khá' : pwForm.newPassword.length >= 8 ? 'Trung bình' : 'Yếu'}`}>
                            {[1,2,3,4].map((i) => {
                              const strength = pwForm.newPassword.length >= 12 ? 4 : pwForm.newPassword.length >= 10 ? 3 : pwForm.newPassword.length >= 8 ? 2 : 1;
                              return <div key={i} className={`flex-1 h-1 rounded-full ${i <= strength ? (strength >= 3 ? 'bg-emerald-500' : strength >= 2 ? 'bg-amber-500' : 'bg-red-500') : 'bg-muted'}`} />;
                            })}
                            <span className="text-[10px] text-muted-foreground ml-1">
                              {pwForm.newPassword.length >= 12 ? 'Mạnh' : pwForm.newPassword.length >= 10 ? 'Khá' : pwForm.newPassword.length >= 8 ? 'TB' : 'Yếu'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label htmlFor="settings-confirm-pw" className="block text-[12px] text-muted-foreground mb-1.5">Xác nhận mật khẩu mới</label>
                        <input id="settings-confirm-pw" type="password" value={pwForm.confirmPassword}
                          onChange={(e) => { setPwForm({ ...pwForm, confirmPassword: e.target.value }); setPwError(''); }}
                          aria-describedby={pwError ? 'pw-error' : undefined}
                          className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => { setShowChangePassword(false); setPwError(''); setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); }}
                          className="px-4 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-accent">Hủy</button>
                        <button onClick={handleChangePassword}
                          className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] hover:opacity-90 shadow-sm">Đổi mật khẩu</button>
                      </div>
                    </div>
                  )}

                  {/* Login History */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-[13px] text-foreground mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" /> Lịch sử đăng nhập gần đây
                    </h4>
                    <div className="space-y-2">
                      {user.loginHistory.slice(0, 5).map((record, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${record.success ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                            {record.success ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-red-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-[12px] text-foreground">{record.success ? 'Thành công' : 'Thất bại'}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Monitor className="w-3 h-3" /> {record.device} | IP: {record.ip}
                            </p>
                          </div>
                          <span className="text-[11px] text-muted-foreground">{new Date(record.time).toLocaleString('vi-VN')}</span>
                        </div>
                      ))}
                      {user.loginHistory.length === 0 && (
                        <p className="text-[13px] text-muted-foreground text-center py-4">Chưa có lịch sử</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5" role="tabpanel" id="tabpanel-settings-notifications" aria-labelledby="tab-settings-notifications">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-[14px]">Cài đặt thông báo</h3>
                    <p className="text-[12px] text-muted-foreground">Tùy chỉnh cách nhận thông báo</p>
                  </div>
                </div>
                <div className="divide-y divide-border/50">
                  {[
                    { key: 'emailNotif', label: 'Thông báo qua email', desc: 'Nhận thông báo quan trọng qua email', icon: '📧' },
                    { key: 'docNotif', label: 'Văn bản mới', desc: 'Thông báo khi có văn bản mới được chuyển đến', icon: '📄' },
                    { key: 'taskNotif', label: 'Công việc', desc: 'Thông báo khi được giao công việc mới', icon: '📋' },
                    { key: 'calendarNotif', label: 'Lịch & sự kiện', desc: 'Nhắc nhở cuộc họp và sự kiện', icon: '📅' },
                    { key: 'sound', label: 'Âm thanh thông báo', desc: 'Phát âm thanh khi có thông báo mới', icon: '🔔' },
                    { key: 'desktopNotif', label: 'Thông báo desktop', desc: 'Hiển thị thông báo trên desktop (cần cấp quyền)', icon: '🖥️' },
                    { key: 'quietHours', label: 'Chế độ im lặng ngoài giờ', desc: 'Tắt thông báo từ 18:00 - 07:00', icon: '🌙' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between px-6 py-4 hover:bg-accent/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-[16px]">{item.icon}</span>
                        <div>
                          <p className="text-[13px] text-foreground">{item.label}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        value={!!notifSettings[item.key as keyof typeof notifSettings]}
                        onChange={() => {
                          setNotifSettings((s) => ({ ...s, [item.key]: !s[item.key as keyof typeof s] }));
                          toast.success('Đã cập nhật cài đặt thông báo');
                        }}
                        label={item.label}
                      />
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[16px]">⏰</span>
                      <div>
                        <p className="text-[13px] text-foreground">Nhắc hạn xử lý</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Nhắc nhở trước khi đến hạn xử lý</p>
                      </div>
                    </div>
                    <select value={notifSettings.deadlineReminder}
                      aria-label="Nhắc hạn xử lý"
                      onChange={(e) => setNotifSettings((s) => ({ ...s, deadlineReminder: e.target.value }))}
                      className="px-3 py-1.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                      <option value="1day">Trước 1 ngày</option>
                      <option value="2days">Trước 2 ngày</option>
                      <option value="3days">Trước 3 ngày</option>
                      <option value="1week">Trước 1 tuần</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* DISPLAY TAB */}
          {activeTab === 'display' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5" role="tabpanel" id="tabpanel-settings-display" aria-labelledby="tab-settings-display">
              {/* Theme */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-[14px]">Giao diện</h3>
                    <p className="text-[12px] text-muted-foreground">Tùy chỉnh giao diện hiển thị</p>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  {/* Theme selector */}
                  <div>
                    <p className="text-[13px] text-foreground mb-3">Chế độ giao diện</p>
                    <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Chế độ giao diện">
                      {[
                        { value: 'light', label: 'Sáng', icon: Sun, desc: 'Giao diện sáng mặc định' },
                        { value: 'dark', label: 'Tối', icon: Moon, desc: 'Giảm mỏi mắt ban đêm' },
                        { value: 'system', label: 'Hệ thống', icon: Monitor, desc: 'Theo cài đặt thiết bị' },
                      ].map((t) => (
                        <button key={t.value} onClick={() => { setTheme(t.value as 'light' | 'dark' | 'system'); toast.info(`Giao diện: ${t.label}`); }}
                          role="radio" aria-checked={theme === t.value}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            theme === t.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-muted-foreground/30'
                          }`}>
                          <t.icon className={`w-6 h-6 mx-auto mb-2 ${theme === t.value ? 'text-primary' : 'text-muted-foreground'}`} />
                          <p className="text-[13px] text-foreground">{t.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Other display settings */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                      <div>
                        <p className="text-[13px] text-foreground">Chế độ gọn</p>
                        <p className="text-[11px] text-muted-foreground">Thu gọn khoảng cách và padding</p>
                      </div>
                      <ToggleSwitch value={displaySettings.compactMode}
                        label="Chế độ gọn"
                        onChange={() => setDisplaySettings((s) => ({ ...s, compactMode: !s.compactMode }))} />
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                      <div>
                        <p className="text-[13px] text-foreground">Thu gọn sidebar mặc định</p>
                        <p className="text-[11px] text-muted-foreground">Tự động thu gọn thanh bên khi tải trang</p>
                      </div>
                      <ToggleSwitch value={displaySettings.sidebarCollapsed}
                        label="Thu gọn sidebar mặc định"
                        onChange={() => setDisplaySettings((s) => ({ ...s, sidebarCollapsed: !s.sidebarCollapsed }))} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Language & Format */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                  <div className="w-9 h-9 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-[14px]">Ngôn ngữ & Định dạng</h3>
                    <p className="text-[12px] text-muted-foreground">Cài đặt ngôn ngữ và format hiển thị</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="settings-language" className="block text-[12px] text-muted-foreground mb-1.5">Ngôn ngữ</label>
                      <select id="settings-language" value={displaySettings.language}
                        onChange={(e) => setDisplaySettings((s) => ({ ...s, language: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="settings-dateformat" className="block text-[12px] text-muted-foreground mb-1.5">Định dạng ngày</label>
                      <select id="settings-dateformat" value={displaySettings.dateFormat}
                        onChange={(e) => setDisplaySettings((s) => ({ ...s, dateFormat: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                        <option value="dd/MM/yyyy">dd/MM/yyyy (17/03/2026)</option>
                        <option value="MM/dd/yyyy">MM/dd/yyyy (03/17/2026)</option>
                        <option value="yyyy-MM-dd">yyyy-MM-dd (2026-03-17)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="settings-pagesize" className="block text-[12px] text-muted-foreground mb-1.5">Số mục mỗi trang</label>
                      <select id="settings-pagesize" value={displaySettings.itemsPerPage}
                        onChange={(e) => setDisplaySettings((s) => ({ ...s, itemsPerPage: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SYSTEM TAB */}
          {activeTab === 'system' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5" role="tabpanel" id="tabpanel-settings-system" aria-labelledby="tab-settings-system">
              {/* System Info */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Database className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-[14px]">Thông tin hệ thống</h3>
                    <p className="text-[12px] text-muted-foreground">Phiên bản và trạng thái hoạt động</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Phiên bản', value: 'e-Office v2.5.0', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
                      { label: 'Trạng thái', value: 'Hoạt động', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
                      { label: 'Cập nhật cuối', value: '17/03/2026', bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400' },
                      { label: 'Uptime', value: '99.8%', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
                    ].map((item) => (
                      <div key={item.label} className={`p-4 rounded-xl ${item.bg}`}>
                        <p className="text-[11px] text-muted-foreground">{item.label}</p>
                        <p className={`text-[15px] mt-1 ${item.text}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Storage info */}
                  <div className="space-y-3 border-t border-border pt-5">
                    <h4 className="text-[13px] text-foreground mb-2">Dung lượng sử dụng</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Văn bản & Tệp đính kèm', used: 2.4, total: 10, color: 'bg-blue-500' },
                        { label: 'Cơ sở dữ liệu', used: 0.8, total: 5, color: 'bg-violet-500' },
                        { label: 'Bản sao lưu', used: 1.2, total: 5, color: 'bg-amber-500' },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between text-[12px] mb-1">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="text-foreground">{item.used} GB / {item.total} GB</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2"
                            role="progressbar" aria-label={item.label} aria-valuenow={item.used} aria-valuemin={0} aria-valuemax={item.total}>
                            <div className={`h-2 rounded-full ${item.color} transition-all`}
                              style={{ width: `${(item.used / item.total) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Keyboard shortcuts */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                  <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                    <Keyboard className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-[14px]">Phím tắt</h3>
                    <p className="text-[12px] text-muted-foreground">Danh sách phím tắt hệ thống</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { keys: ['Ctrl', 'K'], desc: 'Mở Command Palette' },
                      { keys: ['Ctrl', '/'], desc: 'Tìm kiếm nhanh' },
                      { keys: ['Ctrl', 'N'], desc: 'Tạo văn bản mới' },
                      { keys: ['Ctrl', 'Shift', 'D'], desc: 'Tổng quan' },
                      { keys: ['Esc'], desc: 'Đóng dialog/modal' },
                      { keys: ['↑', '↓', '↵'], desc: 'Điều hướng danh sách' },
                    ].map((shortcut) => (
                      <div key={shortcut.desc} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/20 transition-colors">
                        <span className="text-[12px] text-muted-foreground">{shortcut.desc}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key) => (
                            <kbd key={key} className="px-2 py-0.5 bg-muted text-[11px] text-foreground rounded border border-border/80 min-w-[24px] text-center">
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-foreground text-[15px]">e-Office</h4>
                <p className="text-[12px] text-muted-foreground mt-1">Hệ thống Quản lý Văn bản & Điều hành</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Phiên bản 2.5.0 · Build 2026.03.17</p>
                <p className="text-[11px] text-muted-foreground mt-3">&copy; 2026 - Phát triển bởi Phòng CNTT</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}