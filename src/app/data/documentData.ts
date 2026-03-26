// ==========================================
// ENHANCED DOCUMENT DATA MODEL
// ==========================================

export type IncomingStatus = 'pending_receive' | 'received' | 'assigned' | 'processing' | 'completed' | 'overdue' | 'returned';
export type OutgoingStatus = 'draft' | 'dept_review' | 'leader_review' | 'approved' | 'published' | 'rejected';
export type InternalStatus = 'draft' | 'review' | 'approved' | 'distributed' | 'rejected';
export type DocPriority = 'urgent_top' | 'urgent' | 'high' | 'medium' | 'low';
export type DocSecurity = 'normal' | 'confidential' | 'secret' | 'top_secret';

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface WorkflowStep {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  comment: string;
  status: 'completed' | 'current' | 'pending' | 'rejected';
}

export interface DocumentComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

export interface EnhancedDocument {
  id: string;
  number: string;
  title: string;
  content: string;
  sender: string;
  senderUnit: string;
  receiver: string;
  receiverUnit: string;
  date: string;
  receivedDate?: string;
  deadline?: string;
  status: IncomingStatus | OutgoingStatus | InternalStatus;
  priority: DocPriority;
  security: DocSecurity;
  type: 'incoming' | 'outgoing' | 'internal';
  category: string;
  field: string;
  pageCount: number;
  assignedTo?: string[];
  assignedToNames?: string[];
  processorId?: string;
  processorName?: string;
  createdBy: string;
  createdByName: string;
  updatedAt: string;
  attachments: Attachment[];
  workflow: WorkflowStep[];
  comments: DocumentComment[];
  relatedDocIds: string[];
  year: number;
  bookNumber?: number; // số thứ tự trong sổ văn bản
  isLocked: boolean; // VB đã phát hành => locked
}

