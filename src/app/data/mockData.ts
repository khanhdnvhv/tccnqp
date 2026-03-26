export interface Document {
  id: string;
  number: string;
  title: string;
  sender: string;
  receiver: string;
  date: string;
  deadline?: string;
  status: 'new' | 'processing' | 'completed' | 'overdue' | 'draft' | 'sent';
  priority: 'high' | 'medium' | 'low';
  type: 'incoming' | 'outgoing' | 'internal';
  category: string;
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  assigneeAvatar: string;
  dueDate: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  documentRef?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'meeting' | 'deadline' | 'event';
  color: string;
}

export interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type: 'document' | 'task' | 'system';
}

export const incomingDocuments: Document[] = [
  { id: 'VBD-001', number: '1245/UBND-VP', title: 'V/v triển khai kế hoạch chuyển đổi số năm 2026', sender: 'UBND Tỉnh', receiver: 'Phòng CNTT', date: '2026-03-15', deadline: '2026-03-25', status: 'new', priority: 'high', type: 'incoming', category: 'Công văn' },
  { id: 'VBD-002', number: '856/SYT-NVY', title: 'Báo cáo tình hình dịch bệnh quý I/2026', sender: 'Sở Y tế', receiver: 'Phòng Hành chính', date: '2026-03-14', deadline: '2026-03-20', status: 'processing', priority: 'high', type: 'incoming', category: 'Báo cáo' },
  { id: 'VBD-003', number: '2341/BTC-CST', title: 'Hướng dẫn quyết toán ngân sách năm 2025', sender: 'Bộ Tài chính', receiver: 'Phòng Kế toán', date: '2026-03-13', deadline: '2026-04-01', status: 'processing', priority: 'medium', type: 'incoming', category: 'Hướng dẫn' },
  { id: 'VBD-004', number: '567/SGDDT-GDTrH', title: 'Kế hoạch thi tốt nghiệp THPT năm 2026', sender: 'Sở GD&ĐT', receiver: 'Phòng Giáo dục', date: '2026-03-12', deadline: '2026-03-30', status: 'completed', priority: 'medium', type: 'incoming', category: 'Kế hoạch' },
  { id: 'VBD-005', number: '189/STNMT-QLDD', title: 'V/v cấp giấy chứng nhận quyền sử dụng đất', sender: 'Sở TN&MT', receiver: 'Phòng Quản lý đất đai', date: '2026-03-11', status: 'overdue', priority: 'high', type: 'incoming', category: 'Công văn' },
  { id: 'VBD-006', number: '3456/BNV-TCBC', title: 'V/v sắp xếp tổ chức bộ máy', sender: 'Bộ Nội vụ', receiver: 'Phòng Tổ chức', date: '2026-03-10', deadline: '2026-03-28', status: 'processing', priority: 'medium', type: 'incoming', category: 'Công văn' },
  { id: 'VBD-007', number: '782/SKHDT-TH', title: 'Kế hoạch phát triển kinh tế - xã hội 2026', sender: 'Sở KH&ĐT', receiver: 'Văn phòng', date: '2026-03-09', deadline: '2026-03-22', status: 'completed', priority: 'low', type: 'incoming', category: 'Kế hoạch' },
  { id: 'VBD-008', number: '1100/SLDTBXH-BTXH', title: 'Đề xuất chính sách hỗ trợ người lao động', sender: 'Sở LĐ-TB&XH', receiver: 'Phòng Chính sách', date: '2026-03-08', deadline: '2026-03-26', status: 'new', priority: 'medium', type: 'incoming', category: 'Đề xuất' },
];

