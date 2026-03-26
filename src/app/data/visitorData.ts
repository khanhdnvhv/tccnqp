// ============================================================
// HỆ THỐNG QUẢN LÝ ĐỐI TÁC VÀO LÀM VIỆC — Mock Data
// ============================================================

export type VisitorStatus = 'waiting' | 'inside' | 'completed' | 'cancelled' | 'overstay';
export type VisitorType = 'contractor' | 'partner' | 'supplier' | 'government' | 'personal' | 'maintenance';
export type AppointmentStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
export type BadgeStatus = 'active' | 'expired' | 'lost' | 'suspended';
export type VehicleStatus = 'inside' | 'outside' | 'overstay';
export type BadgeType = 'day' | 'monthly' | 'project' | 'permanent';
export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'other';

// ---- Labels & Colors ----

export const visitorTypeLabels: Record<VisitorType, string> = {
  contractor: 'Nhà thầu',
  partner: 'Đối tác',
  supplier: 'Nhà cung cấp',
  government: 'Cơ quan NN',
  personal: 'Cá nhân',
  maintenance: 'Bảo trì',
};

export const visitorTypeColors: Record<VisitorType, { bg: string; text: string }> = {
  contractor: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  partner: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-400' },
  supplier: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  government: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  personal: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
  maintenance: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
};

export const visitorStatusLabels: Record<VisitorStatus, string> = {
  waiting: 'Chờ vào',
  inside: 'Đang trong',
  completed: 'Đã ra',
  cancelled: 'Đã hủy',
  overstay: 'Quá giờ',
};

export const visitorStatusColors: Record<VisitorStatus, { bg: string; text: string; dot: string }> = {
  waiting: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  inside: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  completed: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
  cancelled: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  overstay: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-600' },
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export const appointmentStatusColors: Record<AppointmentStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  approved: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  rejected: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  completed: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
  cancelled: { bg: 'bg-gray-50 dark:bg-gray-900/40', text: 'text-gray-400 dark:text-gray-500', dot: 'bg-gray-300' },
};

export const badgeStatusLabels: Record<BadgeStatus, string> = {
  active: 'Hiệu lực',
  expired: 'Hết hạn',
  lost: 'Báo mất',
  suspended: 'Tạm khóa',
};

export const badgeStatusColors: Record<BadgeStatus, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  expired: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
  lost: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  suspended: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
};

export const badgeTypeLabels: Record<BadgeType, string> = {
  day: 'Ngày',
  monthly: 'Tháng',
  project: 'Dự án',
  permanent: 'Lâu dài',
};

export const vehicleStatusLabels: Record<VehicleStatus, string> = {
  inside: 'Trong khu vực',
  outside: 'Đã ra',
  overstay: 'Quá giờ',
};

export const vehicleStatusColors: Record<VehicleStatus, { bg: string; text: string; dot: string }> = {
  inside: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  outside: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
  overstay: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-600' },
};

export const vehicleTypeLabels: Record<VehicleType, string> = {
  car: 'Ô tô',
  motorcycle: 'Xe máy',
  truck: 'Xe tải',
  other: 'Khác',
};

// ---- Data Interfaces ----

export interface Visitor {
  id: string;
  fullName: string;
  idNumber: string;
  organization: string;
  phone: string;
  purpose: string;
  hostName: string;
  hostUnit: string;
  checkIn: string;
  checkOut?: string;
  status: VisitorStatus;
  type: VisitorType;
  badgeCode?: string;
  vehiclePlate?: string;
  note?: string;
  approvedBy: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  visitorName: string;
  visitorOrg: string;
  visitorIdNumber: string;
  visitorPhone: string;
  purpose: string;
  hostName: string;
  hostUnit: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: AppointmentStatus;
  vehicleRequired: boolean;
  vehiclePlate?: string;
  note?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  code: string;
  visitorName: string;
  organization: string;
  issuedDate: string;
  expiryDate: string;
  status: BadgeStatus;
  type: BadgeType;
  issuedBy: string;
  zones: string[];
}

