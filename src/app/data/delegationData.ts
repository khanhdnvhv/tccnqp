// ============================================================
// QUẢN LÝ ĐOÀN VÀO LÀM VIỆC — Mock Data
// ============================================================

export type DelegationStatus = 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
export type ApprovalDocStatus = 'none' | 'pending' | 'received';
export type DelegationPriority = 'normal' | 'high' | 'directive';

export const delegationStatusLabels: Record<DelegationStatus, string> = {
  draft: 'Nháp',
  pending_approval: 'Chờ duyệt',
  approved: 'Đã duyệt',
  in_progress: 'Đang làm việc',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy',
};

export const delegationStatusColors: Record<DelegationStatus, { bg: string; text: string; dot: string; calendar: string }> = {
  draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400', calendar: '#9ca3af' },
  pending_approval: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', calendar: '#f59e0b' },
  approved: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', calendar: '#10b981' },
  in_progress: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', calendar: '#3b82f6' },
  completed: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400', calendar: '#6b7280' },
  cancelled: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500', calendar: '#ef4444' },
};

export const priorityLabels: Record<DelegationPriority, string> = {
  normal: 'Bình thường',
  high: 'Ưu tiên',
  directive: 'Thủ trưởng chỉ đạo',
};

export const priorityColors: Record<DelegationPriority, { bg: string; text: string }> = {
  normal: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  directive: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};

export interface DelegationMember {
  id: string;
  fullName: string;
  position: string;
  idNumber: string;
  organization: string;
  phone?: string;
  isLeader: boolean;
}

export interface DelegationGift {
  id: string;
  description: string;
  quantity: number;
  estimatedValue?: number;
  fromPartner: boolean;
  note?: string;
}

export interface Delegation {
  id: string;
  code: string;
  title: string;
  partnerId: string;
  partnerName: string;
  purpose: string;
  scheduledDate: string;
  scheduledEndDate: string;
  actualDate?: string;
  status: DelegationStatus;
  priority: DelegationPriority;
  approvalDocStatus: ApprovalDocStatus;
  approvalDocNumber?: string;
  hostName: string;
  hostUnit: string;
  meetingRoom?: string;
  members: DelegationMember[];
  gifts: DelegationGift[];
  result?: string;
  note?: string;
  createdBy: string;
  createdAt: string;
}

