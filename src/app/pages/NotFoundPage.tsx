import { Link } from 'react-router';
import { Home, ArrowLeft, Search, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center max-w-lg mx-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6"
        >
          <Shield className="w-8 h-8 text-primary" />
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h1 className="text-[120px] text-primary/10 leading-none select-none" style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>404</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-[22px] text-foreground -mt-6 mb-3" style={{ fontFamily: "var(--font-display)" }}>Không tìm thấy trang</h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed mb-8">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
            <br />Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex items-center justify-center gap-3 flex-wrap"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-[13px] hover:opacity-90 transition-all active:scale-[0.97]"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            <Home className="w-4 h-4" /> Trang chủ
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground rounded-xl text-[13px] hover:bg-accent transition-colors"
          >
            <Search className="w-4 h-4" /> Tìm kiếm
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-muted-foreground rounded-xl text-[13px] hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