export interface Vehicle {
  id: string;
  plate: string;
  type: VehicleType;
  model: string;
  color: string;
  ownerName: string;
  ownerOrg: string;
  checkIn: string;
  checkOut?: string;
  status: VehicleStatus;
  purpose: string;
  parkingSlot?: string;
}

export interface EntryLog {
  id: string;
  timestamp: string;
  event: 'in' | 'out';
  fullName: string;
  idNumber: string;
  organization: string;
  gate: string;
  officer: string;
  note?: string;
  type: VisitorType;
}

// ---- Mock Visitors ----

export const visitors: Visitor[] = [
  {
    id: 'v-001', fullName: 'Nguyễn Văn Hùng', idNumber: '026091234567',
    organization: 'Công ty TNHH Xây dựng Hoàng Gia', phone: '0912345678',
    purpose: 'Kiểm tra tiến độ thi công hạng mục A3', hostName: 'Đại tá Trần Minh Tuấn',
    hostUnit: 'Phòng Hậu cần', checkIn: '2026-03-26T08:15:00',
    status: 'inside', type: 'contractor', badgeCode: 'TD-2026-0234',
    vehiclePlate: '51G-12345', approvedBy: 'Thượng úy Lê Văn Bình',
    createdAt: '2026-03-26T07:55:00',
  },
  {
    id: 'v-002', fullName: 'Trần Thị Lan Anh', idNumber: '001299876543',
    organization: 'Tập đoàn Viễn thông Quân đội', phone: '0987654321',
    purpose: 'Bảo trì hệ thống viễn thông', hostName: 'Thiếu tá Phạm Đức Thành',
    hostUnit: 'Phòng Thông tin', checkIn: '2026-03-26T09:00:00',
    status: 'inside', type: 'maintenance', badgeCode: 'BT-2026-0112',
    approvedBy: 'Đại úy Nguyễn Quang Hải', createdAt: '2026-03-26T08:30:00',
  },
  {
    id: 'v-003', fullName: 'Lê Văn Tùng', idNumber: '079082345678',
    organization: 'Văn phòng UBND Thành phố', phone: '0934567890',
    purpose: 'Làm việc về thủ tục đất quốc phòng', hostName: 'Đại tá Nguyễn Văn Minh',
    hostUnit: 'Ban Tham mưu', checkIn: '2026-03-26T09:30:00',
    status: 'inside', type: 'government', badgeCode: 'CQ-2026-0089',
    approvedBy: 'Trung tá Hoàng Văn Dũng', createdAt: '2026-03-26T09:00:00',
  },
  {
    id: 'v-004', fullName: 'Phạm Thị Thu Hương', idNumber: '038198765432',
    organization: 'Công ty CP Thực phẩm Sao Mai', phone: '0901234567',
    purpose: 'Giao thực phẩm theo đơn đặt hàng #SM-034', hostName: 'Thượng sĩ Bùi Văn Nam',
    hostUnit: 'Nhà bếp', checkIn: '2026-03-26T07:00:00', checkOut: '2026-03-26T07:45:00',
    status: 'completed', type: 'supplier', vehiclePlate: '29H-98765',
    approvedBy: 'Hạ sĩ quan trực ban', createdAt: '2026-03-25T16:00:00',
  },
  {
    id: 'v-005', fullName: 'Hoàng Đức Mạnh', idNumber: '001284567890',
    organization: 'Công ty TNHH Bảo An', phone: '0956789012',
    purpose: 'Kiểm tra hệ thống PCCC tòa nhà B', hostName: 'Thượng úy Vũ Minh Hiệu',
    hostUnit: 'Phòng An toàn', checkIn: '2026-03-26T08:00:00',
    status: 'overstay', type: 'maintenance', badgeCode: 'BT-2026-0098',
    approvedBy: 'Đại úy Trịnh Văn Long', createdAt: '2026-03-26T07:30:00',
    note: 'Dự kiến ra 10:00, đã quá giờ',
  },
  {
    id: 'v-006', fullName: 'Ngô Thị Bích Ngọc', idNumber: '080294321098',
    organization: 'Đại học Bách Khoa Hà Nội', phone: '0978901234',
    purpose: 'Nghiên cứu khoa học — Đề tài hợp tác quốc phòng', hostName: 'Trung tá Đinh Quốc Bảo',
    hostUnit: 'Viện Nghiên cứu', checkIn: '2026-03-26T10:00:00',
    status: 'waiting', type: 'partner',
    approvedBy: 'Thiếu tướng Lê Xuân Tùng', createdAt: '2026-03-26T09:45:00',
  },
  {
    id: 'v-007', fullName: 'Vũ Công Danh', idNumber: '036087654321',
    organization: 'Tập đoàn Xăng dầu Quân đội', phone: '0923456789',
    purpose: 'Cung cấp nhiên liệu định kỳ', hostName: 'Trung sĩ Đặng Văn Hải',
    hostUnit: 'Kho nhiên liệu', checkIn: '2026-03-25T14:00:00', checkOut: '2026-03-25T15:30:00',
    status: 'completed', type: 'supplier', vehiclePlate: '29C-54321',
    approvedBy: 'Sĩ quan trực ban', createdAt: '2026-03-25T13:00:00',
  },
  {
    id: 'v-008', fullName: 'Đinh Thị Hoa', idNumber: '025196543210',
    organization: 'Bộ Tài chính', phone: '0945678901',
    purpose: 'Kiểm toán ngân sách quốc phòng Q1/2026', hostName: 'Thượng tá Phạm Văn Hải',
    hostUnit: 'Phòng Tài chính', checkIn: '2026-03-26T08:00:00',
    status: 'inside', type: 'government', badgeCode: 'CQ-2026-0091',
    approvedBy: 'Đại tá Lê Văn Định', createdAt: '2026-03-25T17:00:00',
  },
  {
    id: 'v-009', fullName: 'Cao Minh Đức', idNumber: '034091122334',
    organization: 'Công ty TNHH Kỹ thuật ABC', phone: '0967889900',
    purpose: 'Lắp đặt thiết bị điện tử phòng họp', hostName: 'Đại úy Hồ Văn Kiên',
    hostUnit: 'Phòng Kỹ thuật', checkIn: '2026-03-26T07:30:00',
    status: 'inside', type: 'contractor', badgeCode: 'TD-2026-0241',
    approvedBy: 'Thiếu tá Nguyễn Duy Thắng', createdAt: '2026-03-26T07:00:00',
  },
  {
    id: 'v-010', fullName: 'Lưu Thị Thanh', idNumber: '079299112233',
    organization: 'Văn phòng Quốc hội', phone: '0901112233',
    purpose: 'Kiểm tra thực địa phục vụ báo cáo Quốc hội', hostName: 'Thiếu tướng Trần Đức Lai',
    hostUnit: 'Bộ Chỉ huy', checkIn: '2026-03-26T09:00:00', checkOut: '2026-03-26T11:30:00',
    status: 'completed', type: 'government', badgeCode: 'CQ-2026-0078',
    approvedBy: 'Trung tướng Nguyễn Văn Hòa', createdAt: '2026-03-25T14:00:00',
  },
];