export const outgoingDocuments: Document[] = [
  { id: 'VBĐ-001', number: '345/CV-VP', title: 'V/v phối hợp triển khai hệ thống e-Office', sender: 'Văn phòng', receiver: 'Các phòng ban', date: '2026-03-15', status: 'sent', priority: 'high', type: 'outgoing', category: 'Công văn' },
  { id: 'VBĐ-002', number: '346/BC-VP', title: 'Báo cáo kết quả công tác tháng 2/2026', sender: 'Văn phòng', receiver: 'UBND Tỉnh', date: '2026-03-14', status: 'sent', priority: 'medium', type: 'outgoing', category: 'Báo cáo' },
  { id: 'VBĐ-003', number: '347/KH-VP', title: 'Kế hoạch đào tạo cán bộ quý II/2026', sender: 'Phòng Tổ chức', receiver: 'Sở Nội vụ', date: '2026-03-13', status: 'draft', priority: 'medium', type: 'outgoing', category: 'Kế hoạch' },
  { id: 'VBĐ-004', number: '348/TB-VP', title: 'Thông báo lịch họp giao ban tháng 3/2026', sender: 'Văn phòng', receiver: 'Các đơn vị trực thuộc', date: '2026-03-12', status: 'sent', priority: 'low', type: 'outgoing', category: 'Thông báo' },
  { id: 'VBĐ-005', number: '349/TTr-VP', title: 'Tờ trình đề xuất mua sắm trang thiết bị', sender: 'Phòng Hành chính', receiver: 'Lãnh đạo', date: '2026-03-11', status: 'draft', priority: 'medium', type: 'outgoing', category: 'Tờ trình' },
  { id: 'VBĐ-006', number: '350/QD-VP', title: 'Quyết định phân công nhiệm vụ quý II/2026', sender: 'Giám đốc', receiver: 'Toàn cơ quan', date: '2026-03-10', status: 'sent', priority: 'high', type: 'outgoing', category: 'Quyết định' },
];

export const internalDocuments: Document[] = [
  { id: 'VBNB-001', number: 'NB-01/2026', title: 'Nội quy làm việc và chấm công năm 2026', sender: 'Phòng Hành chính', receiver: 'Toàn cơ quan', date: '2026-03-15', status: 'processing', priority: 'medium', type: 'internal', category: 'Nội quy' },
  { id: 'VBNB-002', number: 'NB-02/2026', title: 'Kế hoạch tổ chức team building quý I/2026', sender: 'Công đoàn', receiver: 'Toàn cơ quan', date: '2026-03-14', status: 'completed', priority: 'low', type: 'internal', category: 'Kế hoạch' },
  { id: 'VBNB-003', number: 'NB-03/2026', title: 'Hướng dẫn sử dụng hệ thống quản lý văn bản mới', sender: 'Phòng CNTT', receiver: 'Toàn cơ quan', date: '2026-03-13', status: 'new', priority: 'high', type: 'internal', category: 'Hướng dẫn' },
  { id: 'VBNB-004', number: 'NB-04/2026', title: 'Thông báo lịch nghỉ lễ 30/4 - 1/5', sender: 'Phòng Hành chính', receiver: 'Toàn cơ quan', date: '2026-03-12', status: 'draft', priority: 'low', type: 'internal', category: 'Thông báo' },
];

export const tasks: Task[] = [
  { id: 'CV-001', title: 'Soạn thảo báo cáo chuyển đổi số quý I', assignee: 'Nguyễn Văn An', assigneeAvatar: 'NVA', dueDate: '2026-03-20', status: 'in_progress', priority: 'high', progress: 65, documentRef: 'VBD-001' },
  { id: 'CV-002', title: 'Tổng hợp số liệu dịch bệnh', assignee: 'Trần Thị Bình', assigneeAvatar: 'TTB', dueDate: '2026-03-18', status: 'review', priority: 'high', progress: 90, documentRef: 'VBD-002' },
  { id: 'CV-003', title: 'Lập kế hoạch đào tạo cán bộ Q2', assignee: 'Lê Minh Châu', assigneeAvatar: 'LMC', dueDate: '2026-03-25', status: 'todo', priority: 'medium', progress: 0 },
  { id: 'CV-004', title: 'Xử lý hồ sơ cấp giấy CNQSDĐ', assignee: 'Phạm Đức Dương', assigneeAvatar: 'PDD', dueDate: '2026-03-16', status: 'in_progress', priority: 'high', progress: 40, documentRef: 'VBD-005' },
  { id: 'CV-005', title: 'Chuẩn bị tài liệu họp giao ban', assignee: 'Hoàng Thị Em', assigneeAvatar: 'HTE', dueDate: '2026-03-17', status: 'done', priority: 'medium', progress: 100 },
  { id: 'CV-006', title: 'Rà soát quyết toán ngân sách 2025', assignee: 'Vũ Thanh Phong', assigneeAvatar: 'VTP', dueDate: '2026-03-28', status: 'in_progress', priority: 'medium', progress: 30, documentRef: 'VBD-003' },
  { id: 'CV-007', title: 'Triển khai phần mềm quản lý mới', assignee: 'Nguyễn Văn An', assigneeAvatar: 'NVA', dueDate: '2026-03-30', status: 'todo', priority: 'high', progress: 10 },
  { id: 'CV-008', title: 'Báo cáo tình hình nhân sự tháng 3', assignee: 'Trần Thị Bình', assigneeAvatar: 'TTB', dueDate: '2026-03-22', status: 'in_progress', priority: 'low', progress: 55 },
];

