// ==========================================
// ENHANCED TASK DATA MODEL
// ==========================================

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

export interface TaskChecklist {
  id: string;
  title: string;
  completed: boolean;
}

export interface EnhancedTask {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assignee: string;
  assigneeAvatar: string;
  creatorId: string;
  creatorName: string;
  departmentId: string;
  departmentName: string;
  dueDate: string;
  startDate: string;
  completedDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  documentRef?: string;
  documentTitle?: string;
  tags: string[];
  checklist: TaskChecklist[];
  comments: TaskComment[];
  parentTaskId?: string;
  createdAt: string;
  updatedAt: string;
}

export const enhancedTasks: EnhancedTask[] = [
  {
    id: 'TASK-001',
    title: 'Soạn thảo báo cáo chuyển đổi số quý I',
    description: 'Tổng hợp số liệu và soạn thảo báo cáo tiến độ triển khai chuyển đổi số quý I/2026 theo chỉ đạo của UBND tỉnh.',
    assigneeId: 'user-head-3',
    assignee: 'Nguyễn Văn An',
    assigneeAvatar: 'NVA',
    creatorId: 'user-leader-1',
    creatorName: 'Trần Văn Minh',
    departmentId: 'dept-cntt',
    departmentName: 'Phòng CNTT',
    dueDate: '2026-03-20',
    startDate: '2026-03-10',
    status: 'in_progress',
    priority: 'high',
    progress: 65,
    documentRef: 'INC-001',
    documentTitle: 'V/v triển khai kế hoạch chuyển đổi số năm 2026',
    tags: ['Chuyển đổi số', 'Báo cáo'],
    checklist: [
      { id: 'cl-1', title: 'Thu thập số liệu từ các phòng ban', completed: true },
      { id: 'cl-2', title: 'Phân tích dữ liệu và lập biểu đồ', completed: true },
      { id: 'cl-3', title: 'Soạn nội dung báo cáo', completed: false },
      { id: 'cl-4', title: 'Trình Trưởng phòng xem xét', completed: false },
      { id: 'cl-5', title: 'Chỉnh sửa và hoàn thiện', completed: false },
    ],
    comments: [
      { id: 'tc-1', userId: 'user-leader-1', userName: 'Trần Văn Minh', userAvatar: 'TVM', content: 'Cần ưu tiên hoàn thành trước ngày 20/03. Lưu ý bổ sung phần đánh giá hiệu quả triển khai.', timestamp: '2026-03-15T09:00:00' },
      { id: 'tc-2', userId: 'user-head-3', userName: 'Nguyễn Văn An', userAvatar: 'NVA', content: 'Đã thu thập xong dữ liệu, đang phân tích. Dự kiến hoàn thành đúng tiến độ.', timestamp: '2026-03-16T14:00:00' },
    ],
    createdAt: '2026-03-10',
    updatedAt: '2026-03-16T14:00:00',
  },
  {
    id: 'TASK-002',
    title: 'Tổng hợp số liệu dịch bệnh quý I',
    description: 'Tổng hợp và phân tích dữ liệu tình hình dịch bệnh trên địa bàn huyện quý I/2026.',
    assigneeId: 'user-specialist-1',
    assignee: 'Trần Thị Bình',
    assigneeAvatar: 'TTB',
    creatorId: 'user-head-1',
    creatorName: 'Lê Thị Hương',
    departmentId: 'dept-vp',
    departmentName: 'Văn phòng',
    dueDate: '2026-03-18',
    startDate: '2026-03-08',
    status: 'review',
    priority: 'high',
    progress: 90,
    documentRef: 'INC-002',
    documentTitle: 'Báo cáo tình hình dịch bệnh quý I/2026',
    tags: ['Y tế', 'Báo cáo'],
    checklist: [
      { id: 'cl-6', title: 'Liên hệ trạm y tế các xã', completed: true },
      { id: 'cl-7', title: 'Tổng hợp biểu mẫu', completed: true },
      { id: 'cl-8', title: 'Nhập liệu và phân tích', completed: true },
      { id: 'cl-9', title: 'Trình lãnh đạo duyệt', completed: false },
    ],
    comments: [],
    createdAt: '2026-03-08',
    updatedAt: '2026-03-16T10:00:00',
  },
  {
    id: 'TASK-003',
    title: 'Lập kế hoạch đào tạo cán bộ quý II',
    description: 'Xây dựng kế hoạch đào tạo, bồi dưỡng cán bộ, công chức cho quý II/2026.',
    assigneeId: 'user-head-4',
    assignee: 'Vũ Thanh Phong',
    assigneeAvatar: 'VTP',
    creatorId: 'user-leader-1',
    creatorName: 'Trần Văn Minh',
    departmentId: 'dept-tchc',
    departmentName: 'Phòng TC-HC',
    dueDate: '2026-03-25',
    startDate: '2026-03-12',
    status: 'todo',
    priority: 'medium',
    progress: 0,
    tags: ['Đào tạo', 'Kế hoạch'],
    checklist: [
      { id: 'cl-10', title: 'Khảo sát nhu cầu đào tạo', completed: false },
      { id: 'cl-11', title: 'Dự trù kinh phí', completed: false },
      { id: 'cl-12', title: 'Soạn kế hoạch chi tiết', completed: false },
    ],
    comments: [],
    createdAt: '2026-03-12',
    updatedAt: '2026-03-12',
  },
  {
    id: 'TASK-004',
    title: 'Xử lý hồ sơ cấp GCNQSDĐ đợt 3',
    description: 'Rà soát và xử lý hồ sơ cấp giấy chứng nhận quyền sử dụng đất đợt 3.',
    assigneeId: 'user-head-2',
    assignee: 'Phạm Đức Dương',
    assigneeAvatar: 'PDD',
    creatorId: 'user-leader-1',
    creatorName: 'Trần Văn Minh',
    departmentId: 'dept-tckt',
    departmentName: 'Phòng TC-KT',
    dueDate: '2026-03-16',
    startDate: '2026-03-06',
    status: 'in_progress',
    priority: 'urgent',
    progress: 40,
    documentRef: 'INC-005',
    documentTitle: 'V/v cấp giấy chứng nhận quyền sử dụng đất đợt 3',
    tags: ['Đất đai', 'Hồ sơ'],
    checklist: [
      { id: 'cl-13', title: 'Tiếp nhận hồ sơ', completed: true },
      { id: 'cl-14', title: 'Thẩm tra hồ sơ', completed: true },
      { id: 'cl-15', title: 'Khảo sát thực địa', completed: false },
      { id: 'cl-16', title: 'Hoàn thiện hồ sơ trình ký', completed: false },
    ],
    comments: [
      { id: 'tc-3', userId: 'user-leader-1', userName: 'Trần Văn Minh', userAvatar: 'TVM', content: 'Công việc này đã quá hạn, yêu cầu báo cáo tiến độ ngay.', timestamp: '2026-03-17T08:00:00' },
    ],
    createdAt: '2026-03-06',
    updatedAt: '2026-03-17T08:00:00',
  },
  {
    id: 'TASK-005',
    title: 'Chuẩn bị tài liệu họp giao ban tháng 3',
    description: 'Chuẩn bị toàn bộ tài liệu, nội dung cho cuộc họp giao ban đầu tháng.',
    assigneeId: 'user-clerk-1',
    assignee: 'Hoàng Thị Em',
    assigneeAvatar: 'HTE',
    creatorId: 'user-head-1',
    creatorName: 'Lê Thị Hương',
    departmentId: 'dept-vp',
    departmentName: 'Văn phòng',
    dueDate: '2026-03-17',
    startDate: '2026-03-14',
    completedDate: '2026-03-16',
    status: 'done',
    priority: 'medium',
    progress: 100,
    tags: ['Họp', 'Tài liệu'],
    checklist: [
      { id: 'cl-17', title: 'Thu thập báo cáo các phòng', completed: true },
      { id: 'cl-18', title: 'In ấn tài liệu', completed: true },
      { id: 'cl-19', title: 'Chuẩn bị phòng họp', completed: true },
    ],
    comments: [],
    createdAt: '2026-03-14',
    updatedAt: '2026-03-16T16:00:00',
  },
  {
    id: 'TASK-006',
    title: 'Rà soát quyết toán ngân sách 2025',
    description: 'Rà soát toàn bộ số liệu quyết toán ngân sách năm 2025 theo hướng dẫn của Bộ Tài chính.',
    assigneeId: 'user-head-2',
    assignee: 'Phạm Đức Dương',
    assigneeAvatar: 'PDD',
    creatorId: 'user-leader-1',
    creatorName: 'Trần Văn Minh',
    departmentId: 'dept-tckt',
    departmentName: 'Phòng TC-KT',
    dueDate: '2026-03-28',
    startDate: '2026-03-13',
    status: 'in_progress',
    priority: 'medium',
    progress: 30,
    documentRef: 'INC-003',
    documentTitle: 'Hướng dẫn quyết toán ngân sách năm 2025',
    tags: ['Ngân sách', 'Quyết toán'],
    checklist: [
      { id: 'cl-20', title: 'Đối chiếu sổ sách kế toán', completed: true },
      { id: 'cl-21', title: 'Kiểm tra chứng từ', completed: false },
      { id: 'cl-22', title: 'Lập biểu mẫu quyết toán', completed: false },
      { id: 'cl-23', title: 'Trình lãnh đạo phê duyệt', completed: false },
    ],
    comments: [],
    createdAt: '2026-03-13',
    updatedAt: '2026-03-15T10:00:00',
  },
  {
    id: 'TASK-007',
    title: 'Triển khai phần mềm quản lý văn bản mới',
    description: 'Cài đặt, cấu hình và hướng dẫn sử dụng hệ thống e-Office cho toàn cơ quan.',
    assigneeId: 'user-specialist-2',
    assignee: 'Lê Minh Châu',
    assigneeAvatar: 'LMC',
    creatorId: 'user-head-3',
    creatorName: 'Nguyễn Văn An',
    departmentId: 'dept-cntt',
    departmentName: 'Phòng CNTT',
    dueDate: '2026-03-30',
    startDate: '2026-03-15',
    status: 'in_progress',
    priority: 'high',
    progress: 25,
    tags: ['CNTT', 'Triển khai'],
    checklist: [
      { id: 'cl-24', title: 'Cài đặt server', completed: true },
      { id: 'cl-25', title: 'Cấu hình hệ thống', completed: true },
      { id: 'cl-26', title: 'Import dữ liệu', completed: false },
      { id: 'cl-27', title: 'Đào tạo người dùng', completed: false },
      { id: 'cl-28', title: 'Chạy thử nghiệm', completed: false },
      { id: 'cl-29', title: 'Go-live chính thức', completed: false },
    ],
    comments: [],
    createdAt: '2026-03-15',
    updatedAt: '2026-03-17T08:00:00',
  },
  {
    id: 'TASK-008',
    title: 'Báo cáo tình hình nhân sự tháng 3',
    description: 'Tổng hợp tình hình nhân sự, biến động, nghỉ phép, tuyển dụng trong tháng 3.',
    assigneeId: 'user-specialist-1',
    assignee: 'Trần Thị Bình',
    assigneeAvatar: 'TTB',
    creatorId: 'user-head-4',
    creatorName: 'Vũ Thanh Phong',
    departmentId: 'dept-vp',
    departmentName: 'Văn phòng',
    dueDate: '2026-03-22',
    startDate: '2026-03-10',
    status: 'in_progress',
    priority: 'low',
    progress: 55,
    tags: ['Nhân sự', 'Báo cáo'],
    checklist: [
      { id: 'cl-30', title: 'Tổng hợp dữ liệu chấm công', completed: true },
      { id: 'cl-31', title: 'Lập bảng thống kê nghỉ phép', completed: true },
      { id: 'cl-32', title: 'Soạn báo cáo chi tiết', completed: false },
    ],
    comments: [],
    createdAt: '2026-03-10',
    updatedAt: '2026-03-15T14:00:00',
  },
  {
    id: 'TASK-009',
    title: 'Sắp xếp tổ chức bộ máy theo NQ18',
    description: 'Rà soát cơ cấu tổ chức, đề xuất phương án sắp xếp bộ máy theo Nghị quyết 18.',
    assigneeId: 'user-head-4',
    assignee: 'Vũ Thanh Phong',
    assigneeAvatar: 'VTP',
    creatorId: 'user-leader-1',
    creatorName: 'Trần Văn Minh',
    departmentId: 'dept-tchc',
    departmentName: 'Phòng TC-HC',
    dueDate: '2026-03-28',
    startDate: '2026-03-11',
    status: 'in_progress',
    priority: 'medium',
    progress: 20,
    documentRef: 'INC-006',
    documentTitle: 'V/v sắp xếp tổ chức bộ máy cơ quan hành chính',
    tags: ['Tổ chức', 'Cải cách'],
    checklist: [],
    comments: [],
    createdAt: '2026-03-11',
    updatedAt: '2026-03-14T10:00:00',
  },
  {
    id: 'TASK-010',
    title: 'Viết tài liệu hướng dẫn sử dụng e-Office',
    description: 'Soạn tài liệu hướng dẫn chi tiết cho toàn bộ tính năng của hệ thống e-Office.',
    assigneeId: 'user-specialist-2',
    assignee: 'Lê Minh Châu',
    assigneeAvatar: 'LMC',
    creatorId: 'user-head-3',
    creatorName: 'Nguyễn Văn An',
    departmentId: 'dept-cntt',
    departmentName: 'Phòng CNTT',
    dueDate: '2026-03-23',
    startDate: '2026-03-12',
    completedDate: '2026-03-16',
    status: 'done',
    priority: 'medium',
    progress: 100,
    tags: ['CNTT', 'Tài liệu'],
    checklist: [],
    comments: [],
    createdAt: '2026-03-12',
    updatedAt: '2026-03-16T14:00:00',
  },
];