// ---- Mock Appointments ----

export const appointments: Appointment[] = [
  {
    id: 'apt-001', visitorName: 'Phùng Văn Đạt', visitorOrg: 'Bộ Công an',
    visitorIdNumber: '038089876543', visitorPhone: '0912000111',
    purpose: 'Hội đàm phối hợp công tác an ninh Q2/2026',
    hostName: 'Thiếu tướng Nguyễn Văn Sơn', hostUnit: 'Ban Chỉ huy',
    scheduledDate: '2026-03-27', scheduledTime: '09:00', duration: 120,
    status: 'approved', vehicleRequired: true, vehiclePlate: '80A-12345',
    approvedBy: 'Trung tướng Trần Quốc Hùng', createdAt: '2026-03-25T10:00:00',
  },
  {
    id: 'apt-002', visitorName: 'Trương Văn Lộc', visitorOrg: 'Công ty CP Quốc Hùng',
    visitorIdNumber: '079091234567', visitorPhone: '0987001122',
    purpose: 'Ký kết hợp đồng cung ứng vật tư năm 2026',
    hostName: 'Thượng tá Nguyễn Bá Lộc', hostUnit: 'Phòng Hậu cần',
    scheduledDate: '2026-03-27', scheduledTime: '14:00', duration: 90,
    status: 'pending', vehicleRequired: false,
    createdAt: '2026-03-26T08:00:00',
  },
  {
    id: 'apt-003', visitorName: 'Nguyễn Hải Đăng', visitorOrg: 'Viện Vật lý Quân sự',
    visitorIdNumber: '001099543210', visitorPhone: '0934001234',
    purpose: 'Hội thảo khoa học về công nghệ quốc phòng',
    hostName: 'Đại tá Lưu Quốc Dũng', hostUnit: 'Viện Nghiên cứu',
    scheduledDate: '2026-03-28', scheduledTime: '08:30', duration: 240,
    status: 'approved', vehicleRequired: true, vehiclePlate: '80B-67890',
    approvedBy: 'Thiếu tướng Bùi Văn Nam', createdAt: '2026-03-24T14:00:00',
  },
  {
    id: 'apt-004', visitorName: 'Jean-Pierre Martin', visitorOrg: 'Đại sứ quán Pháp',
    visitorIdNumber: 'P123456789', visitorPhone: '+33 1 23456789',
    purpose: 'Trao đổi hợp tác quốc phòng song phương',
    hostName: 'Thiếu tướng Trần Đức Lai', hostUnit: 'Cục Đối ngoại',
    scheduledDate: '2026-03-28', scheduledTime: '10:00', duration: 180,
    status: 'approved', vehicleRequired: true, vehiclePlate: 'CD-47-123',
    approvedBy: 'Trung tướng Lê Hải Bình', createdAt: '2026-03-20T09:00:00',
  },
  {
    id: 'apt-005', visitorName: 'Hoàng Thị Thu', visitorOrg: 'ĐHQG TP.HCM',
    visitorIdNumber: '079299345678', visitorPhone: '0901002233',
    purpose: 'Ký biên bản ghi nhớ hợp tác đào tạo',
    hostName: 'Đại tá Đặng Văn Toàn', hostUnit: 'Phòng GD - Đào tạo',
    scheduledDate: '2026-03-26', scheduledTime: '15:00', duration: 60,
    status: 'pending', vehicleRequired: false,
    createdAt: '2026-03-26T10:00:00',
  },
  {
    id: 'apt-006', visitorName: 'Bùi Văn Thanh', visitorOrg: 'Tổng cục Hải quan',
    visitorIdNumber: '038088901234', visitorPhone: '0956003344',
    purpose: 'Kiểm tra hàng hóa nhập khẩu kho đặc biệt',
    hostName: 'Thượng tá Vũ Đình Tuấn', hostUnit: 'Kho Tổng hợp',
    scheduledDate: '2026-03-29', scheduledTime: '08:00', duration: 180,
    status: 'pending', vehicleRequired: true,
    createdAt: '2026-03-26T09:00:00',
  },
  {
    id: 'apt-007', visitorName: 'Phan Thị Minh Châu', visitorOrg: 'Tổng công ty QDND',
    visitorIdNumber: '001293456789', visitorPhone: '0912334455',
    purpose: 'Báo cáo tiến độ dự án đầu tư',
    hostName: 'Đại tá Nguyễn Trọng Nghĩa', hostUnit: 'Phòng Đầu tư',
    scheduledDate: '2026-03-25', scheduledTime: '09:00', duration: 90,
    status: 'completed', vehicleRequired: false,
    approvedBy: 'Thiếu tướng Lê Xuân Dũng', createdAt: '2026-03-20T10:00:00',
  },
  {
    id: 'apt-008', visitorName: 'Ngô Văn Chiến', visitorOrg: 'Công ty Quang Minh',
    visitorIdNumber: '027094512345', visitorPhone: '0945556677',
    purpose: 'Đề xuất hợp đồng sửa chữa thiết bị',
    hostName: 'Thiếu tá Phan Văn Lộc', hostUnit: 'Phòng Kỹ thuật',
    scheduledDate: '2026-03-25', scheduledTime: '14:30', duration: 60,
    status: 'rejected', vehicleRequired: false,
    approvedBy: 'Trung tá Đỗ Văn Hùng', createdAt: '2026-03-24T08:00:00',
  },
];

