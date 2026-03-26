import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Lock, User, AlertCircle, Loader2, ArrowRight, Star, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Đăng nhập | Hệ thống QLĐT Vào Làm Việc — BQP';
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Vui lòng nhập tên đăng nhập'); return; }
    if (!password) { setError('Vui lòng nhập mật khẩu'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = login(username.trim(), password);
    setLoading(false);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error || 'Đăng nhập thất bại. Kiểm tra lại thông tin.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #060f0a 0%, #0b1829 40%, #0d2010 70%, #091420 100%)',
    }}>
      {/* Decorative background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(201,165,71,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,165,71,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Radial glow center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{
          background: 'radial-gradient(circle, rgba(26,92,50,0.15) 0%, transparent 70%)',
        }} />
        {/* Top right glow */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full" style={{
          background: 'radial-gradient(circle, rgba(11,24,41,0.6) 0%, transparent 70%)',
        }} />
        {/* Bottom left glow */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full" style={{
          background: 'radial-gradient(circle, rgba(26,92,50,0.2) 0%, transparent 70%)',
        }} />
        {/* Decorative stars */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${15 + i * 14}%`,
              left: i % 2 === 0 ? `${5 + i * 3}%` : `${75 + i * 3}%`,
            }}
            animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          >
            <Star className="w-2 h-2 text-[#c9a547]/30 fill-[#c9a547]/20" />
          </motion.div>
        ))}
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="rounded-2xl overflow-hidden" style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(201,165,71,0.15)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          {/* Header stripe */}
          <div className="h-1 w-full" style={{
            background: 'linear-gradient(90deg, #1a5c32, #c9a547, #1a5c32)',
          }} />

          <div className="px-8 py-8">
            {/* Emblem */}
            <div className="flex flex-col items-center mb-7">
              <div className="relative mb-4">
                <div className="w-18 h-18 relative">
                  {/* Outer ring */}
                  <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #1a5c32, #0d3d1f)',
                    border: '2px solid rgba(201,165,71,0.4)',
                    boxShadow: '0 0 32px rgba(26,92,50,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
                  }}>
                    {/* Inner content */}
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <Star className="w-7 h-7 text-[#c9a547] fill-[#c9a547]" />
                    </div>
                  </div>
                  {/* Corner stars */}
                  {[0, 90, 180, 270].map((deg) => (
                    <div
                      key={deg}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-36px)` }}
                    >
                      <Star className="w-1.5 h-1.5 text-[#c9a547]/60 fill-[#c9a547]/50" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="text-center">
                <p className="text-[10px] text-[#c9a547]/70 tracking-[0.2em] uppercase mb-1">
                  Cộng hòa Xã hội Chủ nghĩa Việt Nam
                </p>
                <div className="w-24 h-px mx-auto mb-2" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,165,71,0.5), transparent)' }} />
                <h1 className="text-[20px] text-white mb-1 tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 1.2 }}>
                  TỔNG CỤC CÔNG NGHIỆP QUỐC PHÒNG
                </h1>
                <div className="w-24 h-px mx-auto mb-2" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,165,71,0.5), transparent)' }} />
                <p className="text-[11px] text-white/60 tracking-[0.08em] uppercase leading-tight">
                  Hệ thống Quản lý Đối tác<br />Vào Làm Việc
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="alert"
                    className="flex items-center gap-2 p-3 rounded-xl text-[13px] text-red-300"
                    style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.25)' }}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-[12px] text-white/50 mb-1.5 tracking-wide uppercase">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    onFocus={(e) => { e.target.style.border = '1px solid rgba(76,175,120,0.5)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                    onBlur={(e) => { e.target.style.border = '1px solid rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-[12px] text-white/50 mb-1.5 tracking-wide uppercase">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-10 pr-12 py-3 rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    onFocus={(e) => { e.target.style.border = '1px solid rgba(76,175,120,0.5)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                    onBlur={(e) => { e.target.style.border = '1px solid rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded text-white/30 hover:text-white/60 transition-colors"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 mt-2"
                style={{
                  background: loading ? '#1a5c32' : 'linear-gradient(135deg, #1a5c32 0%, #2d7a4f 100%)',
                  boxShadow: '0 4px 16px rgba(26,92,50,0.4)',
                  border: '1px solid rgba(76,175,120,0.2)',
                }}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Đang xác thực...</>
                ) : (
                  <>Đăng nhập hệ thống <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            {/* Hint */}
            <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-[11px] text-white/25 hover:text-white/45 transition-colors mx-auto"
              >
                <Shield className="w-3 h-3" />
                {showHint ? 'Ẩn thông tin thử nghiệm' : 'Thông tin tài khoản thử nghiệm'}
              </button>
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="rounded-xl p-3 text-[11px] space-y-1.5" style={{ background: 'rgba(26,92,50,0.12)', border: '1px solid rgba(76,175,120,0.15)' }}>
                      {[
                        { user: 'admin', pass: 'Admin@123', role: 'Quản trị viên' },
                        { user: 'truongphong', pass: 'Pass@123', role: 'Trưởng phòng' },
                        { user: 'nhanvien', pass: 'Pass@123', role: 'Nhân viên' },
                      ].map((acc) => (
                        <button
                          key={acc.user}
                          onClick={() => { setUsername(acc.user); setPassword(acc.pass); }}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                        >
                          <span className="text-[#4caf78]">{acc.user}</span>
                          <span className="text-white/30">{acc.role}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer stripe */}
          <div className="px-8 py-3 text-center" style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-[10px] text-white/20 tracking-wide">
              Hệ thống bảo mật — Chỉ dành cho người được cấp phép &nbsp;•&nbsp; TCCNQP © 2026
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
