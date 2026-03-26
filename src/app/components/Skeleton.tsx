export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-muted/60 ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.8s ease-in-out infinite',
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-3" style={{ boxShadow: 'var(--shadow-xs)' }}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-2 w-32" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-border/30">
      <Skeleton className="w-4 h-4 rounded" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 flex-1 max-w-xs" />
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-xs)' }}>
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Skeleton className="h-10 w-72 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
        <div className="ml-auto">
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
      <div className="py-1">
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
      <div className="p-4 border-t border-border flex items-center justify-between">
        <Skeleton className="h-3 w-32" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="w-8 h-8 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DocumentListSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4" role="status" aria-label="Đang tải danh sách văn bản">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 flex items-center gap-3 border border-border/50 bg-card">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
        ))}
      </div>
      <TableSkeleton rows={6} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6" role="status" aria-label="Đang tải tổng quan">
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4" role="status" aria-label="Đang tải bảng công việc">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-72 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
        <div className="ml-auto">
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, col) => (
          <div key={col} className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>
            {Array.from({ length: 3 - col % 2 }).map((_, row) => (
              <div key={row} className="p-3 rounded-lg border border-border/50 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex items-center gap-2 pt-1">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}