// ---- Mock Badges ----

export const badges: Badge[] = [
  { id: 'b-001', code: 'TD-2026-0234', visitorName: 'Nguyễn Văn Hùng', organization: 'CT Xây dựng Hoàng Gia', issuedDate: '2026-03-26', expiryDate: '2026-03-26', status: 'active', type: 'day', issuedBy: 'Thượng úy Lê Văn Bình', zones: ['Khu A3', 'Đường nội bộ'] },
  { id: 'b-002', code: 'BT-2026-0112', visitorName: 'Trần Thị Lan Anh', organization: 'Viettel QĐ', issuedDate: '2026-03-26', expiryDate: '2026-03-26', status: 'active', type: 'day', issuedBy: 'Đại úy Nguyễn Quang Hải', zones: ['Phòng máy chủ', 'Trạm thu phát'] },
  { id: 'b-003', code: 'CQ-2026-0089', visitorName: 'Lê Văn Tùng', organization: 'UBND TP', issuedDate: '2026-03-26', expiryDate: '2026-03-26', status: 'active', type: 'day', issuedBy: 'Trung tá Hoàng Văn Dũng', zones: ['Phòng họp A', 'Hành lang chính'] },
  { id: 'b-004', code: 'DA-2026-0045', visitorName: 'Phạm Văn Khánh', organization: 'Ban QLDA QP', issuedDate: '2026-02-01', expiryDate: '2026-06-30', status: 'active', type: 'project', issuedBy: 'Đại tá Lê Văn Định', zones: ['Khu D', 'Khu E', 'Kho vật tư'] },
  { id: 'b-005', code: 'TT-2026-0012', visitorName: 'Ngô Minh Tuấn', organization: 'CT Viễn thông', issuedDate: '2026-03-01', expiryDate: '2026-03-31', status: 'active', type: 'monthly', issuedBy: 'Thiếu tá Đặng Hoàng Nam', zones: ['Phòng kỹ thuật', 'Cột anten'] },
  { id: 'b-006', code: 'BT-2026-0056', visitorName: 'Đỗ Thị Mai', organization: 'CT Điện lực', issuedDate: '2026-03-10', expiryDate: '2026-03-25', status: 'expired', type: 'project', issuedBy: 'Thượng úy Trần Văn Toàn', zones: ['Trạm điện', 'Khu B'] },
  { id: 'b-007', code: 'CQ-2026-0091', visitorName: 'Đinh Thị Hoa', organization: 'Bộ Tài chính', issuedDate: '2026-03-26', expiryDate: '2026-03-26', status: 'active', type: 'day', issuedBy: 'Đại tá Lê Văn Định', zones: ['Phòng Tài chính', 'Kho số liệu'] },
  { id: 'b-008', code: 'XD-2025-0189', visitorName: 'Trịnh Công Sơn', organization: 'CT Hải Dương', issuedDate: '2025-11-15', expiryDate: '2026-03-15', status: 'expired', type: 'project', issuedBy: 'Thượng tá Bùi Văn Kiên', zones: ['Công trường C'] },
  { id: 'b-009', code: 'MT-2026-0034', visitorName: 'Lưu Quang Vinh', organization: 'CT Bảo vệ Sao Bắc', issuedDate: '2026-03-15', expiryDate: '2026-09-15', status: 'suspended', type: 'project', issuedBy: 'Thiếu tá Trần Hùng', zones: ['Cổng A', 'Cổng B'] },
  { id: 'b-010', code: 'TD-2026-0241', visitorName: 'Cao Minh Đức', organization: 'CT Kỹ thuật ABC', issuedDate: '2026-03-26', expiryDate: '2026-03-28', status: 'active', type: 'day', issuedBy: 'Thiếu tá Nguyễn Duy Thắng', zones: ['Phòng họp B', 'Phòng Kỹ thuật'] },
  { id: 'b-011', code: 'MT-2026-0022', visitorName: 'Kiều Văn Đại', organization: 'CT An ninh Bắc Sơn', issuedDate: '2026-01-15', expiryDate: '2026-01-31', status: 'lost', type: 'monthly', issuedBy: 'Thượng úy Bùi Đức Thắng', zones: ['Cổng chính'] },
];

