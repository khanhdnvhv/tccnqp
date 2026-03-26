// ============================================================
// HỒ SƠ NĂNG LỰC ĐỐI TÁC — Mock Data (Epic 3.2 + 4.2)
// ============================================================

export type PartnerField =
  | 'defense'
  | 'technology'
  | 'construction'
  | 'logistics'
  | 'manufacturing'
  | 'consulting'
  | 'education'
  | 'healthcare'
  | 'government'
  | 'other';

export type ContractStatus = 'active' | 'completed' | 'cancelled' | 'pending';
export type RelationshipLevel = 'strategic' | 'regular' | 'occasional' | 'new';

export const partnerFieldLabels: Record<PartnerField, string> = {
  defense: 'Quốc phòng - An ninh',
  technology: 'Công nghệ thông tin',
  construction: 'Xây dựng - Hạ tầng',
  logistics: 'Logistics - Vận chuyển',
  manufacturing: 'Sản xuất - Chế tạo',
  consulting: 'Tư vấn - Dịch vụ',
  education: 'Giáo dục - Đào tạo',
  healthcare: 'Y tế - Dược phẩm',
  government: 'Cơ quan Nhà nước',
  other: 'Lĩnh vực khác',
};

export const contractStatusLabels: Record<ContractStatus, string> = {
  active: 'Đang hiệu lực',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy',
  pending: 'Chờ ký kết',
};

export const contractStatusColors: Record<ContractStatus, { bg: string; text: string }> = {
  active: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
  pending: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
};

export const relationshipLevelLabels: Record<RelationshipLevel, string> = {
  strategic: 'Đối tác chiến lược',
  regular: 'Đối tác thường xuyên',
  occasional: 'Hợp tác không thường xuyên',
  new: 'Mới thiết lập',
};

export const relationshipLevelColors: Record<RelationshipLevel, { bg: string; text: string }> = {
  strategic: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-400' },
  regular: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  occasional: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  new: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
};

export interface PartnerContract {
  id: string;
  contractNumber: string;
  name: string;
  signDate: string;
  endDate: string;
  value: number; // triệu đồng
  profit: number; // triệu đồng
  status: ContractStatus;
  products: string[];
  description: string;
}

export interface PartnerVisitRecord {
  id: string;
  date: string;
  purpose: string;
  attendees: number;
  result: string;
}

export interface PartnerRelation {
  partnerId: string;
  type: 'joint_venture' | 'subcontractor' | 'competitor' | 'referral' | 'consortium';
  description: string;
}

export interface Partner {
  id: string;
  code: string;
  name: string;
  shortName: string;
  country: string;
  address: string;
  foundingYear: number;
  email: string;
  phone: string;
  website?: string;
  field: PartnerField;
  relationshipLevel: RelationshipLevel;
  contactPerson: string;
  contactPosition: string;
  taxCode?: string;
  isActive: boolean;
  firstContactDate: string;
  lastVisitDate?: string;
  totalVisits: number;
  totalContractValue: number; // triệu đồng
  totalProfit: number; // triệu đồng
  contracts: PartnerContract[];
  visitHistory: PartnerVisitRecord[];
  relations: PartnerRelation[];
  notes?: string;
}

