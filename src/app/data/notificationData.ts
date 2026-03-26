// ==========================================
// ENHANCED NOTIFICATION DATA MODEL
// ==========================================

export type NotificationType = 'doc_incoming' | 'doc_outgoing' | 'doc_internal' | 'workflow' | 'task' | 'calendar' | 'system' | 'reminder';

export interface EnhancedNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  starred: boolean;
  link?: string;       // route to navigate
  refId?: string;      // related doc / task id
  refType?: 'document' | 'task' | 'event';
  actorName?: string;
  actorAvatar?: string;
  priority?: 'urgent' | 'normal' | 'low';
}

export const notificationTypeConfig: Record<NotificationType, { label: string; icon: string; color: string; bg: string }> = {
  doc_incoming: { label: 'Văn bản đến', icon: 'FileInput', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40' },
  doc_outgoing: { label: 'Văn bản đi', icon: 'FileOutput', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
  doc_internal: { label: 'Nội bộ', icon: 'FileText', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/40' },
  workflow: { label: 'Luồng xử lý', icon: 'GitBranch', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
  task: { label: 'Công việc', icon: 'ClipboardList', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40' },
  calendar: { label: 'Lịch', icon: 'Calendar', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/40' },
  system: { label: 'Hệ thống', icon: 'Settings', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' },
  reminder: { label: 'Nhắc nhở', icon: 'Bell', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/40' },
};

export const initialNotifications: EnhancedNotification[] = [
  {
    id: 'NOTIF-001',
    title: 'Văn bản mới cần xử lý',
    message: 'Văn bản #1245/UBND-VP "V/v triển khai kế hoạch chuyển đổi số năm 2026" đã được chuyển đến bạn. Hạn xử lý: 25/03/2026.',
    type: 'doc_incoming',
    timestamp: '2026-03-17T08:15:00',
    read: false, starred: false,
    link: '/incoming', refId: 'INC-001', refType: 'document',
    actorName: 'Hoàng Thị Em', actorAvatar: 'HTE',
    priority: 'urgent',
  },
  {
    id: 'NOTIF-002',
    title: 'Văn bản đã được phê duyệt',
    message: 'Lãnh đạo Trần Văn Minh đã phê duyệt văn bản đi "V/v phối hợp triển khai hệ thống e-Office". Chờ Văn thư phát hành.',
    type: 'workflow',
    timestamp: '2026-03-17T07:30:00',
    read: false, starred: true,
    link: '/outgoing', refId: 'OUT-001', refType: 'document',
    actorName: 'Trần Văn Minh', actorAvatar: 'TVM',
    priority: 'normal',
  },
  {
    id: 'NOTIF-003',
    title: 'Công việc sắp đến hạn',
    message: 'Công việc "Soạn thảo báo cáo chuyển đổi số quý I" sẽ đến hạn vào 20/03/2026 (còn 3 ngày). Tiến độ hiện tại: 65%.',
    type: 'task',
    timestamp: '2026-03-17T07:00:00',
    read: false, starred: false,
    link: '/tasks', refId: 'TASK-001', refType: 'task',
    priority: 'urgent',
  },
  {
    id: 'NOTIF-004',
    title: 'Họp giao ban đầu tuần',
    message: 'Cuộc họp giao ban sẽ diễn ra lúc 08:00 sáng nay tại Phòng họp A1. Vui lòng chuẩn bị tài liệu báo cáo tuần.',
    type: 'calendar',
    timestamp: '2026-03-17T06:30:00',
    read: false, starred: false,
    link: '/calendar', refId: 'EVT-001', refType: 'event',
    actorName: 'Trần Văn Minh', actorAvatar: 'TVM',
    priority: 'normal',
  },
  {
    id: 'NOTIF-005',
    title: 'Văn bản quá hạn chưa xử lý',
    message: 'Văn bản #189/STNMT-QLDD "V/v cấp giấy chứng nhận quyền sử dụng đất đợt 3" đã quá hạn xử lý (15/03/2026). Yêu cầu báo cáo lý do.',
    type: 'reminder',
    timestamp: '2026-03-16T17:00:00',
    read: false, starred: true,
    link: '/incoming', refId: 'INC-005', refType: 'document',
    priority: 'urgent',
  },
  {
    id: 'NOTIF-006',
    title: 'Trình duyệt Kế hoạch đào tạo Q2',
    message: 'Vũ Thanh Phong đã trình duyệt "Kế hoạch đào tạo cán bộ, công chức quý II/2026". Chờ Lãnh đạo phê duyệt.',
    type: 'workflow',
    timestamp: '2026-03-16T16:00:00',
    read: true, starred: false,
    link: '/outgoing', refId: 'OUT-003', refType: 'document',
    actorName: 'Vũ Thanh Phong', actorAvatar: 'VTP',
    priority: 'normal',
  },
  {
    id: 'NOTIF-007',
    title: 'Hoàn thành công việc',
    message: 'Hoàng Thị Em đã hoàn thành "Chuẩn bị tài liệu họp giao ban tháng 3" đúng tiến độ.',
    type: 'task',
    timestamp: '2026-03-16T15:30:00',
    read: true, starred: false,
    link: '/tasks', refId: 'TASK-005', refType: 'task',
    actorName: 'Hoàng Thị Em', actorAvatar: 'HTE',
    priority: 'low',
  },
  {
    id: 'NOTIF-008',
    title: 'Phát hành văn bản thành công',
    message: 'Văn bản "Báo cáo kết quả công tác tháng 2/2026" đã được phát hành với số 346/BC-UBND và gửi đến UBND Tỉnh.',
    type: 'doc_outgoing',
    timestamp: '2026-03-14T16:30:00',
    read: true, starred: false,
    link: '/outgoing', refId: 'OUT-002', refType: 'document',
    actorName: 'Hoàng Thị Em', actorAvatar: 'HTE',
    priority: 'normal',
  },
  {
    id: 'NOTIF-009',
    title: 'Phân phối văn bản nội bộ',
    message: 'Văn bản nội bộ "Nội quy làm việc và chấm công năm 2026" đã được phân phối đến toàn cơ quan.',
    type: 'doc_internal',
    timestamp: '2026-03-15T08:00:00',
    read: true, starred: false,
    link: '/internal', refId: 'INT-001', refType: 'document',
    actorName: 'Hoàng Thị Em', actorAvatar: 'HTE',
    priority: 'normal',
  },
  {
    id: 'NOTIF-010',
    title: 'Hệ thống bảo trì định kỳ',
    message: 'Hệ thống e-Office sẽ bảo trì vào 22:00 - 23:00 tối nay (17/03/2026). Vui lòng lưu công việc trước thời gian này.',
    type: 'system',
    timestamp: '2026-03-17T09:00:00',
    read: false, starred: false,
    priority: 'normal',
  },
  {
    id: 'NOTIF-011',
    title: 'Đào tạo sử dụng e-Office',
    message: 'Nhắc nhở: Buổi đào tạo hướng dẫn sử dụng hệ thống e-Office sẽ diễn ra vào 09:00 ngày 20/03 tại Phòng đào tạo B2.',
    type: 'calendar',
    timestamp: '2026-03-17T06:00:00',
    read: false, starred: false,
    link: '/calendar', refId: 'EVT-004', refType: 'event',
    priority: 'normal',
  },
  {
    id: 'NOTIF-012',
    title: 'Yêu cầu xem xét tờ trình',
    message: 'Lê Minh Châu trình duyệt "Tờ trình đề xuất mua sắm trang thiết bị CNTT". Vui lòng xem xét và cho ý kiến.',
    type: 'workflow',
    timestamp: '2026-03-16T10:00:00',
    read: true, starred: false,
    link: '/outgoing', refId: 'OUT-004', refType: 'document',
    actorName: 'Lê Minh Châu', actorAvatar: 'LMC',
    priority: 'normal',
  },
  {
    id: 'NOTIF-013',
    title: 'Cập nhật tiến độ công việc',
    message: 'Nguyễn Văn An đã cập nhật tiến độ công việc "Triển khai phần mềm quản lý văn bản mới" lên 25%.',
    type: 'task',
    timestamp: '2026-03-17T08:30:00',
    read: false, starred: false,
    link: '/tasks', refId: 'TASK-007', refType: 'task',
    actorName: 'Nguyễn Văn An', actorAvatar: 'NVA',
    priority: 'low',
  },
  {
    id: 'NOTIF-014',
    title: 'Tiếp nhận văn bản mới',
    message: 'Đã tiếp nhận văn bản đến #1100/SLDTBXH-BTXH "Đề xuất chính sách hỗ trợ người lao động năm 2026" từ Sở LĐ-TB&XH.',
    type: 'doc_incoming',
    timestamp: '2026-03-17T08:00:00',
    read: false, starred: false,
    link: '/incoming', refId: 'INC-007', refType: 'document',
    actorName: 'Hoàng Thị Em', actorAvatar: 'HTE',
    priority: 'normal',
  },
];