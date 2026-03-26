// ==========================================
// USERS, ROLES, PERMISSIONS, DEPARTMENTS
// ==========================================

export type Permission =
  | 'doc.incoming.view'
  | 'doc.incoming.create'
  | 'doc.incoming.edit'
  | 'doc.incoming.delete'
  | 'doc.incoming.assign'
  | 'doc.incoming.process'
  | 'doc.outgoing.view'
  | 'doc.outgoing.create'
  | 'doc.outgoing.edit'
  | 'doc.outgoing.delete'
  | 'doc.outgoing.approve'
  | 'doc.outgoing.publish'
  | 'doc.internal.view'
  | 'doc.internal.create'
  | 'doc.internal.edit'
  | 'doc.internal.delete'
  | 'doc.internal.approve'
  | 'task.view'
  | 'task.create'
  | 'task.edit'
  | 'task.delete'
  | 'task.assign'
  | 'task.approve'
  | 'calendar.view'
  | 'calendar.create'
  | 'calendar.edit'
  | 'calendar.delete'
  | 'calendar.room.manage'
  | 'report.view.personal'
  | 'report.view.department'
  | 'report.view.all'
  | 'report.export'
  | 'user.view'
  | 'user.create'
  | 'user.edit'
  | 'user.delete'
  | 'user.role.assign'
  | 'org.view'
  | 'org.manage'
  | 'category.view'
  | 'category.manage'
  | 'system.config'
  | 'system.audit';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  color: string;
  isSystem: boolean; // system roles cannot be deleted
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  parentId: string | null;
  headId: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  password: string; // mock only
  fullName: string;
  email: string;
  phone: string;
  avatar: string; // initials
  roleIds: string[];
  departmentId: string;
  position: string;
  isActive: boolean;
  isLocked: boolean;
  failedLoginAttempts: number;
  lastLogin: string | null;
  loginHistory: LoginRecord[];
  createdAt: string;
}

export interface LoginRecord {
  time: string;
  ip: string;
  device: string;
  success: boolean;
}

// ==========================================
// PREDEFINED ROLES
// ==========================================
export const roles: Role[] = [
  {
    id: 'role-admin',
    name: 'Quản trị viên',
    description: 'Toàn quyền quản trị hệ thống',
    color: '#dc2626',
    isSystem: true,
    permissions: [
      'doc.incoming.view', 'doc.incoming.create', 'doc.incoming.edit', 'doc.incoming.delete', 'doc.incoming.assign', 'doc.incoming.process',
      'doc.outgoing.view', 'doc.outgoing.create', 'doc.outgoing.edit', 'doc.outgoing.delete', 'doc.outgoing.approve', 'doc.outgoing.publish',
      'doc.internal.view', 'doc.internal.create', 'doc.internal.edit', 'doc.internal.delete', 'doc.internal.approve',
      'task.view', 'task.create', 'task.edit', 'task.delete', 'task.assign', 'task.approve',
      'calendar.view', 'calendar.create', 'calendar.edit', 'calendar.delete', 'calendar.room.manage',
      'report.view.personal', 'report.view.department', 'report.view.all', 'report.export',
      'user.view', 'user.create', 'user.edit', 'user.delete', 'user.role.assign',
      'org.view', 'org.manage',
      'category.view', 'category.manage',
      'system.config', 'system.audit',
    ],
  },
  {
    id: 'role-leader',
    name: 'Lãnh đạo',
    description: 'Phê duyệt văn bản, giao việc, xem báo cáo toàn cơ quan',
    color: '#7c3aed',
    isSystem: true,
    permissions: [
      'doc.incoming.view', 'doc.incoming.assign',
      'doc.outgoing.view', 'doc.outgoing.approve',
      'doc.internal.view', 'doc.internal.approve',
      'task.view', 'task.create', 'task.assign', 'task.approve',
      'calendar.view', 'calendar.create', 'calendar.edit', 'calendar.delete', 'calendar.room.manage',
      'report.view.personal', 'report.view.department', 'report.view.all', 'report.export',
      'user.view',
      'org.view',
      'category.view',
    ],
  },
  {
    id: 'role-dept-head',
    name: 'Trưởng phòng',
    description: 'Quản lý phòng ban, phân công công việc trong phòng',
    color: '#2563eb',
    isSystem: true,
    permissions: [
      'doc.incoming.view', 'doc.incoming.assign', 'doc.incoming.process',
      'doc.outgoing.view', 'doc.outgoing.create', 'doc.outgoing.edit', 'doc.outgoing.approve',
      'doc.internal.view', 'doc.internal.create', 'doc.internal.edit', 'doc.internal.approve',
      'task.view', 'task.create', 'task.edit', 'task.assign', 'task.approve',
      'calendar.view', 'calendar.create', 'calendar.edit',
      'report.view.personal', 'report.view.department', 'report.export',
      'user.view',
      'org.view',
      'category.view',
    ],
  },
  {
    id: 'role-specialist',
    name: 'Chuyên viên',
    description: 'Xử lý văn bản, thực hiện công việc được giao',
    color: '#0891b2',
    isSystem: true,
    permissions: [
      'doc.incoming.view', 'doc.incoming.process',
      'doc.outgoing.view', 'doc.outgoing.create', 'doc.outgoing.edit',
      'doc.internal.view',
      'task.view', 'task.edit',
      'calendar.view', 'calendar.create',
      'report.view.personal',
      'category.view',
    ],
  },
  {
    id: 'role-clerk',
    name: 'Văn thư',
    description: 'Tiếp nhận văn bản đến, phát hành văn bản đi, quản lý sổ văn bản',
    color: '#059669',
    isSystem: true,
    permissions: [
      'doc.incoming.view', 'doc.incoming.create', 'doc.incoming.edit',
      'doc.outgoing.view', 'doc.outgoing.publish',
      'doc.internal.view',
      'task.view',
      'calendar.view',
      'report.view.personal',
      'category.view',
    ],
  },
  {
    id: 'role-employee',
    name: 'Nhân viên',
    description: 'Xem văn bản được phân công, thực hiện công việc',
    color: '#64748b',
    isSystem: true,
    permissions: [
      'doc.incoming.view', 'doc.incoming.process',
      'doc.outgoing.view',
      'doc.internal.view',
      'task.view', 'task.edit',
      'calendar.view',
      'report.view.personal',
    ],
  },
];