// ==========================================
// INCOMING DOCUMENTS
// ==========================================
export const incomingDocs: EnhancedDocument[] = [
  {
    id: 'INC-001',
    number: '1245/UBND-VP',
    title: 'V/v triển khai kế hoạch chuyển đổi số năm 2026',
    content: 'Thực hiện Nghị quyết số 52-NQ/TW của Bộ Chính trị, UBND tỉnh yêu cầu các cơ quan, đơn vị triển khai kế hoạch chuyển đổi số năm 2026 với các nội dung cụ thể sau đây...',
    sender: 'UBND Tỉnh',
    senderUnit: 'Văn phòng UBND Tỉnh',
    receiver: 'UBND Huyện Bình Minh',
    receiverUnit: 'Phòng CNTT',
    date: '2026-03-14',
    receivedDate: '2026-03-15',
    deadline: '2026-03-25',
    status: 'processing',
    priority: 'urgent',
    security: 'normal',
    type: 'incoming',
    category: 'Công văn',
    field: 'Công nghệ thông tin',
    pageCount: 5,
    assignedTo: ['user-head-3', 'user-specialist-2'],
    assignedToNames: ['Nguyễn Văn An', 'Lê Minh Châu'],
    processorId: 'user-head-3',
    processorName: 'Nguyễn Văn An',
    createdBy: 'user-clerk-1',
    createdByName: 'Hoàng Thị Em',
    updatedAt: '2026-03-16T10:30:00',
    attachments: [
      { id: 'att-1', name: 'CV_1245_UBND_VP.pdf', size: '2.3 MB', type: 'pdf', uploadedBy: 'Hoàng Thị Em', uploadedAt: '2026-03-15' },
      { id: 'att-2', name: 'PhuLuc_KH_CDS_2026.xlsx', size: '856 KB', type: 'xlsx', uploadedBy: 'Hoàng Thị Em', uploadedAt: '2026-03-15' },
    ],
    workflow: [
      { id: 'wf-1', action: 'Tiếp nhận văn bản', actorId: 'user-clerk-1', actorName: 'Hoàng Thị Em', actorRole: 'Văn thư', timestamp: '2026-03-15T08:00:00', comment: 'Tiếp nhận và đăng ký vào sổ văn bản đến', status: 'completed' },
      { id: 'wf-2', action: 'Trình lãnh đạo', actorId: 'user-clerk-1', actorName: 'Hoàng Thị Em', actorRole: 'Văn thư', timestamp: '2026-03-15T08:30:00', comment: 'Trình Chủ tịch UBND cho ý kiến chỉ đạo', status: 'completed' },
      { id: 'wf-3', action: 'Phân công xử lý', actorId: 'user-leader-1', actorName: 'Trần Văn Minh', actorRole: 'Lãnh đạo', timestamp: '2026-03-15T09:15:00', comment: 'Giao Phòng CNTT chủ trì, phối hợp Văn phòng triển khai. Báo cáo kết quả trước 25/03.', status: 'completed' },
      { id: 'wf-4', action: 'Xử lý văn bản', actorId: 'user-head-3', actorName: 'Nguyễn Văn An', actorRole: 'Trưởng phòng CNTT', timestamp: '', comment: '', status: 'current' },
      { id: 'wf-5', action: 'Báo cáo kết quả', actorId: 'user-head-3', actorName: 'Nguyễn Văn An', actorRole: 'Trưởng phòng CNTT', timestamp: '', comment: '', status: 'pending' },
    ],
    comments: [
      { id: 'cmt-1', userId: 'user-leader-1', userName: 'Trần Văn Minh', userAvatar: 'TVM', content: 'Đây là văn bản quan trọng, cần ưu tiên triển khai ngay. Phòng CNTT lập kế hoạch chi tiết và báo cáo lại.', timestamp: '2026-03-15T09:15:00' },
      { id: 'cmt-2', userId: 'user-head-3', userName: 'Nguyễn Văn An', userAvatar: 'NVA', content: 'Đã nhận nhiệm vụ. Đang phối hợp với VP lập kế hoạch triển khai chi tiết. Dự kiến hoàn thành trước 23/03.', timestamp: '2026-03-15T14:00:00' },
    ],
    relatedDocIds: ['INC-003'],
    year: 2026,
    bookNumber: 45,
    isLocked: false,
  },
  {
    id: 'INC-002',
    number: '856/SYT-NVY',
    title: 'Báo cáo tình hình dịch bệnh quý I/2026',
    content: 'Sở Y tế báo cáo tình hình dịch bệnh quý I năm 2026 trên địa bàn tỉnh...',
    sender: 'Sở Y tế',
    senderUnit: 'Phòng Nghiệp vụ Y',
    receiver: 'UBND Huyện Bình Minh',
    receiverUnit: 'Phòng Y tế',
    date: '2026-03-13',
    receivedDate: '2026-03-14',
    deadline: '2026-03-20',
    status: 'processing',
    priority: 'high',
    security: 'normal',
    type: 'incoming',
    category: 'Báo cáo',
    field: 'Y tế',
    pageCount: 12,
    assignedTo: ['user-specialist-1'],
    assignedToNames: ['Trần Thị Bình'],
    processorId: 'user-specialist-1',
    processorName: 'Trần Thị Bình',
    createdBy: 'user-clerk-1',
    createdByName: 'Hoàng Thị Em',
    updatedAt: '2026-03-16T14:00:00',
    attachments: [
      { id: 'att-3', name: 'BC_856_SYT_Q1_2026.pdf', size: '4.1 MB', type: 'pdf', uploadedBy: 'Hoàng Thị Em', uploadedAt: '2026-03-14' },
    ],
    workflow: [
      { id: 'wf-6', action: 'Tiếp nhận văn bản', actorId: 'user-clerk-1', actorName: 'Hoàng Thị Em', actorRole: 'Văn thư', timestamp: '2026-03-14T08:30:00', comment: 'Tiếp nhận và vào sổ', status: 'completed' },
      { id: 'wf-7', action: 'Phân công xử lý', actorId: 'user-leader-1', actorName: 'Trần Văn Minh', actorRole: 'Lãnh đạo', timestamp: '2026-03-14T10:00:00', comment: 'Giao phòng Y tế tổng hợp, trình báo cáo', status: 'completed' },
      { id: 'wf-8', action: 'Xử lý văn bản', actorId: 'user-specialist-1', actorName: 'Trần Thị Bình', actorRole: 'Chuyên viên', timestamp: '', comment: '', status: 'current' },
    ],
    comments: [],
    relatedDocIds: [],
    year: 2026,
    bookNumber: 42,
    isLocked: false,
  },
  {
    id: 'INC-003',
    number: '2341/BTC-CST',
    title: 'Hướng dẫn quyết toán ngân sách năm 2025',
    content: 'Bộ Tài chính hướng dẫn các đơn vị thực hiện quyết toán ngân sách nhà nước năm 2025...',
    sender: 'Bộ Tài chính',
    senderUnit: 'Cục Quản lý công sản',
    receiver: 'UBND Huyện Bình Minh',
    receiverUnit: 'Phòng TC-KT',
    date: '2026-03-12',
    receivedDate: '2026-03-13',
    deadline: '2026-04-01',
    status: 'assigned',
    priority: 'medium',
    security: 'normal',
    type: 'incoming',
    category: 'Hướng dẫn',
    field: 'Tài chính - Ngân sách',
    pageCount: 8,
    assignedTo: ['user-head-2'],
    assignedToNames: ['Phạm Đức Dương'],
    createdBy: 'user-clerk-1',
    createdByName: 'Hoàng Thị Em',
    updatedAt: '2026-03-14T08:00:00',
    attachments: [
      { id: 'att-4', name: 'HD_QuyetToan_NS_2025.pdf', size: '3.5 MB', type: 'pdf', uploadedBy: 'Hoàng Thị Em', uploadedAt: '2026-03-13' },
    ],
    workflow: [
      { id: 'wf-9', action: 'Tiếp nhận văn bản', actorId: 'user-clerk-1', actorName: 'Hoàng Thị Em', actorRole: 'Văn thư', timestamp: '2026-03-13T08:00:00', comment: 'Tiếp nhận', status: 'completed' },
      { id: 'wf-10', action: 'Phân công xử lý', actorId: 'user-leader-1', actorName: 'Trần Văn Minh', actorRole: 'Lãnh đạo', timestamp: '2026-03-13T10:30:00', comment: 'Giao phòng TC-KT triển khai theo hướng dẫn', status: 'completed' },
      { id: 'wf-11', action: 'Xử lý văn bản', actorId: 'user-head-2', actorName: 'Phạm Đức Dương', actorRole: 'Trưởng phòng TC-KT', timestamp: '', comment: '', status: 'pending' },
    ],
    comments: [],
    relatedDocIds: ['INC-001'],
    year: 2026,
    bookNumber: 38,
    isLocked: false,
  },
  {
    id: 'INC-004',
    number: '567/SGDDT-GDTrH',
    title: 'Kế hoạch thi tốt nghiệp THPT năm 2026',
    content: 'Sở GD&ĐT thông báo kế hoạch tổ chức kỳ thi tốt nghiệp THPT năm 2026...',
    sender: 'Sở GD&ĐT',
    senderUnit: 'Phòng GD Trung học',
    receiver: 'UBND Huyện Bình Minh',
    receiverUnit: 'Phòng GD&ĐT',
    date: '2026-03-11',
    receivedDate: '2026-03-12',
    deadline: '2026-03-30',
    status: 'completed',
    priority: 'medium',
    security: 'normal',
    type: 'incoming',
    category: 'Kế hoạch',
    field: 'Giáo dục',
    pageCount: 6,
    assignedTo: [],
    createdBy: 'user-clerk-1',
    createdByName: 'Hoàng Thị Em',
    updatedAt: '2026-03-14T16:00:00',
    attachments: [
      { id: 'att-5', name: 'KH_ThiTN_THPT_2026.pdf', size: '1.8 MB', type: 'pdf', uploadedBy: 'Hoàng Thị Em', uploadedAt: '2026-03-12' },
    ],
    workflow: [
      { id: 'wf-12', action: 'Tiếp nhận văn bản', actorId: 'user-clerk-1', actorName: 'Hoàng Thị Em', actorRole: 'Văn thư', timestamp: '2026-03-12T08:00:00', comment: '', status: 'completed' },
      { id: 'wf-13', action: 'Phân công xử lý', actorId: 'user-leader-1', actorName: 'Trần Văn Minh', actorRole: 'Lãnh đạo', timestamp: '2026-03-12T09:00:00', comment: 'Giao phòng GD&ĐT triển khai', status: 'completed' },
      { id: 'wf-14', action: 'Hoàn thành xử lý', actorId: 'user-specialist-1', actorName: 'Trần Thị Bình', actorRole: 'Chuyên viên', timestamp: '2026-03-14T16:00:00', comment: 'Đã triển khai đến các trường trên địa bàn', status: 'completed' },
    ],
    comments: [],
    relatedDocIds: [],
    year: 2026,
    bookNumber: 35,
    isLocked: false,
  },
  {
    id: 'INC-005',
    number: '189/STNMT-QLDD',
    title: 'V/v cấp giấy chứng nhận quyền sử dụng đất đợt 3',
    content: 'Sở TN&MT đề nghị UBND huyện phối hợp rà soát hồ sơ cấp GCNQSDĐ đợt 3 năm 2026...',
    sender: 'Sở TN&MT',
    senderUnit: 'Phòng Quản lý đất đai',
    receiver: 'UBND Huyện Bình Minh',
    receiverUnit: 'Phòng TN&MT',
    date: '2026-03-05',
    receivedDate: '2026-03-06',
    deadline: '2026-03-15',
    status: 'overdue',
    priority: 'urgent',
    security: 'normal',
    type: 'incoming',
    category: 'Công văn',
    field: 'Tài nguyên - Môi trường',
    pageCount: 3,
    assignedTo: ['user-head-2'],
    assignedToNames: ['Phạm Đức Dương'],
    createdBy: 'user-clerk-1',
    createdByName: 'Hoàng Thị Em',
    updatedAt: '2026-03-06T08:00:00',
    attachments: [
      { id: 'att-6', name: 'CV_189_STNMT.pdf', size: '1.2 MB', type: 'pdf', uploadedBy: 'Hoàng Thị Em', uploadedAt: '2026-03-06' },
    ],
    workflow: [
      { id: 'wf-15', action: 'Tiếp nhận văn bản', actorId: 'user-clerk-1', actorName: 'Hoàng Thị Em', actorRole: 'Văn thư', timestamp: '2026-03-06T08:00:00', comment: '', status: 'completed' },
      { id: 'wf-16', action: 'Phân công xử lý', actorId: 'user-leader-1', actorName: 'Trần Văn Minh', actorRole: 'Lãnh đạo', timestamp: '2026-03-06T09:30:00', comment: 'Khẩn - phòng TN&MT xử lý gấp', status: 'completed' },
      { id: 'wf-17', action: 'Xử lý văn bản', actorId: 'user-head-2', actorName: 'Phạm Đức Dương', actorRole: 'Trưởng phòng', timestamp: '', comment: '', status: 'current' },
    ],
    comments: [
      { id: 'cmt-3', userId: 'user-leader-1', userName: 'Trần Văn Minh', userAvatar: 'TVM', content: 'Văn bản này đã quá hạn, yêu cầu xử lý ngay và báo cáo lý do chậm trễ.', timestamp: '2026-03-16T08:00:00' },
    ],
    relatedDocIds: [],
    year: 2026,
    bookNumber: 28,
    isLocked: false,
  },
  {
    id: 'INC-006',
    number: '3456/BNV-TCBC',
    title: 'V/v sắp xếp tổ chức bộ máy cơ quan hành chính',
    content: 'Bộ Nội vụ yêu cầu rà soát, sắp xếp tổ chức bộ máy theo Nghị quyết số 18-NQ/TW...',
    sender: 'Bộ Nội vụ',
    senderUnit: 'Vụ Tổ chức - Biên chế',
    receiver: 'UBND Huyện Bình Minh',
    receiverUnit: 'Phòng TC-HC',
    date: '2026-03-09',
    receivedDate: '2026-03-10',
    deadline: '2026-03-28',
    status: 'processing',
    priority: 'medium',
    security: 'normal',
    type: 'incoming',
    category: 'Công văn',
    field: 'Hành chính',
    pageCount: 4,
    assignedTo: ['user-head-4'],
    assignedToNames: ['Vũ Thanh Phong'],
    processorId: 'user-head-4',
    processorName: 'Vũ Thanh Phong',
    createdBy: 'user-clerk-1',
    createdByName: 'Hoàng Thị Em',
    updatedAt: '2026-03-12T10:00:00',
    attachments: [
      { id: 'att-7', name: 'CV_3456_BNV.pdf', size: '2.8 MB', type: 'pdf', uploadedBy: 'Hoàng Thị Em', uploadedAt: '2026-03-10' },
    ],
    workflow: [
      { id: 'wf-18', action: 'Tiếp nhận văn bản', actorId: 'user-clerk-1', actorName: 'Hoàng Thị Em', actorRole: 'Văn thư', timestamp: '2026-03-10T08:00:00', comment: '', status: 'completed' },
      { id: 'wf-19', action: 'Phân công xử lý', actorId: 'user-leader-1', actorName: 'Trần Văn Minh', actorRole: 'Lãnh đạo', timestamp: '2026-03-10T09:00:00', comment: 'Phòng TC-HC chủ trì rà soát', status: 'completed' },
      { id: 'wf-20', action: 'Xử lý văn bản', actorId: 'user-head-4', actorName: 'Vũ Thanh Phong', actorRole: 'Trưởng phòng TC-HC', timestamp: '2026-03-12T10:00:00', comment: 'Đang rà soát lại cơ cấu tổ chức', status: 'current' },
    ],
    comments: [],
    relatedDocIds: [],
    year: 2026,
    bookNumber: 32,
    isLocked: false,
  },
  {
    id: 'INC-007',
    number: '1100/SLDTBXH-BTXH',
    title: 'Đề xuất chính sách hỗ trợ người lao động năm 2026',
    content: 'Sở LĐ-TB&XH đề xuất ban hành chính sách hỗ trợ người lao động...',
    sender: 'Sở LĐ-TB&XH',
    senderUnit: 'Phòng Bảo trợ xã hội',
    receiver: 'UBND Huyện Bình Minh',
    receiverUnit: 'Văn phòng',
    date: '2026-03-16',
    receivedDate: '2026-03-17',
    status: 'received',
    priority: 'medium',
    security: 'normal',
    type: 'incoming',
    category: 'Đề xuất',
    field: 'Hành chính',
    pageCount: 7,
    createdBy: 'user-clerk-1',
    createdByName: 'Hoàng Thị Em',
    updatedAt: '2026-03-17T08:00:00',
    attachments: [
      { id: 'att-8', name: 'DeXuat_CSHT_NLD_2026.pdf', size: '1.5 MB', type: 'pdf', uploadedBy: 'Hoàng Thị Em', uploadedAt: '2026-03-17' },
    ],
    workflow: [
      { id: 'wf-21', action: 'Tiếp nhận văn bản', actorId: 'user-clerk-1', actorName: 'Hoàng Thị Em', actorRole: 'Văn thư', timestamp: '2026-03-17T08:00:00', comment: 'Tiếp nhận và đăng ký', status: 'completed' },
      { id: 'wf-22', action: 'Trình lãnh đạo phân công', actorId: 'user-clerk-1', actorName: 'Hoàng Thị Em', actorRole: 'Văn thư', timestamp: '', comment: '', status: 'current' },
    ],
    comments: [],
    relatedDocIds: [],
    year: 2026,
    bookNumber: 48,
    isLocked: false,
  },
];