// ---- Mock Vehicles ----

export const vehicles: Vehicle[] = [
  { id: 'veh-001', plate: '51G-12345', type: 'car', model: 'Toyota Fortuner', color: 'Trắng', ownerName: 'Nguyễn Văn Hùng', ownerOrg: 'CT Xây dựng Hoàng Gia', checkIn: '2026-03-26T08:10:00', status: 'inside', purpose: 'Kiểm tra công trình A3', parkingSlot: 'P-A12' },
  { id: 'veh-002', plate: '29H-98765', type: 'truck', model: 'Isuzu FRR', color: 'Xanh lá', ownerName: 'Phạm Thị Thu Hương', ownerOrg: 'CT Thực phẩm Sao Mai', checkIn: '2026-03-26T07:00:00', checkOut: '2026-03-26T07:45:00', status: 'outside', purpose: 'Giao thực phẩm', parkingSlot: 'C-02' },
  { id: 'veh-003', plate: '29C-54321', type: 'truck', model: 'Hino 700', color: 'Vàng', ownerName: 'Vũ Công Danh', ownerOrg: 'Petrolimex QĐ', checkIn: '2026-03-25T14:00:00', checkOut: '2026-03-25T15:30:00', status: 'outside', purpose: 'Cấp nhiên liệu', parkingSlot: 'K-05' },
  { id: 'veh-004', plate: '80A-12345', type: 'car', model: 'Toyota Camry', color: 'Đen', ownerName: 'Phùng Văn Đạt', ownerOrg: 'Bộ Công an', checkIn: '2026-03-26T08:00:00', status: 'inside', purpose: 'Công tác', parkingSlot: 'VIP-03' },
  { id: 'veh-005', plate: '37A-67890', type: 'motorcycle', model: 'Honda Wave', color: 'Đỏ', ownerName: 'Nguyễn Tiến Dũng', ownerOrg: 'Cá nhân', checkIn: '2026-03-26T08:30:00', status: 'overstay', purpose: 'Gặp cán bộ', parkingSlot: 'M-23' },
  { id: 'veh-006', plate: '15A-44556', type: 'car', model: 'Ford Transit', color: 'Bạc', ownerName: 'Trần Thị Lan Anh', ownerOrg: 'Viettel QĐ', checkIn: '2026-03-26T08:55:00', status: 'inside', purpose: 'Bảo trì thiết bị', parkingSlot: 'P-B07' },
  { id: 'veh-007', plate: '30E-99887', type: 'car', model: 'Mercedes C200', color: 'Đen', ownerName: 'Cao Minh Đức', ownerOrg: 'CT Kỹ thuật ABC', checkIn: '2026-03-26T07:28:00', status: 'inside', purpose: 'Lắp đặt thiết bị', parkingSlot: 'P-C14' },
];