// ==========================================
// DEPARTMENTS
// ==========================================
export const departments: Department[] = [
  { id: 'dept-root', name: 'UBND Huyện Bình Minh', code: 'UBND', description: 'Ủy ban nhân dân huyện Bình Minh', parentId: null, headId: 'user-leader-1', order: 1, isActive: true, createdAt: '2024-01-01' },
  { id: 'dept-vp', name: 'Văn phòng', code: 'VP', description: 'Văn phòng UBND huyện', parentId: 'dept-root', headId: 'user-head-1', order: 1, isActive: true, createdAt: '2024-01-01' },
  { id: 'dept-tckt', name: 'Phòng Tài chính - Kế toán', code: 'TCKT', description: 'Quản lý tài chính và kế toán', parentId: 'dept-root', headId: 'user-head-2', order: 2, isActive: true, createdAt: '2024-01-01' },
  { id: 'dept-cntt', name: 'Phòng Công nghệ thông tin', code: 'CNTT', description: 'Quản lý hạ tầng CNTT', parentId: 'dept-root', headId: 'user-head-3', order: 3, isActive: true, createdAt: '2024-01-01' },
  { id: 'dept-tchc', name: 'Phòng Tổ chức - Hành chính', code: 'TCHC', description: 'Quản lý nhân sự và hành chính', parentId: 'dept-root', headId: 'user-head-4', order: 4, isActive: true, createdAt: '2024-01-01' },
  { id: 'dept-gddt', name: 'Phòng Giáo dục & Đào tạo', code: 'GDDT', description: 'Quản lý giáo dục và đào tạo', parentId: 'dept-root', headId: null, order: 5, isActive: true, createdAt: '2024-01-01' },
  { id: 'dept-yte', name: 'Phòng Y tế', code: 'YT', description: 'Quản lý y tế và sức khỏe cộng đồng', parentId: 'dept-root', headId: null, order: 6, isActive: true, createdAt: '2024-01-01' },
  { id: 'dept-tnmt', name: 'Phòng TN & Môi trường', code: 'TNMT', description: 'Quản lý tài nguyên và môi trường', parentId: 'dept-root', headId: null, order: 7, isActive: true, createdAt: '2024-01-01' },
  { id: 'dept-ktht', name: 'Phòng Kinh tế - Hạ tầng', code: 'KTHT', description: 'Quản lý kinh tế và hạ tầng', parentId: 'dept-root', headId: null, order: 8, isActive: true, createdAt: '2024-01-01' },
];