export const delegations: Delegation[] = [
  {
    id: 'del-001',
    code: 'DV-2026/03-001',
    title: 'Đoàn Viettel - Nghiệm thu dự án nâng cấp mạng Phase 2',
    partnerId: 'p-001',
    partnerName: 'Viettel',
    purpose: 'Nghiệm thu và bàn giao hệ thống mạng nâng cấp giai đoạn 2',
    scheduledDate: '2026-04-05',
    scheduledEndDate: '2026-04-05',
    status: 'approved',
    priority: 'high',
    approvalDocStatus: 'received',
    approvalDocNumber: 'CV-2026/TCCNQP/245',
    hostName: 'Đại tá Nguyễn Văn Hùng',
    hostUnit: 'Phòng QHQT',
    meetingRoom: 'Phòng họp A1',
    members: [
      { id: 'm-001-1', fullName: 'Nguyễn Minh Tuấn', position: 'Giám đốc Dự án', idNumber: '001082012345', organization: 'Viettel Solutions', isLeader: true },
      { id: 'm-001-2', fullName: 'Trần Thị Hương', position: 'Kỹ sư trưởng', idNumber: '001092023456', organization: 'Viettel Solutions', isLeader: false },
      { id: 'm-001-3', fullName: 'Lê Văn Đức', position: 'Chuyên viên kỹ thuật', idNumber: '036089034567', organization: 'Viettel Networks', isLeader: false },
      { id: 'm-001-4', fullName: 'Phạm Hoàng Nam', position: 'Kỹ sư hệ thống', idNumber: '001095045678', organization: 'Viettel Networks', isLeader: false },
    ],
    gifts: [
      { id: 'g-001-1', description: 'Bộ thiết bị demo Router QN-1000', quantity: 1, estimatedValue: 15, fromPartner: true, note: 'Mẫu demo để đánh giá' },
    ],
    result: '',
    note: 'Cần chuẩn bị phòng họp có máy chiếu và mạng LAN test',
    createdBy: 'Thiếu tá Lê Minh Đức',
    createdAt: '2026-03-28T08:00:00Z',
  },
  {
    id: 'del-002',
    code: 'DV-2026/03-002',
    title: 'Đoàn Hanwha Aerospace - Đàm phán chuyển giao công nghệ K9',
    partnerId: 'p-007',
    partnerName: 'Hanwha Aerospace',
    purpose: 'Thảo luận chi tiết điều khoản chuyển giao công nghệ pháo tự hành K9A1',
    scheduledDate: '2026-04-10',
    scheduledEndDate: '2026-04-12',
    status: 'pending_approval',
    priority: 'directive',
    approvalDocStatus: 'pending',
    hostName: 'Thiếu tướng Trần Quốc Bảo',
    hostUnit: 'Ban Giám đốc',
    meetingRoom: 'Phòng họp Quốc tế',
    members: [
      { id: 'm-002-1', fullName: 'Son Jae-il', position: 'VP International Defense', idNumber: 'M12345678', organization: 'Hanwha Aerospace', isLeader: true },
      { id: 'm-002-2', fullName: 'Kim Min-ho', position: 'Chief Engineer', idNumber: 'M23456789', organization: 'Hanwha Aerospace', isLeader: false },
      { id: 'm-002-3', fullName: 'Park Sung-jin', position: 'Commercial Manager', idNumber: 'M34567890', organization: 'Hanwha Aerospace', isLeader: false },
      { id: 'm-002-4', fullName: 'Nguyễn Thành Vinh', position: 'Phiên dịch', idNumber: '001088056789', organization: 'Bộ Ngoại giao', isLeader: false },
      { id: 'm-002-5', fullName: 'Lee Joon-hyuk', position: 'Technical Specialist', idNumber: 'M45678901', organization: 'Hanwha Defense', isLeader: false },
    ],
    gifts: [],
    note: 'Đoàn do Thủ trưởng chỉ đạo trực tiếp - miễn yêu cầu văn bản đồng ý thông thường',
    createdBy: 'Đại tá Nguyễn Văn Hùng',
    createdAt: '2026-03-25T10:00:00Z',
  },
  {
    id: 'del-003',
    code: 'DV-2026/03-003',
    title: 'Đoàn GADEF - Kiểm tra tiến độ dây chuyền sản xuất',
    partnerId: 'p-002',
    partnerName: 'GADEF',
    purpose: 'Kiểm tra tiến độ lắp đặt dây chuyền CNC-5000 và hệ thống QC tự động',
    scheduledDate: '2026-04-08',
    scheduledEndDate: '2026-04-08',
    status: 'approved',
    priority: 'normal',
    approvalDocStatus: 'received',
    approvalDocNumber: 'CV-2026/TCCNQP/251',
    hostName: 'Thượng tá Phạm Văn Thắng',
    hostUnit: 'Phòng Kỹ thuật',
    meetingRoom: 'Phòng họp B2',
    members: [
      { id: 'm-003-1', fullName: 'Nguyễn Đình Khoa', position: 'Phó Giám đốc Kỹ thuật', idNumber: '001078067890', organization: 'GADEF', isLeader: true },
      { id: 'm-003-2', fullName: 'Vũ Thị Lan', position: 'Quản lý Dự án', idNumber: '001085078901', organization: 'GADEF', isLeader: false },
      { id: 'm-003-3', fullName: 'Hoàng Minh Quang', position: 'Kỹ sư CNC', idNumber: '036091089012', organization: 'GADEF', isLeader: false },
    ],
    gifts: [
      { id: 'g-003-1', description: 'Bộ tài liệu kỹ thuật CNC-5000', quantity: 3, fromPartner: true },
    ],
    result: '',
    createdBy: 'Thiếu tá Lê Minh Đức',
    createdAt: '2026-03-30T14:00:00Z',
  },
  {
    id: 'del-004',
    code: 'DV-2026/02-015',
    title: 'Đoàn DSDC - Demo hệ thống VMS phiên bản chính thức',
    partnerId: 'p-004',
    partnerName: 'DSDC',
    purpose: 'Trình diễn và nghiệm thu hệ thống quản lý đối tác VMS 2.0 phiên bản chính thức',
    scheduledDate: '2026-03-28',
    scheduledEndDate: '2026-03-28',
    status: 'completed',
    priority: 'normal',
    approvalDocStatus: 'received',
    approvalDocNumber: 'CV-2026/TCCNQP/238',
    hostName: 'Thiếu tá Lê Minh Đức',
    hostUnit: 'Phòng QHQT',
    meetingRoom: 'Phòng họp A2',
    members: [
      { id: 'm-004-1', fullName: 'Nguyễn Thanh Tùng', position: 'Giám đốc Điều hành', idNumber: '001088090123', organization: 'DSDC', isLeader: true },
      { id: 'm-004-2', fullName: 'Trần Quốc Anh', position: 'Tech Lead', idNumber: '001092101234', organization: 'DSDC', isLeader: false },
    ],
    gifts: [],
    result: 'Nghiệm thu thành công - Hệ thống đạt yêu cầu, bắt đầu triển khai chính thức từ 01/04/2026',
    createdBy: 'Thiếu tá Lê Minh Đức',
    createdAt: '2026-03-20T09:00:00Z',
  },
  {
    id: 'del-005',
    code: 'DV-2026/04-001',
    title: 'Đoàn Rosoboronexport - Đàm phán kỹ thuật hệ thống S-300',
    partnerId: 'p-003',
    partnerName: 'Rosoboronexport',
    purpose: 'Đàm phán kỹ thuật giai đoạn 3 của hợp đồng S-300PMU2 và lịch giao hàng 2026',
    scheduledDate: '2026-04-15',
    scheduledEndDate: '2026-04-18',
    status: 'draft',
    priority: 'directive',
    approvalDocStatus: 'none',
    hostName: 'Thiếu tướng Trần Quốc Bảo',
    hostUnit: 'Ban Giám đốc',
    members: [
      { id: 'm-005-1', fullName: 'Alexei Petrov', position: 'Deputy Director', idNumber: 'R12345678', organization: 'Rosoboronexport', isLeader: true },
      { id: 'm-005-2', fullName: 'Dmitry Volkov', position: 'Chief Technical Officer', idNumber: 'R23456789', organization: 'Rosoboronexport', isLeader: false },
      { id: 'm-005-3', fullName: 'Sergei Ivanov', position: 'Logistics Manager', idNumber: 'R34567890', organization: 'Rosoboronexport', isLeader: false },
    ],
    gifts: [],
    note: 'Đoàn cấp chiến lược quốc gia - do Thủ trưởng chỉ đạo trực tiếp',
    createdBy: 'Đại tá Nguyễn Văn Hùng',
    createdAt: '2026-04-01T08:00:00Z',
  },
];

export function getDelegationStats() {
  const total = delegations.length;
  const pending = delegations.filter((d) => d.status === 'pending_approval').length;
  const approved = delegations.filter((d) => d.status === 'approved').length;
  const inProgress = delegations.filter((d) => d.status === 'in_progress').length;
  const missingDoc = delegations.filter(
    (d) => d.approvalDocStatus === 'none' && d.priority !== 'directive' && !['completed', 'cancelled'].includes(d.status)
  ).length;

  const upcomingNoDocs = delegations.filter((d) => {
    if (d.priority === 'directive') return false;
    if (['completed', 'cancelled'].includes(d.status)) return false;
    if (d.approvalDocStatus === 'received') return false;
    const scheduled = new Date(d.scheduledDate);
    const now = new Date();
    const diffDays = Math.ceil((scheduled.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  });

  return { total, pending, approved, inProgress, missingDoc, upcomingNoDocs };
}