// ---- Entry Logs ----

export const entryLogs: EntryLog[] = [
  { id: 'log-001', timestamp: '2026-03-26T08:10:00', event: 'in', fullName: 'Nguyễn Văn Hùng', idNumber: '026091234567', organization: 'CT Xây dựng Hoàng Gia', gate: 'Cổng A', officer: 'Binh nhất Trần Văn Dũng', type: 'contractor' },
  { id: 'log-002', timestamp: '2026-03-26T08:15:00', event: 'in', fullName: 'Nguyễn Văn Hùng', idNumber: '026091234567', organization: 'CT Xây dựng Hoàng Gia', gate: 'Cổng A', officer: 'Binh nhất Trần Văn Dũng', note: 'Thẻ TD-2026-0234 đã cấp', type: 'contractor' },
  { id: 'log-003', timestamp: '2026-03-26T08:55:00', event: 'in', fullName: 'Trần Thị Lan Anh', idNumber: '001299876543', organization: 'Viettel QĐ', gate: 'Cổng B', officer: 'Hạ sĩ Lê Minh Tú', type: 'maintenance' },
  { id: 'log-004', timestamp: '2026-03-26T07:00:00', event: 'in', fullName: 'Phạm Thị Thu Hương', idNumber: '038198765432', organization: 'CT Thực phẩm Sao Mai', gate: 'Cổng C (Hàng hóa)', officer: 'Binh nhất Nguyễn Văn Khoa', type: 'supplier' },
  { id: 'log-005', timestamp: '2026-03-26T07:45:00', event: 'out', fullName: 'Phạm Thị Thu Hương', idNumber: '038198765432', organization: 'CT Thực phẩm Sao Mai', gate: 'Cổng C (Hàng hóa)', officer: 'Binh nhất Nguyễn Văn Khoa', type: 'supplier' },
  { id: 'log-006', timestamp: '2026-03-26T09:25:00', event: 'in', fullName: 'Lê Văn Tùng', idNumber: '079082345678', organization: 'UBND TP', gate: 'Cổng A', officer: 'Hạ sĩ Đoàn Văn Minh', type: 'government' },
  { id: 'log-007', timestamp: '2026-03-26T07:28:00', event: 'in', fullName: 'Cao Minh Đức', idNumber: '034091122334', organization: 'CT Kỹ thuật ABC', gate: 'Cổng B', officer: 'Binh nhất Vũ Văn Long', type: 'contractor' },
  { id: 'log-008', timestamp: '2026-03-26T08:00:00', event: 'in', fullName: 'Đinh Thị Hoa', idNumber: '025196543210', organization: 'Bộ Tài chính', gate: 'Cổng A', officer: 'Thượng sĩ Nguyễn Văn Tài', type: 'government' },
  { id: 'log-009', timestamp: '2026-03-26T11:30:00', event: 'out', fullName: 'Lưu Thị Thanh', idNumber: '079299112233', organization: 'VP Quốc hội', gate: 'Cổng A', officer: 'Hạ sĩ Nguyễn Trung Kiên', type: 'government' },
  { id: 'log-010', timestamp: '2026-03-25T14:00:00', event: 'in', fullName: 'Vũ Công Danh', idNumber: '036087654321', organization: 'Petrolimex QĐ', gate: 'Cổng C (Hàng hóa)', officer: 'Binh nhất Phùng Văn Tuân', type: 'supplier' },
  { id: 'log-011', timestamp: '2026-03-25T15:30:00', event: 'out', fullName: 'Vũ Công Danh', idNumber: '036087654321', organization: 'Petrolimex QĐ', gate: 'Cổng C (Hàng hóa)', officer: 'Binh nhất Phùng Văn Tuân', type: 'supplier' },
  { id: 'log-012', timestamp: '2026-03-25T09:05:00', event: 'in', fullName: 'Phan Thị Minh Châu', idNumber: '001293456789', organization: 'TCT QDND', gate: 'Cổng A', officer: 'Thượng sĩ Nguyễn Văn Tài', type: 'partner' },
  { id: 'log-013', timestamp: '2026-03-25T10:35:00', event: 'out', fullName: 'Phan Thị Minh Châu', idNumber: '001293456789', organization: 'TCT QDND', gate: 'Cổng A', officer: 'Thượng sĩ Nguyễn Văn Tài', type: 'partner' },
];

// ---- Dashboard Stats ----

export const dashboardStats = {
  insideNow: 6,
  totalToday: 24,
  pendingAppointments: 3,
  vehiclesInside: 5,
  overstayNow: 1,
  todayCompleted: 14,
  weeklyTotal: 147,
  monthlyTotal: 523,
};

export const weeklyVisitorData = [
  { day: 'T2', visitors: 32, vehicles: 12 },
  { day: 'T3', visitors: 28, vehicles: 9 },
  { day: 'T4', visitors: 35, vehicles: 14 },
  { day: 'T5', visitors: 24, vehicles: 8 },
  { day: 'T6', visitors: 38, vehicles: 15 },
  { day: 'T7', visitors: 15, vehicles: 5 },
  { day: 'CN', visitors: 6, vehicles: 2 },
];

export const visitorTypeDistribution = [
  { name: 'Nhà thầu', value: 35 },
  { name: 'Đối tác', value: 25 },
  { name: 'Nhà cung cấp', value: 20 },
  { name: 'Cơ quan NN', value: 12 },
  { name: 'Khác', value: 8 },
];