// ==========================================
// OUTGOING DOCUMENTS
// ==========================================
export const outgoingDocs: EnhancedDocument[] = [
  {
    id: 'OUT-001',
    number: '345/CV-UBND',
    title: 'V/v phối hợp triển khai hệ thống e-Office trên địa bàn huyện',
    content: 'UBND huyện Bình Minh yêu cầu các đơn vị triển khai sử dụng hệ thống quản lý văn bản e-Office...',
    sender: 'UBND Huyện Bình Minh',
    senderUnit: 'Văn phòng UBND',
    receiver: 'Các phòng ban',
    receiverUnit: 'Toàn cơ quan',
    date: '2026-03-15',
    status: 'published',
    priority: 'high',
    security: 'normal',
    type: 'outgoing',
    category: 'Công văn',
    field: 'Công nghệ thông tin',
    pageCount: 3,
    createdBy: 'user-head-3',
    createdByName: 'Nguyễn Văn An',
    updatedAt: '2026-03-15T16:00:00',
    attachments: [
      { id: 'att-9', name: 'CV_345_UBND_eOffice.pdf', size: '1.8 MB', type: 'pdf', uploadedBy: 'Nguyễn Văn An', uploadedAt: '2026-03-14' },
      { id: 'att-10', name: 'HDSD_eOffice_v2.pdf', size: '5.2 MB', type: 'pdf', uploadedBy: 'Lê Minh Châu', uploadedAt: '2026-03-14' },
    ],
    workflow: [
      { id: 'wf-o1', action: 'Soạn thảo văn bản', actorId: 'user-head-3', actorName: 'Nguyễn Văn An', actorRole: 'Trưởng phòng CNTT', timestamp: '2026-03-13T09:00:00', comment: 'Soạn công văn triển khai e-Office', status: 'completed' },
      { id: 'wf-o2', action: 'Trình TP duyệt', actorId: 'user-head-1', actorName: 'Lê Thị Hương', actorRole: 'Chánh VP', timestamp: '2026-03-13T14:00:00', comment: 'Đồng ý nội dung, trình lãnh đạo ký', status: 'completed' },
      { id: 'wf-o3', action: 'Lãnh đạo phê duyệt', actorId: 'user-leader-1', actorName: 'Trần Văn Minh', actorRole: 'Chủ tịch UBND', timestamp: '2026-03-14T10:00:00', comment: 'Đồng ý. Ký ban hành.', status: 'completed' },
      { id: 'wf-o4', action: 'Phát hành', actorId: 'user-clerk-1', actorName: 'Hoàng Thị Em', actorRole: 'Văn thư', timestamp: '2026-03-15T08:00:00', comment: 'Cấp số, phát hành và gửi đến các phòng ban', status: 'completed' },
    ],
    comments: [
      { id: 'cmt-o1', userId: 'user-head-1', userName: 'Lê Thị Hương', userAvatar: 'LTH', content: 'Nội dung tốt, cần bổ sung thêm thời hạn triển khai cụ thể cho từng phòng ban.', timestamp: '2026-03-13T14:00:00' },
    ],
    relatedDocIds: ['INC-001'],
    year: 2026,
    bookNumber: 345,
    isLocked: true,
  },
  {
    id: 'OUT-002',
    number: '346/BC-UBND',
    title: 'Báo cáo kết quả công tác tháng 2/2026',
    content: 'UBND huyện Bình Minh báo cáo kết quả thực hiện nhiệm vụ tháng 2 năm 2026...',
    sender: 'UBND Huyện Bình Minh',
    senderUnit: 'Văn phòng UBND',
    receiver: 'UBND Tỉnh',
    receiverUnit: 'Văn phòng UBND Tỉnh',
    date: '2026-03-14',
    status: 'published',
    priority: 'medium',
    security: 'normal',
    type: 'outgoing',
    category: 'Báo cáo',
    field: 'Hành chính',
    pageCount: 15,
    createdBy: 'user-head-1',
    createdByName: 'Lê Thị Hương',
    updatedAt: '2026-03-14T16:00:00',
    attachments: [
      { id: 'att-11', name: 'BC_346_T2_2026.pdf', size: '3.2 MB', type: 'pdf', uploadedBy: 'Lê Thị Hương', uploadedAt: '2026-03-14' },
    ],
    workflow: [
      { id: 'wf-o5', action: 'Soạn thảo văn bản', actorId: 'user-head-1', actorName: 'Lê Thị Hương', actorRole: 'Chánh VP', timestamp: '2026-03-12T08:00:00', comment: '', status: 'completed' },
      { id: 'wf-o6', action: 'Lãnh đạo phê duyệt', actorId: 'user-leader-1', actorName: 'Trần Văn Minh', actorRole: 'Chủ tịch UBND', timestamp: '2026-03-13T15:00:00', comment: 'Duyệt. Ký ban hành.', status: 'completed' },
      { id: 'wf-o7', action: 'Phát hành', actorId: 'user-clerk-1', actorName: 'Hoàng Thị Em', actorRole: 'Văn thư', timestamp: '2026-03-14T08:30:00', comment: 'Phát hành và gửi UBND Tỉnh', status: 'completed' },
    ],
    comments: [],
    relatedDocIds: [],
    year: 2026,
    bookNumber: 346,
    isLocked: true,
  },
  {
    id: 'OUT-003',
    number: '',
    title: 'Kế hoạch đào tạo cán bộ, công chức quý II/2026',
    content: 'UBND huyện Bình Minh ban hành kế hoạch đào tạo, bồi dưỡng cán bộ, công chức quý II/2026...',
    sender: 'UBND Huyện Bình Minh',
    senderUnit: 'Phòng TC-HC',
    receiver: 'Sở Nội vụ',
    receiverUnit: 'Phòng Đào tạo',
    date: '2026-03-16',
    status: 'leader_review',
    priority: 'medium',
    security: 'normal',
    type: 'outgoing',
    category: 'Kế hoạch',
    field: 'Hành chính',
    pageCount: 8,
    createdBy: 'user-head-4',
    createdByName: 'Vũ Thanh Phong',
    updatedAt: '2026-03-16T14:00:00',
    attachments: [
      { id: 'att-12', name: 'KH_DaoTao_Q2_2026.docx', size: '2.1 MB', type: 'docx', uploadedBy: 'Vũ Thanh Phong', uploadedAt: '2026-03-15' },
    ],
    workflow: [
      { id: 'wf-o8', action: 'Soạn thảo văn bản', actorId: 'user-head-4', actorName: 'Vũ Thanh Phong', actorRole: 'Trưởng phòng TC-HC', timestamp: '2026-03-15T08:00:00', comment: 'Soạn KH đào tạo Q2/2026', status: 'completed' },
      { id: 'wf-o9', action: 'Trình TP duyệt', actorId: 'user-head-1', actorName: 'Lê Thị Hương', actorRole: 'Chánh VP', timestamp: '2026-03-15T16:00:00', comment: 'Đã xem xét, đồng ý nội dung', status: 'completed' },
      { id: 'wf-o10', action: 'Lãnh đạo phê duyệt', actorId: 'user-leader-1', actorName: 'Trần Văn Minh', actorRole: 'Chủ tịch UBND', timestamp: '', comment: '', status: 'current' },
      { id: 'wf-o11', action: 'Phát hành', actorId: 'user-clerk-1', actorName: 'Hoàng Thị Em', actorRole: 'Văn thư', timestamp: '', comment: '', status: 'pending' },
    ],
    comments: [],
    relatedDocIds: [],
    year: 2026,
    bookNumber: undefined,
    isLocked: false,
  },
  {
    id: 'OUT-004',
    number: '',
    title: 'Tờ trình đề xuất mua sắm trang thiết bị CNTT',
    content: 'Phòng CNTT đề xuất mua sắm bổ sung trang thiết bị phục vụ chuyển đổi số...',
    sender: 'UBND Huyện Bình Minh',
    senderUnit: 'Phòng CNTT',
    receiver: 'Lãnh đạo UBND',
    receiverUnit: '',
    date: '2026-03-16',
    status: 'dept_review',
    priority: 'medium',
    security: 'normal',
    type: 'outgoing',
    category: 'Tờ trình',
    field: 'Công nghệ thông tin',
    pageCount: 5,
    createdBy: 'user-specialist-2',
    createdByName: 'Lê Minh Châu',
    updatedAt: '2026-03-16T10:00:00',
    attachments: [
      { id: 'att-13', name: 'ToTrinh_MuaSam_CNTT.docx', size: '1.5 MB', type: 'docx', uploadedBy: 'Lê Minh Châu', uploadedAt: '2026-03-16' },
      { id: 'att-14', name: 'BaoGia_ThietBi_2026.xlsx', size: '450 KB', type: 'xlsx', uploadedBy: 'Lê Minh Châu', uploadedAt: '2026-03-16' },
    ],
    workflow: [
      { id: 'wf-o12', action: 'Soạn thảo văn bản', actorId: 'user-specialist-2', actorName: 'Lê Minh Châu', actorRole: 'Chuyên viên CNTT', timestamp: '2026-03-15T14:00:00', comment: 'Soạn tờ trình và bảng báo giá', status: 'completed' },
      { id: 'wf-o13', action: 'Trưởng phòng duyệt', actorId: 'user-head-3', actorName: 'Nguyễn Văn An', actorRole: 'Trưởng phòng CNTT', timestamp: '', comment: '', status: 'current' },
      { id: 'wf-o14', action: 'Lãnh đạo phê duyệt', actorId: 'user-leader-1', actorName: 'Trần Văn Minh', actorRole: 'Chủ tịch UBND', timestamp: '', comment: '', status: 'pending' },
      { id: 'wf-o15', action: 'Phát hành', actorId: 'user-clerk-1', actorName: 'Hoàng Thị Em', actorRole: 'Văn thư', timestamp: '', comment: '', status: 'pending' },
    ],
    comments: [],
    relatedDocIds: [],
    year: 2026,
    bookNumber: undefined,
    isLocked: false,
  },
  {
    id: 'OUT-005',
    number: '',
    title: 'Quyết định phân công nhiệm vụ quý II/2026',
    content: 'Quyết định phân công nhiệm vụ cho các phòng ban trong quý II/2026...',
    sender: 'UBND Huyện Bình Minh',
    senderUnit: 'Văn phòng UBND',
    receiver: 'Toàn cơ quan',
    receiverUnit: '',
    date: '2026-03-17',
    status: 'draft',
    priority: 'high',
    security: 'normal',
    type: 'outgoing',
    category: 'Quyết định',
    field: 'Hành chính',
    pageCount: 10,
    createdBy: 'user-head-1',
    createdByName: 'Lê Thị Hương',
    updatedAt: '2026-03-17T08:00:00',
    attachments: [],
    workflow: [
      { id: 'wf-o16', action: 'Soạn thảo văn bản', actorId: 'user-head-1', actorName: 'Lê Thị Hương', actorRole: 'Chánh VP', timestamp: '', comment: '', status: 'current' },
    ],
    comments: [],
    relatedDocIds: [],
    year: 2026,
    bookNumber: undefined,
    isLocked: false,
  },
];