// ==========================================
// CALENDAR & MEETING ROOM DATA
// ==========================================

export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  floor: string;
  equipment: string[];
  isActive: boolean;
  color: string;
}

export type EventType = 'meeting' | 'deadline' | 'event' | 'reminder' | 'room_booking';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: EventType;
  color: string;
  creatorId: string;
  creatorName: string;
  attendees: string[];
  roomId?: string;
  isAllDay: boolean;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  relatedDocId?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export const meetingRooms: MeetingRoom[] = [
  { id: 'room-a1', name: 'Phòng họp A1', capacity: 20, floor: 'Tầng 1', equipment: ['Máy chiếu', 'Bảng trắng', 'Micro', 'Camera hội nghị'], isActive: true, color: '#1e40af' },
  { id: 'room-a2', name: 'Phòng họp A2', capacity: 10, floor: 'Tầng 1', equipment: ['Máy chiếu', 'Bảng trắng'], isActive: true, color: '#7c3aed' },
  { id: 'room-b1', name: 'Phòng đào tạo B1', capacity: 40, floor: 'Tầng 2', equipment: ['Máy chiếu', 'Hệ thống âm thanh', 'Micro', 'Máy tính'], isActive: true, color: '#059669' },
  { id: 'room-b2', name: 'Phòng đào tạo B2', capacity: 30, floor: 'Tầng 2', equipment: ['Máy chiếu', 'Bảng trắng', 'Máy tính'], isActive: true, color: '#0891b2' },
  { id: 'room-hall', name: 'Hội trường lớn', capacity: 100, floor: 'Tầng 3', equipment: ['Hệ thống âm thanh', 'Máy chiếu HD', 'Sân khấu', 'Micro không dây'], isActive: true, color: '#dc2626' },
  { id: 'room-vip', name: 'Phòng VIP', capacity: 8, floor: 'Tầng 1', equipment: ['Màn hình 65"', 'Camera hội nghị', 'Máy pha cà phê'], isActive: true, color: '#d97706' },
];