// ==========================================
// USERS
// ==========================================
export const users: User[] = [
  {
    id: 'user-admin',
    username: 'admin',
    password: 'Admin@123',
    fullName: 'Nguyễn Quản Trị',
    email: 'admin@eoffice.gov.vn',
    phone: '0901234567',
    avatar: 'NQT',
    roleIds: ['role-admin'],
    departmentId: 'dept-cntt',
    position: 'Quản trị viên hệ thống',
    isActive: true,
    isLocked: false,
    failedLoginAttempts: 0,
    lastLogin: '2026-03-17T08:00:00',
    loginHistory: [
      { time: '2026-03-17T08:00:00', ip: '192.168.1.100', device: 'Chrome / Windows 11', success: true },
      { time: '2026-03-16T07:45:00', ip: '192.168.1.100', device: 'Chrome / Windows 11', success: true },
      { time: '2026-03-15T08:10:00', ip: '10.0.0.55', device: 'Safari / macOS', success: true },
    ],
    createdAt: '2024-01-01',
  },
  {
    id: 'user-leader-1',
    username: 'lanhdao',
    password: 'Leader@123',
    fullName: 'Trần Văn Minh',
    email: 'minh.tv@eoffice.gov.vn',
    phone: '0902345678',
    avatar: 'TVM',
    roleIds: ['role-leader'],
    departmentId: 'dept-root',
    position: 'Chủ tịch UBND',
    isActive: true,
    isLocked: false,
    failedLoginAttempts: 0,
    lastLogin: '2026-03-17T07:30:00',
    loginHistory: [
      { time: '2026-03-17T07:30:00', ip: '192.168.1.10', device: 'Chrome / Windows 11', success: true },
    ],
    createdAt: '2024-01-01',
  },
  {
    id: 'user-head-1',
    username: 'truongphong.vp',
    password: 'Head@123',
    fullName: 'Lê Thị Hương',
    email: 'huong.lt@eoffice.gov.vn',
    phone: '0903456789',
    avatar: 'LTH',
    roleIds: ['role-dept-head'],
    departmentId: 'dept-vp',
    position: 'Chánh Văn phòng',
    isActive: true,
    isLocked: false,
    failedLoginAttempts: 0,
    lastLogin: '2026-03-17T07:50:00',
    loginHistory: [],
    createdAt: '2024-01-01',
  },
  {
    id: 'user-head-2',
    username: 'truongphong.tckt',
    password: 'Head@123',
    fullName: 'Phạm Đức Dương',
    email: 'duong.pd@eoffice.gov.vn',
    phone: '0904567890',
    avatar: 'PDD',
    roleIds: ['role-dept-head'],
    departmentId: 'dept-tckt',
    position: 'Trưởng phòng TC-KT',
    isActive: true,
    isLocked: false,
    failedLoginAttempts: 0,
    lastLogin: '2026-03-16T14:20:00',
    loginHistory: [],
    createdAt: '2024-01-01',
  },
  {
    id: 'user-head-3',
    username: 'truongphong.cntt',
    password: 'Head@123',
    fullName: 'Nguyễn Văn An',
    email: 'an.nv@eoffice.gov.vn',
    phone: '0905678901',
    avatar: 'NVA',
    roleIds: ['role-dept-head'],
    departmentId: 'dept-cntt',
    position: 'Trưởng phòng CNTT',
    isActive: true,
    isLocked: false,
    failedLoginAttempts: 0,
    lastLogin: '2026-03-17T08:15:00',
    loginHistory: [],
    createdAt: '2024-01-01',
  },
  {
    id: 'user-head-4',
    username: 'truongphong.tchc',
    password: 'Head@123',
    fullName: 'Vũ Thanh Phong',
    email: 'phong.vt@eoffice.gov.vn',
    phone: '0906789012',
    avatar: 'VTP',
    roleIds: ['role-dept-head'],
    departmentId: 'dept-tchc',
    position: 'Trưởng phòng TC-HC',
    isActive: true,
    isLocked: false,
    failedLoginAttempts: 0,
    lastLogin: '2026-03-15T09:00:00',
    loginHistory: [],
    createdAt: '2024-01-01',
  },
  {
    id: 'user-specialist-1',
    username: 'chuyenvien1',
    password: 'Spec@123',
    fullName: 'Trần Thị Bình',
    email: 'binh.tt@eoffice.gov.vn',
    phone: '0907890123',
    avatar: 'TTB',
    roleIds: ['role-specialist'],
    departmentId: 'dept-vp',
    position: 'Chuyên viên Văn phòng',
    isActive: true,
    isLocked: false,
    failedLoginAttempts: 0,
    lastLogin: '2026-03-17T08:05:00',
    loginHistory: [],
    createdAt: '2024-03-01',
  },
  {
    id: 'user-specialist-2',
    username: 'chuyenvien2',
    password: 'Spec@123',
    fullName: 'Lê Minh Châu',
    email: 'chau.lm@eoffice.gov.vn',
    phone: '0908901234',
    avatar: 'LMC',
    roleIds: ['role-specialist'],
    departmentId: 'dept-cntt',
    position: 'Chuyên viên CNTT',
    isActive: true,
    isLocked: false,
    failedLoginAttempts: 0,
    lastLogin: '2026-03-16T16:00:00',
    loginHistory: [],
    createdAt: '2024-06-01',
  },
  {
    id: 'user-clerk-1',
    username: 'vanthu',
    password: 'Clerk@123',
    fullName: 'Hoàng Thị Em',
    email: 'em.ht@eoffice.gov.vn',
    phone: '0909012345',
    avatar: 'HTE',
    roleIds: ['role-clerk'],
    departmentId: 'dept-vp',
    position: 'Văn thư',
    isActive: true,
    isLocked: false,
    failedLoginAttempts: 0,
    lastLogin: '2026-03-17T07:40:00',
    loginHistory: [],
    createdAt: '2024-01-15',
  },
  {
    id: 'user-employee-1',
    username: 'nhanvien1',
    password: 'Emp@123',
    fullName: 'Đỗ Quang Huy',
    email: 'huy.dq@eoffice.gov.vn',
    phone: '0910123456',
    avatar: 'DQH',
    roleIds: ['role-employee'],
    departmentId: 'dept-tckt',
    position: 'Nhân viên',
    isActive: true,
    isLocked: false,
    failedLoginAttempts: 0,
    lastLogin: '2026-03-14T08:30:00',
    loginHistory: [],
    createdAt: '2025-01-10',
  },
  {
    id: 'user-employee-2',
    username: 'nhanvien2',
    password: 'Emp@123',
    fullName: 'Bùi Thị Lan',
    email: 'lan.bt@eoffice.gov.vn',
    phone: '0911234567',
    avatar: 'BTL',
    roleIds: ['role-employee'],
    departmentId: 'dept-tchc',
    position: 'Nhân viên',
    isActive: true,
    isLocked: false,
    failedLoginAttempts: 2,
    lastLogin: '2026-03-13T10:00:00',
    loginHistory: [],
    createdAt: '2025-03-01',
  },
  {
    id: 'user-locked',
    username: 'locked_user',
    password: 'Locked@123',
    fullName: 'Nguyễn Văn Khóa',
    email: 'khoa.nv@eoffice.gov.vn',
    phone: '0912345678',
    avatar: 'NVK',
    roleIds: ['role-employee'],
    departmentId: 'dept-tnmt',
    position: 'Nhân viên',
    isActive: true,
    isLocked: true,
    failedLoginAttempts: 5,
    lastLogin: null,
    loginHistory: [],
    createdAt: '2025-06-01',
  },
];

// Helper: get role names for a user
export function getUserRoles(user: User): Role[] {
  return roles.filter((r) => user.roleIds.includes(r.id));
}

// Helper: get all permissions for a user
export function getUserPermissions(user: User): Permission[] {
  const userRoles = getUserRoles(user);
  const perms = new Set<Permission>();
  userRoles.forEach((r) => r.permissions.forEach((p) => perms.add(p)));
  return Array.from(perms);
}

// Helper: check if user has permission
export function hasPermission(user: User, permission: Permission): boolean {
  return getUserPermissions(user).includes(permission);
}

// Helper: get department name
export function getDepartmentName(deptId: string): string {
  return departments.find((d) => d.id === deptId)?.name || 'Không xác định';
}

// Helper: get children departments
export function getChildDepartments(parentId: string): Department[] {
  return departments.filter((d) => d.parentId === parentId && d.isActive);
}