// ==========================================
// INTERNAL DOCUMENTS
// ==========================================
export const internalDocs: EnhancedDocument[] = [
  {
    id: 'INT-001',
    number: 'NB-01/2026',
    title: 'Nội quy làm việc và chấm công năm 2026',
    content: 'Ban hành nội quy làm việc, quy định giờ giấc và chấm công cho toàn thể cán bộ, công chức...',
    sender: 'Phòng TC-HC',
    senderUnit: 'Phòng Tổ chức - Hành chính',
    receiver: 'Toàn cơ quan',
    receiverUnit: 'Tất cả phòng ban',
    date: '2026-03-15',
    status: 'distributed',
    priority: 'medium',
    security: 'normal',
    type: 'internal',
    category: 'Nội quy',
    field: 'Hành chính',
    pageCount: 12,
    createdBy: 'user-head-4',
    createdByName: 'Vũ Thanh Phong',
    updatedAt: '2026-03-15T14:00:00',
    attachments: [
      { id: 'att-15', name: 'NoiQuy_LamViec_2026.pdf', size: '2.5 MB', type: 'pdf', uploadedBy: 'Vũ Thanh Phong', uploadedAt: '2026-03-14' },
    ],
    workflow: [
      { id: 'wf-i1', action: 'Soạn thảo', actorId: 'user-head-4', actorName: 'Vũ Thanh Phong', actorRole: 'Trưởng phòng TC-HC', timestamp: '2026-03-13T08:00:00', comment: '', status: 'completed' },
      { id: 'wf-i2', action: 'Lãnh đạo duyệt', actorId: 'user-leader-1', actorName: 'Trần Văn Minh', actorRole: 'Chủ tịch UBND', timestamp: '2026-03-14T10:00:00', comment: 'Duyệt ban hành', status: 'completed' },
      { id: 'wf-i3', action: 'Phân phối', actorId: 'user-clerk-1', actorName: 'Hoàng Thị Em', actorRole: 'Văn thư', timestamp: '2026-03-15T08:00:00', comment: 'Đã phân phối đến toàn cơ quan', status: 'completed' },
    ],
    comments: [],
    relatedDocIds: [],
    year: 2026,
    bookNumber: 1,
    isLocked: true,
  },
  {
    id: 'INT-002',
    number: 'NB-02/2026',
    title: 'Kế hoạch tổ chức team building quý I/2026',
    content: 'Công đoàn lập kế hoạch tổ chức hoạt động team building nhằm gắn kết tập thể...',
    sender: 'Công đoàn',
    senderUnit: 'Ban Chấp hành Công đoàn',
    receiver: 'Toàn cơ quan',
    receiverUnit: 'Tất cả phòng ban',
    date: '2026-03-14',
    status: 'distributed',
    priority: 'low',
    security: 'normal',
    type: 'internal',
    category: 'Kế hoạch',
    field: 'Hành chính',
    pageCount: 4,
    createdBy: 'user-specialist-1',
    createdByName: 'Trần Thị Bình',
    updatedAt: '2026-03-14T10:00:00',
    attachments: [],
    workflow: [
      { id: 'wf-i4', action: 'Soạn thảo', actorId: 'user-specialist-1', actorName: 'Trần Thị Bình', actorRole: 'Chuyên viên', timestamp: '2026-03-12T08:00:00', comment: '', status: 'completed' },
      { id: 'wf-i5', action: 'Lãnh đạo duyệt', actorId: 'user-leader-1', actorName: 'Trần Văn Minh', actorRole: 'Chủ tịch', timestamp: '2026-03-13T09:00:00', comment: 'Đồng ý', status: 'completed' },
      { id: 'wf-i6', action: 'Phân phối', actorId: 'user-clerk-1', actorName: 'Hoàng Thị Em', actorRole: 'Văn thư', timestamp: '2026-03-14T08:00:00', comment: '', status: 'completed' },
    ],
    comments: [],
    relatedDocIds: [],
    year: 2026,
    bookNumber: 2,
    isLocked: true,
  },
  {
    id: 'INT-003',
    number: '',
    title: 'Hướng dẫn sử dụng hệ thống quản lý văn bản mới',
    content: 'Phòng CNTT hướng dẫn toàn thể cán bộ, công chức sử dụng hệ thống e-Office...',
    sender: 'Phòng CNTT',
    senderUnit: 'Phòng Công nghệ thông tin',
    receiver: 'Toàn cơ quan',
    receiverUnit: 'Tất cả phòng ban',
    date: '2026-03-16',
    status: 'review',
    priority: 'high',
    security: 'normal',
    type: 'internal',
    category: 'Hướng dẫn',
    field: 'Công nghệ thông tin',
    pageCount: 20,
    createdBy: 'user-specialist-2',
    createdByName: 'Lê Minh Châu',
    updatedAt: '2026-03-16T14:00:00',
    attachments: [
      { id: 'att-16', name: 'HDSD_eOffice_DayDu.pdf', size: '8.5 MB', type: 'pdf', uploadedBy: 'Lê Minh Châu', uploadedAt: '2026-03-16' },
    ],
    workflow: [
      { id: 'wf-i7', action: 'Soạn thảo', actorId: 'user-specialist-2', actorName: 'Lê Minh Châu', actorRole: 'Chuyên viên CNTT', timestamp: '2026-03-14T08:00:00', comment: '', status: 'completed' },
      { id: 'wf-i8', action: 'Trưởng phòng duyệt', actorId: 'user-head-3', actorName: 'Nguyễn Văn An', actorRole: 'Trưởng phòng CNTT', timestamp: '2026-03-15T10:00:00', comment: 'Đã xem xét, trình lãnh đạo', status: 'completed' },
      { id: 'wf-i9', action: 'Lãnh đạo duyệt', actorId: 'user-leader-1', actorName: 'Trần Văn Minh', actorRole: 'Chủ tịch', timestamp: '', comment: '', status: 'current' },
      { id: 'wf-i10', action: 'Phân phối', actorId: 'user-clerk-1', actorName: 'Hoàng Thị Em', actorRole: 'Văn thư', timestamp: '', comment: '', status: 'pending' },
    ],
    comments: [],
    relatedDocIds: [],
    year: 2026,
    bookNumber: undefined,
    isLocked: false,
  },
  {
    id: 'INT-004',
    number: '',
    title: 'Thông báo lịch nghỉ lễ 30/4 - 1/5 năm 2026',
    content: 'Phòng Hành chính thông báo lịch nghỉ lễ Giải phóng miền Nam 30/4 và Quốc tế lao động 1/5...',
    sender: 'Phòng TC-HC',
    senderUnit: 'Phòng Tổ chức - Hành chính',
    receiver: 'Toàn cơ quan',
    receiverUnit: 'Tất cả phòng ban',
    date: '2026-03-17',
    status: 'draft',
    priority: 'low',
    security: 'normal',
    type: 'internal',
    category: 'Thông báo',
    field: 'Hành chính',
    pageCount: 1,
    createdBy: 'user-head-4',
    createdByName: 'Vũ Thanh Phong',
    updatedAt: '2026-03-17T09:00:00',
    attachments: [],
    workflow: [
      { id: 'wf-i11', action: 'Soạn thảo', actorId: 'user-head-4', actorName: 'Vũ Thanh Phong', actorRole: 'Trưởng phòng TC-HC', timestamp: '', comment: '', status: 'current' },
    ],
    comments: [],
    relatedDocIds: [],
    year: 2026,
    bookNumber: undefined,
    isLocked: false,
  },
];