export const partners: Partner[] = [
  {
    id: 'p-001',
    code: 'DT-VN-001',
    name: 'Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel)',
    shortName: 'Viettel',
    country: 'Việt Nam',
    address: '1 Giang Văn Minh, Ba Đình, Hà Nội',
    foundingYear: 1989,
    email: 'contact@viettel.com.vn',
    phone: '024 62680000',
    website: 'https://viettel.com.vn',
    field: 'technology',
    relationshipLevel: 'strategic',
    contactPerson: 'Thiếu tướng Tào Đức Thắng',
    contactPosition: 'Tổng Giám đốc',
    taxCode: '0100109106',
    isActive: true,
    firstContactDate: '2018-01-15',
    lastVisitDate: '2026-03-10',
    totalVisits: 24,
    totalContractValue: 45600,
    totalProfit: 12300,
    contracts: [
      {
        id: 'c-001-1',
        contractNumber: 'HĐ/2024/VTT-TCCNQP/001',
        name: 'Cung cấp hệ thống thông tin liên lạc quân sự thế hệ mới',
        signDate: '2024-03-01',
        endDate: '2025-12-31',
        value: 18500,
        profit: 4800,
        status: 'completed',
        products: ['Hệ thống VTQS-5G', 'Thiết bị mã hóa MK-200', 'Phần mềm quản lý'],
        description: 'Cung cấp và lắp đặt hệ thống thông tin liên lạc tiên tiến cho các đơn vị quân đội',
      },
      {
        id: 'c-001-2',
        contractNumber: 'HĐ/2025/VTT-TCCNQP/005',
        name: 'Nâng cấp cơ sở hạ tầng mạng an toàn',
        signDate: '2025-06-15',
        endDate: '2026-12-31',
        value: 22400,
        profit: 6800,
        status: 'active',
        products: ['Router quân sự QN-Router 1000', 'Firewall QN-FW Pro', 'VPN Gateway'],
        description: 'Nâng cấp toàn bộ hệ thống mạng nội bộ theo tiêu chuẩn bảo mật quân sự cấp cao',
      },
      {
        id: 'c-001-3',
        contractNumber: 'HĐ/2026/VTT-TCCNQP/002',
        name: 'Tư vấn chuyển đổi số giai đoạn 2026-2028',
        signDate: '2026-01-10',
        endDate: '2028-12-31',
        value: 4700,
        profit: 700,
        status: 'pending',
        products: ['Dịch vụ tư vấn', 'Đào tạo nhân lực'],
        description: 'Tư vấn và hỗ trợ chuyển đổi số toàn diện cho Tổng cục',
      },
    ],
    visitHistory: [
      { id: 'v-001-1', date: '2026-03-10', purpose: 'Nghiệm thu dự án nâng cấp mạng phase 1', attendees: 8, result: 'Thành công - nghiệm thu đạt yêu cầu' },
      { id: 'v-001-2', date: '2025-12-15', purpose: 'Họp tổng kết hợp đồng HĐ/2024/VTT', attendees: 12, result: 'Hoàn thành bàn giao hệ thống' },
      { id: 'v-001-3', date: '2025-09-20', purpose: 'Kiểm tra định kỳ thiết bị thông tin liên lạc', attendees: 5, result: 'Thiết bị hoạt động tốt' },
    ],
    relations: [
      { partnerId: 'p-004', type: 'consortium', description: 'Liên danh dự thầu dự án hệ thống tích hợp quốc phòng 2026' },
    ],
    notes: 'Đối tác chiến lược quan trọng nhất. Ưu tiên xử lý hồ sơ và đón tiếp theo nghi thức cao.',
  },
  {
    id: 'p-002',
    code: 'DT-VN-002',
    name: 'Tổng công ty Công nghiệp Quốc phòng (GADEF)',
    shortName: 'GADEF',
    country: 'Việt Nam',
    address: '268 Đội Cấn, Ba Đình, Hà Nội',
    foundingYear: 1994,
    email: 'info@gadef.com.vn',
    phone: '024 37673456',
    field: 'manufacturing',
    relationshipLevel: 'strategic',
    contactPerson: 'Trung tướng Phạm Tuấn Anh',
    contactPosition: 'Chủ tịch Hội đồng quản trị',
    taxCode: '0100110234',
    isActive: true,
    firstContactDate: '2015-05-20',
    lastVisitDate: '2026-02-28',
    totalVisits: 38,
    totalContractValue: 82400,
    totalProfit: 22100,
    contracts: [
      {
        id: 'c-002-1',
        contractNumber: 'HĐ/2025/GADEF-TCCNQP/012',
        name: 'Cung cấp thiết bị sản xuất và chế tạo vũ khí hạng nhẹ',
        signDate: '2025-01-20',
        endDate: '2027-01-19',
        value: 35600,
        profit: 9200,
        status: 'active',
        products: ['Dây chuyền sản xuất CNC-5000', 'Hệ thống kiểm tra tự động QC-Pro', 'Phần mềm quản lý sản xuất'],
        description: 'Cung cấp dây chuyền sản xuất hiện đại cho nhà máy chế tạo vũ khí',
      },
      {
        id: 'c-002-2',
        contractNumber: 'HĐ/2023/GADEF-TCCNQP/007',
        name: 'Nghiên cứu phát triển vật liệu composite quân sự',
        signDate: '2023-08-01',
        endDate: '2025-07-31',
        value: 12800,
        profit: 3400,
        status: 'completed',
        products: ['Vật liệu composite CMQ-100', 'Quy trình sản xuất IP'],
        description: 'R&D và chuyển giao công nghệ vật liệu nhẹ cho thiết bị quân sự',
      },
    ],
    visitHistory: [
      { id: 'v-002-1', date: '2026-02-28', purpose: 'Kiểm tra tiến độ dây chuyền sản xuất', attendees: 6, result: 'Tiến độ đạt 85%' },
      { id: 'v-002-2', date: '2025-11-10', purpose: 'Hội thảo kỹ thuật vật liệu composite', attendees: 20, result: 'Ký kết biên bản hợp tác kỹ thuật' },
    ],
    relations: [
      { partnerId: 'p-001', type: 'joint_venture', description: 'Liên doanh phát triển hệ thống tích hợp C4ISR' },
    ],
    notes: 'Đối tác truyền thống, quan hệ lâu dài. Cần ưu tiên cao trong mọi hoạt động tiếp đón.',
  },
  {
    id: 'p-003',
    code: 'DT-RUS-001',
    name: 'Rosoboronexport JSC',
    shortName: 'Rosoboronexport',
    country: 'Nga',
    address: '27 Stromynka Street, Moscow 107076, Russia',
    foundingYear: 2000,
    email: 'info@roe.ru',
    phone: '+7 495 534-61-83',
    website: 'https://roe.ru',
    field: 'defense',
    relationshipLevel: 'strategic',
    contactPerson: 'Alexander Mikheyev',
    contactPosition: 'General Director',
    isActive: true,
    firstContactDate: '2010-03-15',
    lastVisitDate: '2025-11-20',
    totalVisits: 15,
    totalContractValue: 125000,
    totalProfit: 0,
    contracts: [
      {
        id: 'c-003-1',
        contractNumber: 'CTR-2023-ROE-VN-005',
        name: 'Cung cấp và hiện đại hóa hệ thống phòng không S-300PMU2',
        signDate: '2023-04-10',
        endDate: '2028-04-09',
        value: 95000,
        profit: 0,
        status: 'active',
        products: ['Hệ thống S-300PMU2', 'Đạn tên lửa 48N6E3', 'Thiết bị radar 64N6E2'],
        description: 'Hợp đồng mua sắm và hiện đại hóa hệ thống tên lửa phòng không tầm xa',
      },
    ],
    visitHistory: [
      { id: 'v-003-1', date: '2025-11-20', purpose: 'Đàm phán kỹ thuật giai đoạn 2 của hợp đồng', attendees: 10, result: 'Thống nhất điều khoản kỹ thuật bổ sung' },
      { id: 'v-003-2', date: '2025-05-12', purpose: 'Kiểm tra và nghiệm thu thiết bị lô 1', attendees: 8, result: 'Nghiệm thu đạt yêu cầu kỹ thuật' },
    ],
    relations: [],
    notes: 'Đối tác nhà nước cấp chiến lược quốc gia. Mọi hoạt động cần phối hợp với Bộ Quốc phòng.',
  },
  {
    id: 'p-004',
    code: 'DT-VN-003',
    name: 'Công ty CP Phát triển Phần mềm Quốc phòng (DSDC)',
    shortName: 'DSDC',
    country: 'Việt Nam',
    address: '56 Hoàng Diệu, Hai Bà Trưng, Hà Nội',
    foundingYear: 2008,
    email: 'contact@dsdc.vn',
    phone: '024 39861234',
    website: 'https://dsdc.vn',
    field: 'technology',
    relationshipLevel: 'regular',
    contactPerson: 'Nguyễn Thanh Tùng',
    contactPosition: 'Giám đốc Điều hành',
    taxCode: '0102234567',
    isActive: true,
    firstContactDate: '2019-09-01',
    lastVisitDate: '2026-03-18',
    totalVisits: 18,
    totalContractValue: 8900,
    totalProfit: 2100,
    contracts: [
      {
        id: 'c-004-1',
        contractNumber: 'HĐ/2026/DSDC-TCCNQP/001',
        name: 'Phát triển hệ thống quản lý đối tác vào làm việc',
        signDate: '2026-01-15',
        endDate: '2026-06-30',
        value: 1200,
        profit: 280,
        status: 'active',
        products: ['Phần mềm VMS 2.0', 'Module báo cáo', 'App mobile quản lý thẻ'],
        description: 'Phát triển và triển khai hệ thống quản lý đối tác vào làm việc tại Tổng cục',
      },
      {
        id: 'c-004-2',
        contractNumber: 'HĐ/2024/DSDC-TCCNQP/003',
        name: 'Bảo trì hệ thống CNTT năm 2024',
        signDate: '2024-01-01',
        endDate: '2024-12-31',
        value: 850,
        profit: 180,
        status: 'completed',
        products: ['Dịch vụ bảo trì', 'Hỗ trợ kỹ thuật 24/7'],
        description: 'Bảo trì và hỗ trợ kỹ thuật toàn bộ hệ thống CNTT trong năm 2024',
      },
    ],
    visitHistory: [
      { id: 'v-004-1', date: '2026-03-18', purpose: 'Demo hệ thống VMS 2.0 phiên bản beta', attendees: 4, result: 'Được phê duyệt tiếp tục phát triển' },
      { id: 'v-004-2', date: '2026-02-15', purpose: 'Sprint review - Module quản lý thẻ', attendees: 3, result: 'Đạt yêu cầu, nghiệm thu module' },
    ],
    relations: [
      { partnerId: 'p-001', type: 'subcontractor', description: 'Thầu phụ phần mềm trong dự án chuyển đổi số của Viettel' },
    ],
    notes: '',
  },
  {
    id: 'p-005',
    code: 'DT-ISR-001',
    name: 'Elbit Systems Ltd.',
    shortName: 'Elbit Systems',
    country: 'Israel',
    address: 'Advanced Technology Center, Haifa 31053, Israel',
    foundingYear: 1966,
    email: 'info@elbitsystems.com',
    phone: '+972 4 8316 000',
    website: 'https://elbitsystems.com',
    field: 'defense',
    relationshipLevel: 'occasional',
    contactPerson: 'Yair Klass',
    contactPosition: 'VP International Business',
    isActive: true,
    firstContactDate: '2021-07-10',
    lastVisitDate: '2024-09-05',
    totalVisits: 5,
    totalContractValue: 18500,
    totalProfit: 0,
    contracts: [
      {
        id: 'c-005-1',
        contractNumber: 'CTR-2022-ELBIT-VN-001',
        name: 'Cung cấp hệ thống quan sát và trinh sát ban đêm',
        signDate: '2022-11-20',
        endDate: '2024-11-19',
        value: 18500,
        profit: 0,
        status: 'completed',
        products: ['Hệ thống NVG-7000', 'Camera nhiệt INSIS-F', 'Thiết bị nhìn đêm cầm tay'],
        description: 'Cung cấp thiết bị quan sát và trinh sát ban đêm cho các đơn vị đặc nhiệm',
      },
    ],
    visitHistory: [
      { id: 'v-005-1', date: '2024-09-05', purpose: 'Trao đổi khả năng hợp tác giai đoạn 2', attendees: 6, result: 'Tiếp tục nghiên cứu đề xuất kỹ thuật' },
    ],
    relations: [],
    notes: 'Tiềm năng mở rộng hợp tác sang lĩnh vực UAV và hệ thống C2.',
  },
  {
    id: 'p-006',
    code: 'DT-VN-004',
    name: 'Công ty TNHH Xây dựng và Cơ sở Hạ tầng Quân sự (MICI)',
    shortName: 'MICI',
    country: 'Việt Nam',
    address: '12 Lý Nam Đế, Hoàn Kiếm, Hà Nội',
    foundingYear: 2002,
    email: 'mici@mici.com.vn',
    phone: '024 37235678',
    field: 'construction',
    relationshipLevel: 'regular',
    contactPerson: 'Đại tá Trần Văn Minh',
    contactPosition: 'Giám đốc',
    taxCode: '0100567890',
    isActive: true,
    firstContactDate: '2017-04-12',
    lastVisitDate: '2025-12-20',
    totalVisits: 22,
    totalContractValue: 34500,
    totalProfit: 5600,
    contracts: [
      {
        id: 'c-006-1',
        contractNumber: 'HĐ/2025/MICI-TCCNQP/008',
        name: 'Xây dựng nhà máy sản xuất mới - Giai đoạn 2',
        signDate: '2025-03-01',
        endDate: '2027-02-28',
        value: 28000,
        profit: 4500,
        status: 'active',
        products: ['Thi công xây dựng', 'Lắp đặt hạ tầng kỹ thuật', 'Hệ thống điện-nước'],
        description: 'Xây dựng khu nhà máy sản xuất mở rộng giai đoạn 2',
      },
    ],
    visitHistory: [
      { id: 'v-006-1', date: '2025-12-20', purpose: 'Kiểm tra tiến độ thi công tháng 9', attendees: 7, result: 'Tiến độ đạt 62% kế hoạch' },
    ],
    relations: [],
    notes: '',
  },
  {
    id: 'p-007',
    code: 'DT-KOR-001',
    name: 'Hanwha Aerospace Co., Ltd.',
    shortName: 'Hanwha Aerospace',
    country: 'Hàn Quốc',
    address: '174 Amphaeng-ro, Seongnam-si, Gyeonggi-do, South Korea',
    foundingYear: 1977,
    email: 'aerospace@hanwha.com',
    phone: '+82 31 8026 9114',
    website: 'https://hanwhaaerospace.com',
    field: 'manufacturing',
    relationshipLevel: 'new',
    contactPerson: 'Son Jae-il',
    contactPosition: 'Vice President, International Defense',
    isActive: true,
    firstContactDate: '2025-10-01',
    lastVisitDate: '2026-01-22',
    totalVisits: 3,
    totalContractValue: 0,
    totalProfit: 0,
    contracts: [
      {
        id: 'c-007-1',
        contractNumber: 'LOI/2026/HWA-TCCNQP/001',
        name: 'Thư ngỏ ý định hợp tác sản xuất pháo tự hành K9',
        signDate: '2026-01-22',
        endDate: '2026-07-22',
        value: 0,
        profit: 0,
        status: 'pending',
        products: ['Chuyển giao công nghệ K9A1', 'Linh kiện pháo 155mm'],
        description: 'Nghiên cứu khả năng hợp tác sản xuất pháo tự hành trong nước',
      },
    ],
    visitHistory: [
      { id: 'v-007-1', date: '2026-01-22', purpose: 'Thảo luận điều khoản chuyển giao công nghệ K9', attendees: 9, result: 'Ký kết LOI - tiếp tục đàm phán chi tiết' },
      { id: 'v-007-2', date: '2025-10-01', purpose: 'Gặp gỡ giới thiệu năng lực sản phẩm', attendees: 5, result: 'Quan tâm, đề xuất nghiên cứu hợp tác' },
    ],
    relations: [],
    notes: 'Đối tác mới tiềm năng cao. Cần theo dõi sát quá trình đàm phán.',
  },
];

// Thống kê tổng hợp
export function getPartnerStats() {
  const total = partners.length;
  const active = partners.filter((p) => p.isActive).length;
  const byCountry = partners.reduce<Record<string, number>>((acc, p) => {
    acc[p.country] = (acc[p.country] || 0) + 1;
    return acc;
  }, {});
  const byField = partners.reduce<Record<string, number>>((acc, p) => {
    acc[p.field] = (acc[p.field] || 0) + 1;
    return acc;
  }, {});
  const totalContractValue = partners.reduce((sum, p) => sum + p.totalContractValue, 0);
  const totalVisits = partners.reduce((sum, p) => sum + p.totalVisits, 0);
  return { total, active, byCountry, byField, totalContractValue, totalVisits };
}