export const calendarEvents: CalendarEvent[] = [
  {
    id: 'EVT-001', title: 'Họp giao ban đầu tuần', description: 'Họp giao ban báo cáo kết quả tuần trước và triển khai kế hoạch tuần mới.',
    date: '2026-03-17', startTime: '08:00', endTime: '09:30', location: 'Phòng họp A1', type: 'meeting', color: '#1e40af',
    creatorId: 'user-leader-1', creatorName: 'Trần Văn Minh',
    attendees: ['Trần Văn Minh', 'Lê Thị Hương', 'Nguyễn Văn An', 'Phạm Đức Dương', 'Vũ Thanh Phong'],
    roomId: 'room-a1', isAllDay: false, recurrence: 'weekly', status: 'scheduled',
  },
  {
    id: 'EVT-002', title: 'Hạn nộp báo cáo dịch bệnh Q1', description: 'Deadline nộp báo cáo tình hình dịch bệnh quý I/2026.',
    date: '2026-03-18', startTime: '17:00', endTime: '17:00', location: '', type: 'deadline', color: '#dc2626',
    creatorId: 'user-head-1', creatorName: 'Lê Thị Hương',
    attendees: ['Trần Thị Bình'], isAllDay: false, status: 'scheduled',
  },
  {
    id: 'EVT-003', title: 'Họp triển khai chuyển đổi số', description: 'Hội nghị triển khai kế hoạch chuyển đổi số năm 2026 trên địa bàn huyện.',
    date: '2026-03-19', startTime: '14:00', endTime: '16:00', location: 'Hội trường lớn', type: 'meeting', color: '#1e40af',
    creatorId: 'user-leader-1', creatorName: 'Trần Văn Minh',
    attendees: ['Trần Văn Minh', 'Nguyễn Văn An', 'Lê Minh Châu', 'Lê Thị Hương', 'Phạm Đức Dương', 'Vũ Thanh Phong'],
    roomId: 'room-hall', isAllDay: false, relatedDocId: 'INC-001', status: 'scheduled',
  },
  {
    id: 'EVT-004', title: 'Đào tạo sử dụng e-Office', description: 'Buổi đào tạo hướng dẫn sử dụng hệ thống quản lý văn bản e-Office.',
    date: '2026-03-20', startTime: '09:00', endTime: '11:30', location: 'Phòng đào tạo B2', type: 'event', color: '#059669',
    creatorId: 'user-head-3', creatorName: 'Nguyễn Văn An',
    attendees: ['Lê Minh Châu', 'Hoàng Thị Em', 'Trần Thị Bình'],
    roomId: 'room-b2', isAllDay: false, status: 'scheduled',
  },
  {
    id: 'EVT-005', title: 'Họp xét duyệt ngân sách Q2', description: 'Họp xét duyệt dự toán ngân sách quý II/2026.',
    date: '2026-03-21', startTime: '14:00', endTime: '15:30', location: 'Phòng họp A2', type: 'meeting', color: '#7c3aed',
    creatorId: 'user-leader-1', creatorName: 'Trần Văn Minh',
    attendees: ['Trần Văn Minh', 'Phạm Đức Dương', 'Lê Thị Hương'],
    roomId: 'room-a2', isAllDay: false, status: 'scheduled',
  },
  {
    id: 'EVT-006', title: 'Hạn xử lý VB chuyển đổi số', description: 'Hạn cuối xử lý văn bản 1245/UBND-VP.',
    date: '2026-03-25', startTime: '17:00', endTime: '17:00', location: '', type: 'deadline', color: '#dc2626',
    creatorId: 'user-clerk-1', creatorName: 'Hoàng Thị Em',
    attendees: ['Nguyễn Văn An'], isAllDay: false, relatedDocId: 'INC-001', status: 'scheduled',
  },
  {
    id: 'EVT-007', title: 'Hội nghị công chức đầu năm', description: 'Hội nghị tổng kết năm 2025 và triển khai nhiệm vụ năm 2026.',
    date: '2026-03-24', startTime: '08:00', endTime: '11:00', location: 'Hội trường lớn', type: 'event', color: '#059669',
    creatorId: 'user-leader-1', creatorName: 'Trần Văn Minh',
    attendees: ['Toàn cơ quan'], roomId: 'room-hall', isAllDay: false, status: 'scheduled',
  },
  {
    id: 'EVT-008', title: 'Họp phòng CNTT', description: 'Họp nội bộ phòng CNTT triển khai kế hoạch tuần.',
    date: '2026-03-17', startTime: '14:00', endTime: '15:00', location: 'Phòng VIP', type: 'meeting', color: '#d97706',
    creatorId: 'user-head-3', creatorName: 'Nguyễn Văn An',
    attendees: ['Nguyễn Văn An', 'Lê Minh Châu'], roomId: 'room-vip', isAllDay: false, status: 'scheduled',
  },
  {
    id: 'EVT-009', title: 'Nhắc nhở: Hoàn thành hồ sơ QSDĐ', description: 'Nhắc nhở phòng TC-KT hoàn thành hồ sơ cấp GCNQSDĐ đợt 3.',
    date: '2026-03-17', startTime: '10:00', endTime: '10:00', location: '', type: 'reminder', color: '#f59e0b',
    creatorId: 'user-leader-1', creatorName: 'Trần Văn Minh',
    attendees: ['Phạm Đức Dương'], isAllDay: false, status: 'scheduled',
  },
];

export const eventTypeLabels: Record<EventType, { label: string; color: string; bg: string }> = {
  meeting: { label: 'Cuộc họp', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  deadline: { label: 'Hạn chót', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
  event: { label: 'Sự kiện', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  reminder: { label: 'Nhắc nhở', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  room_booking: { label: 'Đặt phòng', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30' },
};