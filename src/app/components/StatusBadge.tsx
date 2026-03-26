const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  // Incoming
  pending_receive: { label: 'Chờ tiếp nhận', bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  received: { label: 'Đã tiếp nhận', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  assigned: { label: 'Đã phân công', bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500' },
  new: { label: 'Mới', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  processing: { label: 'Đang xử lý', bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  completed: { label: 'Hoàn thành', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  overdue: { label: 'Quá hạn', bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  returned: { label: 'Trả lại', bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  // Outgoing
  draft: { label: 'Nháp', bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  dept_review: { label: 'TP xem xét', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  leader_review: { label: 'LĐ xem xét', bg: 'bg-violet-50 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-400', dot: 'bg-violet-500' },
  approved: { label: 'Đã duyệt', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  published: { label: 'Đã phát hành', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-600 dark:bg-emerald-400' },
  rejected: { label: 'Từ chối', bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  sent: { label: 'Đã gửi', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  // Internal
  review: { label: 'Chờ duyệt', bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  distributed: { label: 'Đã phân phối', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-600 dark:bg-emerald-400' },
  // Tasks
  todo: { label: 'Chờ xử lý', bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  in_progress: { label: 'Đang thực hiện', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  done: { label: 'Hoàn thành', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
};

const priorityConfig: Record<string, { label: string; bg: string; text: string }> = {
  urgent_top: { label: 'Hỏa tốc', bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-400' },
  urgent: { label: 'Khẩn', bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-400' },
  high: { label: 'Cao', bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
  medium: { label: 'Trung bình', bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  low: { label: 'Thấp', bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.new;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] transition-colors ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority] || priorityConfig.medium;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] transition-colors ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}