// ==========================================
// HELPERS
// ==========================================
export const priorityLabels: Record<DocPriority, { label: string; color: string; bg: string }> = {
  urgent_top: { label: 'Hỏa tốc', color: 'text-red-700', bg: 'bg-red-100' },
  urgent: { label: 'Khẩn', color: 'text-orange-700', bg: 'bg-orange-100' },
  high: { label: 'Cao', color: 'text-red-600', bg: 'bg-red-50' },
  medium: { label: 'Trung bình', color: 'text-amber-600', bg: 'bg-amber-50' },
  low: { label: 'Thấp', color: 'text-gray-500', bg: 'bg-gray-100' },
};

export const securityLabels: Record<DocSecurity, { label: string; color: string; bg: string }> = {
  normal: { label: 'Thường', color: 'text-gray-600', bg: 'bg-gray-100' },
  confidential: { label: 'Mật', color: 'text-amber-700', bg: 'bg-amber-50' },
  secret: { label: 'Tối mật', color: 'text-red-700', bg: 'bg-red-100' },
  top_secret: { label: 'Tuyệt mật', color: 'text-red-800', bg: 'bg-red-200' },
};

export const incomingStatusLabels: Record<IncomingStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending_receive: { label: 'Chờ tiếp nhận', color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' },
  received: { label: 'Đã tiếp nhận', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  assigned: { label: 'Đã phân công', color: 'text-indigo-700', bg: 'bg-indigo-50', dot: 'bg-indigo-500' },
  processing: { label: 'Đang xử lý', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  completed: { label: 'Hoàn thành', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  overdue: { label: 'Quá hạn', color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500' },
  returned: { label: 'Trả lại', color: 'text-orange-700', bg: 'bg-orange-50', dot: 'bg-orange-500' },
};

export const outgoingStatusLabels: Record<OutgoingStatus, { label: string; color: string; bg: string; dot: string }> = {
  draft: { label: 'Bản nháp', color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' },
  dept_review: { label: 'TP xem xét', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  leader_review: { label: 'LĐ xem xét', color: 'text-violet-700', bg: 'bg-violet-50', dot: 'bg-violet-500' },
  approved: { label: 'Đã duyệt', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  published: { label: 'Đã phát hành', color: 'text-emerald-800', bg: 'bg-emerald-100', dot: 'bg-emerald-600' },
  rejected: { label: 'Từ chối', color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500' },
};

export const internalStatusLabels: Record<InternalStatus, { label: string; color: string; bg: string; dot: string }> = {
  draft: { label: 'Bản nháp', color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' },
  review: { label: 'Chờ duyệt', color: 'text-violet-700', bg: 'bg-violet-50', dot: 'bg-violet-500' },
  approved: { label: 'Đã duyệt', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  distributed: { label: 'Đã phân phối', color: 'text-emerald-800', bg: 'bg-emerald-100', dot: 'bg-emerald-600' },
  rejected: { label: 'Từ chối', color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500' },
};

export function getStatusConfig(doc: EnhancedDocument) {
  if (doc.type === 'incoming') return incomingStatusLabels[doc.status as IncomingStatus];
  if (doc.type === 'outgoing') return outgoingStatusLabels[doc.status as OutgoingStatus];
  return internalStatusLabels[doc.status as InternalStatus];
}

export function getNextBookNumber(docs: EnhancedDocument[], year: number): number {
  const yearDocs = docs.filter((d) => d.year === year && d.bookNumber);
  if (yearDocs.length === 0) return 1;
  return Math.max(...yearDocs.map((d) => d.bookNumber!)) + 1;
}

export function isDocNumberUnique(number: string, year: number, docs: EnhancedDocument[], excludeId?: string): boolean {
  return !docs.some((d) => d.number === number && d.year === year && d.id !== excludeId && d.number !== '');
}