export const calendarEvents: CalendarEvent[] = [
  { id: 'E-001', title: 'Họp giao ban đầu tuần', date: '2026-03-17', time: '08:00 - 09:30', location: 'Phòng họp A1', type: 'meeting', color: '#1e40af' },
  { id: 'E-002', title: 'Hạn nộp báo cáo dịch bệnh', date: '2026-03-18', time: '17:00', location: '', type: 'deadline', color: '#dc2626' },
  { id: 'E-003', title: 'Họp triển khai chuyển đổi số', date: '2026-03-19', time: '14:00 - 16:00', location: 'Hội trường lớn', type: 'meeting', color: '#1e40af' },
  { id: 'E-004', title: 'Hạn xử lý VBD-001', date: '2026-03-25', time: '17:00', location: '', type: 'deadline', color: '#dc2626' },
  { id: 'E-005', title: 'Đào tạo sử dụng e-Office', date: '2026-03-20', time: '09:00 - 11:30', location: 'Phòng đào tạo B2', type: 'event', color: '#059669' },
  { id: 'E-006', title: 'Họp xét duyệt ngân sách', date: '2026-03-21', time: '14:00 - 15:30', location: 'Phòng họp A2', type: 'meeting', color: '#1e40af' },
];

export const notifications: Notification[] = [
  { id: 'N-001', message: 'Văn bản mới #1245/UBND-VP đã được chuyển đến bạn', time: '5 phút trước', read: false, type: 'document' },
  { id: 'N-002', message: 'Công việc "Soạn thảo báo cáo" sắp đến hạn', time: '15 phút trước', read: false, type: 'task' },
  { id: 'N-003', message: 'Lãnh đạo đã phê duyệt văn bản #346/BC-VP', time: '1 giờ trước', read: false, type: 'document' },
  { id: 'N-004', message: 'Hệ thống sẽ bảo trì vào 22:00 hôm nay', time: '2 giờ trước', read: true, type: 'system' },
  { id: 'N-005', message: 'Trần Thị Bình đã hoàn thành công việc CV-002', time: '3 giờ trước', read: true, type: 'task' },
];

export const statsData = {
  totalIncoming: 1245,
  totalOutgoing: 856,
  totalInternal: 342,
  pendingTasks: 24,
  completedTasks: 186,
  overdueTasks: 5,
  monthlyIncoming: [
    { month: 'T1', count: 120 },
    { month: 'T2', count: 98 },
    { month: 'T3', count: 145 },
    { month: 'T4', count: 132 },
    { month: 'T5', count: 156 },
    { month: 'T6', count: 178 },
    { month: 'T7', count: 142 },
    { month: 'T8', count: 165 },
    { month: 'T9', count: 189 },
    { month: 'T10', count: 201 },
    { month: 'T11', count: 175 },
    { month: 'T12', count: 152 },
  ],
  documentByCategory: [
    { name: 'Công văn', value: 45 },
    { name: 'Báo cáo', value: 20 },
    { name: 'Kế hoạch', value: 15 },
    { name: 'Quyết định', value: 12 },
    { name: 'Khác', value: 8 },
  ],
};
