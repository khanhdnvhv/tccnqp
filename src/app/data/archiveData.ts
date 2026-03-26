// ============================================================
// KHO LƯU TRỮ & SỐ HÓA DỮ LIỆU — Mock Data (Theme 2)
// Epic 2.1: Số hóa + Tra cứu thông minh
// Epic 2.2: Quản lý tệp tin theo đoàn
// ============================================================

export type DocCategory = 'cong-van-den' | 'cong-van-di' | 'ho-chieu' | 'lich-trinh' | 'bien-ban' | 'hop-dong' | 'giay-phep' | 'khac';
export type FileType = 'pdf' | 'docx' | 'xlsx' | 'jpg' | 'png' | 'other';
export type OcrStatus = 'done' | 'pending' | 'scanning' | 'not-scanned';

export const docCategoryLabels: Record<DocCategory, string> = {
  'cong-van-den': 'Công văn đến',
  'cong-van-di': 'Công văn đi',
  'ho-chieu': 'Hộ chiếu / CMND',
  'lich-trinh': 'Lịch trình',
  'bien-ban': 'Biên bản',
  'hop-dong': 'Hợp đồng',
  'giay-phep': 'Giấy phép',
  'khac': 'Tài liệu khác',
};

export const docCategoryColors: Record<DocCategory, { bg: string; text: string; icon: string }> = {
  'cong-van-den': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: '📥' },
  'cong-van-di': { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-400', icon: '📤' },
  'ho-chieu': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: '🛂' },
  'lich-trinh': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: '📅' },
  'bien-ban': { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400', icon: '📋' },
  'hop-dong': { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', icon: '📝' },
  'giay-phep': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', icon: '📜' },
  'khac': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', icon: '📄' },
};

export interface ArchiveFile {
  id: string;
  name: string;
  fileType: FileType;
  category: DocCategory;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  ocrContent?: string;
  ocrStatus: OcrStatus;
  isScanned: boolean;
}

export interface DelegationFolder {
  id: string;
  folderName: string;
  partnerName: string;
  partnerShort: string;
  country: string;
  visitDate: string;
  purpose: string;
  attendees: number;
  files: ArchiveFile[];
  createdAt: string;
  createdBy: string;
  status: 'active' | 'closed' | 'archived';
}

export interface ArchiveDocument {
  id: string;
  number: string;
  title: string;
  year: number;
  date: string;
  category: DocCategory;
  sender: string;
  receiver: string;
  fileType: FileType;
  size: string;
  ocrContent: string;
  ocrStatus: OcrStatus;
  relatedPartner?: string;
  tags: string[];
  isScanned: boolean;
  pages?: number;
  classification?: 'mat' | 'bi-mat' | 'thuong';
}

// --- Dữ liệu kho tư liệu các năm (Epic 2.1) ---
export const archiveDocuments: ArchiveDocument[] = [
  // 2026
  {
    id: 'arc-2026-001',
    number: '1289/TCCNQP-HTN',
    title: 'Công văn đề nghị vào làm việc - Đoàn Viettel tháng 3/2026',
    year: 2026,
    date: '2026-03-08',
    category: 'cong-van-den',
    sender: 'Tập đoàn Viettel',
    receiver: 'Tổng cục CNQP',
    fileType: 'pdf',
    size: '1.4 MB',
    pages: 3,
    classification: 'thuong',
    ocrStatus: 'done',
    ocrContent: 'Kính gửi: Tổng cục Công nghiệp Quốc phòng. Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel) trân trọng đề nghị được cử đoàn cán bộ kỹ thuật gồm 08 người vào làm việc tại Tổng cục từ ngày 15/03/2026 đến ngày 17/03/2026 để triển khai nâng cấp hệ thống mạng an toàn giai đoạn 2. Danh sách đoàn kèm theo phụ lục 01. Đề nghị Tổng cục xem xét và có văn bản đồng ý trước ngày 12/03/2026.',
    relatedPartner: 'Viettel',
    tags: ['viettel', 'mạng an toàn', '2026', 'nâng cấp', 'kỹ thuật'],
    isScanned: false,
  },
  {
    id: 'arc-2026-002',
    number: '412/TCCNQP-VP',
    title: 'Công văn đồng ý tiếp đoàn Viettel - Tháng 3/2026',
    year: 2026,
    date: '2026-03-11',
    category: 'cong-van-di',
    sender: 'Tổng cục CNQP',
    receiver: 'Tập đoàn Viettel',
    fileType: 'pdf',
    size: '0.9 MB',
    pages: 2,
    classification: 'thuong',
    ocrStatus: 'done',
    ocrContent: 'Tổng cục Công nghiệp Quốc phòng đồng ý tiếp đoàn cán bộ kỹ thuật của Tập đoàn Viettel gồm 08 người từ ngày 15/03/2026 đến 17/03/2026. Đoàn cần xuất trình đầy đủ giấy tờ tùy thân, tuân thủ nội quy an ninh nội bộ. Liên hệ đầu mối: Thiếu tá Lê Hành Chính, ĐT: 0912.xxx.xxx.',
    relatedPartner: 'Viettel',
    tags: ['viettel', 'đồng ý', '2026', 'tiếp đoàn'],
    isScanned: false,
  },
  {
    id: 'arc-2026-003',
    number: 'BB/2026/VTT-17-3',
    title: 'Biên bản làm việc - Đoàn Viettel 15-17/03/2026',
    year: 2026,
    date: '2026-03-17',
    category: 'bien-ban',
    sender: 'Phòng Kỹ thuật',
    receiver: 'Lưu trữ',
    fileType: 'docx',
    size: '0.6 MB',
    pages: 5,
    classification: 'thuong',
    ocrStatus: 'done',
    ocrContent: 'BIÊN BẢN LÀM VIỆC. Hôm nay, ngày 15-17/03/2026, tại Phòng họp B2 và B3, Tổng cục CNQP tổ chức buổi làm việc với đoàn kỹ thuật Viettel (08 kỹ sư). Nội dung: Triển khai nâng cấp mạng an toàn Phase 2 theo Hợp đồng số 1189/HĐ/VTT-TCCNQP. Kết quả: Hoàn thành cài đặt thiết bị tại 4/7 điểm, đạt 57% tiến độ. Dự kiến hoàn thành Phase 2 vào tháng 6/2026. Hai bên thống nhất lịch kiểm tra vào ngày 20/06/2026.',
    relatedPartner: 'Viettel',
    tags: ['viettel', 'biên bản', '2026', 'mạng an toàn', 'phase 2'],
    isScanned: false,
  },
  {
    id: 'arc-2026-004',
    number: '156/TCCNQP-HTN',
    title: 'Công văn đề nghị - Đoàn DSDC demo VMS 2.0',
    year: 2026,
    date: '2026-03-13',
    category: 'cong-van-den',
    sender: 'Công ty DSDC',
    receiver: 'Tổng cục CNQP',
    fileType: 'pdf',
    size: '0.7 MB',
    pages: 2,
    classification: 'thuong',
    ocrStatus: 'done',
    ocrContent: 'Công ty CP Phát triển Phần mềm Quốc phòng (DSDC) kính đề nghị được trình diễn phiên bản VMS 2.0 Beta tại Tổng cục ngày 18/03/2026. Đoàn gồm 04 kỹ sư phần mềm. Hệ thống VMS 2.0 có các tính năng mới: nhận dạng khuôn mặt tích hợp, quản lý thẻ NFC thế hệ mới và tích hợp API với CSDL dân cư quốc gia.',
    relatedPartner: 'DSDC',
    tags: ['dsdc', 'VMS 2.0', '2026', 'demo', 'nhận dạng khuôn mặt', 'NFC'],
    isScanned: false,
  },
  {
    id: 'arc-2026-005',
    number: '89/TCCNQP-HTN',
    title: 'Công văn đề nghị - Đoàn Hanwha Aerospace tháng 1/2026',
    year: 2026,
    date: '2026-01-15',
    category: 'cong-van-den',
    sender: 'Hanwha Aerospace Co., Ltd.',
    receiver: 'Tổng cục CNQP',
    fileType: 'pdf',
    size: '2.9 MB',
    pages: 4,
    classification: 'thuong',
    ocrStatus: 'done',
    ocrContent: 'Hanwha Aerospace Co., Ltd. respectfully requests permission for a delegation of 9 executives and technical experts to visit the General Department on January 22, 2026. Purpose: Discuss technology transfer agreement for K9 Thunder self-propelled howitzer production in Vietnam. The delegation includes CEO Mr. Kim Seung-yun, CTO Mr. Park Ji-hoon and 7 technical specialists.',
    relatedPartner: 'Hanwha Aerospace',
    tags: ['hanwha', 'hàn quốc', 'K9', 'pháo tự hành', '2026', 'chuyển giao công nghệ'],
    isScanned: false,
  },
  // 2025
  {
    id: 'arc-2025-001',
    number: '567/TCCNQP-HTN',
    title: 'Công văn đề nghị - Đoàn MICI tháng 7/2025',
    year: 2025,
    date: '2025-07-08',
    category: 'cong-van-den',
    sender: 'Military Industry Corporation Indonesia (MICI)',
    receiver: 'Tổng cục CNQP',
    fileType: 'pdf',
    size: '1.8 MB',
    pages: 3,
    classification: 'thuong',
    ocrStatus: 'done',
    ocrContent: 'MICI (Military Industry Corporation Indonesia) requests permission for 5-member delegation visit on July 15, 2025. Purpose: Explore joint production opportunities for infantry weapons and ammunition. Proposed cooperation: Share manufacturing technology for 5.56mm and 7.62mm ammunition. Indonesian delegation holds standard diplomatic passports.',
    relatedPartner: 'MICI',
    tags: ['mici', 'indonesia', 'đạn dược', '2025', 'hợp tác sản xuất'],
    isScanned: false,
  },
  {
    id: 'arc-2025-002',
    number: 'HĐ/2025/MICI-VN-002',
    title: 'Biên bản ghi nhớ hợp tác - MICI và Tổng cục CNQP',
    year: 2025,
    date: '2025-07-15',
    category: 'hop-dong',
    sender: 'MICI + Tổng cục CNQP',
    receiver: 'Lưu trữ',
    fileType: 'pdf',
    size: '4.1 MB',
    pages: 12,
    classification: 'mat',
    ocrStatus: 'done',
    ocrContent: 'MEMORANDUM OF UNDERSTANDING ON DEFENCE INDUSTRY COOPERATION. This MOU establishes a framework for joint production of small arms ammunition between MICI and the General Department of Defence Industry of Vietnam. Key terms: 5-year cooperation period, technology sharing for 5.56mm SS109 and 7.62x39mm, joint quality control protocols, export restriction clauses per MTCR.',
    relatedPartner: 'MICI',
    tags: ['mici', 'MOU', 'hợp tác', '2025', 'đạn dược', '5.56mm'],
    isScanned: false,
  },
  {
    id: 'arc-2025-003',
    number: '445/TCCNQP-HTN',
    title: 'Công văn đề nghị - Đoàn Thales Group tháng 11/2025',
    year: 2025,
    date: '2025-11-05',
    category: 'cong-van-den',
    sender: 'Thales Group S.A.',
    receiver: 'Tổng cục CNQP',
    fileType: 'pdf',
    size: '2.2 MB',
    pages: 3,
    classification: 'thuong',
    ocrStatus: 'pending',
    ocrContent: '',
    relatedPartner: 'Thales',
    tags: ['thales', 'pháp', 'radar', '2025', 'hệ thống phòng thủ'],
    isScanned: true,
  },
  {
    id: 'arc-2025-004',
    number: 'GP/2025/AN-112',
    title: 'Giấy phép vào cơ quan - Đoàn Thales 12/11/2025',
    year: 2025,
    date: '2025-11-10',
    category: 'giay-phep',
    sender: 'Phòng An ninh',
    receiver: 'Bảo vệ cổng',
    fileType: 'pdf',
    size: '0.4 MB',
    pages: 1,
    classification: 'thuong',
    ocrStatus: 'done',
    ocrContent: 'GIẤY PHÉP VÀO CƠ QUAN. Cho phép đoàn 07 người thuộc Thales Group vào làm việc tại khu A1 và phòng họp C4 từ 08:00 đến 17:00 ngày 12/11/2025. Cần xuất trình giấy phép này kèm CMND/Hộ chiếu. Không được đưa thiết bị chụp ảnh vào khu A1.',
    relatedPartner: 'Thales',
    tags: ['thales', 'giấy phép', '2025', 'an ninh'],
    isScanned: false,
  },
  // 2024
  {
    id: 'arc-2024-001',
    number: '1245/TCCNQP-HTN',
    title: 'Công văn đề nghị vào làm việc - Đoàn Viettel tháng 3/2024',
    year: 2024,
    date: '2024-03-01',
    category: 'cong-van-den',
    sender: 'Tập đoàn Viettel',
    receiver: 'Tổng cục CNQP',
    fileType: 'pdf',
    size: '1.2 MB',
    pages: 3,
    classification: 'thuong',
    ocrStatus: 'done',
    ocrContent: 'Kính gửi: Tổng cục Công nghiệp Quốc phòng. Tập đoàn Viettel trân trọng đề nghị được cử đoàn 08 người vào làm việc từ 15-17/03/2024 để triển khai hợp đồng cung cấp hệ thống thông tin liên lạc quân sự VTQS-5G. Danh sách kèm phụ lục.',
    relatedPartner: 'Viettel',
    tags: ['viettel', 'thông tin liên lạc', '2024', 'VTQS-5G'],
    isScanned: false,
  },
  {
    id: 'arc-2024-002',
    number: '356/TCCNQP-VP',
    title: 'Công văn đồng ý tiếp đoàn Viettel - Tháng 3/2024',
    year: 2024,
    date: '2024-03-05',
    category: 'cong-van-di',
    sender: 'Tổng cục CNQP',
    receiver: 'Tập đoàn Viettel',
    fileType: 'pdf',
    size: '0.8 MB',
    pages: 2,
    classification: 'thuong',
    ocrStatus: 'done',
    ocrContent: 'Tổng cục đồng ý tiếp đoàn kỹ thuật Viettel (08 người) từ 15/03/2024. Yêu cầu đoàn xuất trình đầy đủ giấy tờ tùy thân và tuân thủ nội quy an ninh.',
    relatedPartner: 'Viettel',
    tags: ['viettel', 'đồng ý', '2024'],
    isScanned: false,
  },
  {
    id: 'arc-2024-003',
    number: 'BB/2024/VTT-15-3',
    title: 'Biên bản làm việc - Đoàn Viettel 15/03/2024',
    year: 2024,
    date: '2024-03-15',
    category: 'bien-ban',
    sender: 'Phòng Kỹ thuật',
    receiver: 'Lưu trữ',
    fileType: 'docx',
    size: '0.5 MB',
    pages: 4,
    classification: 'thuong',
    ocrStatus: 'done',
    ocrContent: 'BIÊN BẢN LÀM VIỆC ngày 15/03/2024 tại Phòng họp B2. Nội dung: Triển khai giai đoạn 1 hệ thống VTQS-5G. Kết quả: Hoàn thành lắp đặt 60% thiết bị. Các bên thống nhất tiếp tục giai đoạn 2 vào tháng 6/2024.',
    relatedPartner: 'Viettel',
    tags: ['viettel', 'biên bản', '2024', 'VTQS-5G'],
    isScanned: true,
  },
  // 2023
  {
    id: 'arc-2023-001',
    number: '890/TCCNQP-HTN',
    title: 'Công văn đề nghị - Đoàn Rosoboronexport tháng 4/2023',
    year: 2023,
    date: '2023-04-02',
    category: 'cong-van-den',
    sender: 'Rosoboronexport JSC',
    receiver: 'Tổng cục CNQP',
    fileType: 'pdf',
    size: '3.1 MB',
    pages: 5,
    classification: 'thuong',
    ocrStatus: 'done',
    ocrContent: 'REQUEST FOR VISIT. Rosoboronexport JSC requests permission for a technical delegation of 10 specialists to visit the General Department from April 10 to 12, 2023. Purpose: Initial technical consultations for the S-300PMU2 contract negotiations. All visitors hold diplomatic passports.',
    relatedPartner: 'Rosoboronexport',
    tags: ['rosoboronexport', 'nga', 'S-300', '2023', 'phòng không'],
    isScanned: false,
  },
  {
    id: 'arc-2023-002',
    number: 'HĐ/2023/ROE-VN-005',
    title: 'Hợp đồng cung cấp hệ thống phòng không S-300PMU2',
    year: 2023,
    date: '2023-04-10',
    category: 'hop-dong',
    sender: 'Rosoboronexport JSC + Tổng cục CNQP',
    receiver: 'Lưu trữ',
    fileType: 'pdf',
    size: '8.4 MB',
    pages: 48,
    classification: 'bi-mat',
    ocrStatus: 'done',
    ocrContent: 'HỢP ĐỒNG MUA BÁN THIẾT BỊ QUỐC PHÒNG. Số CTR-2023-ROE-VN-005. Giữa Rosoboronexport JSC (Bên A) và Tổng cục CNQP - BQP Việt Nam (Bên B). Đối tượng: Hệ thống tên lửa phòng không S-300PMU2 gồm đài radar 64N6E2, bệ phóng 5P85SE2 và đạn tên lửa 48N6E3. Giá trị theo phụ lục bảo mật. Thời hạn giao hàng: 2024-2028.',
    relatedPartner: 'Rosoboronexport',
    tags: ['rosoboronexport', 'S-300PMU2', 'hợp đồng', '2023', 'phòng không', 'tên lửa'],
    isScanned: false,
  },
  {
    id: 'arc-2023-003',
    number: 'BB/2023/ROE-10-4',
    title: 'Biên bản đàm phán - Đoàn Rosoboronexport 10/04/2023',
    year: 2023,
    date: '2023-04-10',
    category: 'bien-ban',
    sender: 'Phòng HTQT',
    receiver: 'Lưu trữ',
    fileType: 'pdf',
    size: '2.2 MB',
    pages: 8,
    classification: 'mat',
    ocrStatus: 'done',
    ocrContent: 'BIÊN BẢN ĐÀM PHÁN ngày 10-12/04/2023. Phiên làm việc với phái đoàn Rosoboronexport. Các nội dung thống nhất: (1) Phương án thanh toán theo giai đoạn, (2) Lịch bàn giao thiết bị 2024-2028, (3) Đào tạo chuyên gia vận hành tại Nga 6 tháng. Vấn đề còn chờ giải quyết: phương án vận chuyển đặc biệt.',
    relatedPartner: 'Rosoboronexport',
    tags: ['rosoboronexport', 'đàm phán', '2023', 'S-300'],
    isScanned: false,
  },
  // 2022
  {
    id: 'arc-2022-001',
    number: '567/TCCNQP-HTN',
    title: 'Công văn đề nghị - Đoàn Elbit Systems tháng 11/2022',
    year: 2022,
    date: '2022-11-10',
    category: 'cong-van-den',
    sender: 'Elbit Systems Ltd.',
    receiver: 'Tổng cục CNQP',
    fileType: 'pdf',
    size: '2.0 MB',
    pages: 3,
    classification: 'thuong',
    ocrStatus: 'done',
    ocrContent: 'Elbit Systems Ltd. requests permission for a delegation of 6 representatives for a technical presentation of Night Vision Systems NVG-7000 series and thermal imaging solutions. Proposed visit: November 20-21, 2022.',
    relatedPartner: 'Elbit Systems',
    tags: ['elbit', 'israel', 'nhìn đêm', 'NVG-7000', '2022'],
    isScanned: false,
  },
  {
    id: 'arc-2022-002',
    number: 'HĐ/2022/ELBIT-VN-001',
    title: 'Hợp đồng cung cấp hệ thống quan sát ban đêm NVG-7000',
    year: 2022,
    date: '2022-11-20',
    category: 'hop-dong',
    sender: 'Elbit Systems + Tổng cục CNQP',
    receiver: 'Lưu trữ',
    fileType: 'pdf',
    size: '5.2 MB',
    pages: 32,
    classification: 'mat',
    ocrStatus: 'done',
    ocrContent: 'CONTRACT FOR SUPPLY OF NIGHT VISION SYSTEMS. Contract No: CTR-2022-ELBIT-VN-001. NVG-7000 night goggles, INSIS-F thermal cameras and handheld night vision devices for special operations units. Delivery period: 2023-2024.',
    relatedPartner: 'Elbit Systems',
    tags: ['elbit', 'NVG-7000', 'hợp đồng', '2022', 'đặc nhiệm', 'nhìn đêm'],
    isScanned: false,
  },
  // 2021
  {
    id: 'arc-2021-001',
    number: '123/TCCNQP-HTN',
    title: 'Công văn scan - Đề nghị hợp tác kỹ thuật năm 2021 (Bản giấy)',
    year: 2021,
    date: '2021-05-15',
    category: 'cong-van-den',
    sender: 'GADEF',
    receiver: 'Tổng cục CNQP',
    fileType: 'jpg',
    size: '4.8 MB',
    pages: 4,
    classification: 'thuong',
    ocrStatus: 'done',
    ocrContent: 'GADEF kính đề nghị hợp tác nghiên cứu phát triển vật liệu composite ứng dụng trong chế tạo thiết bị quân sự nhẹ. Đề xuất thành lập nhóm nghiên cứu liên kết 15 kỹ sư trong 24 tháng.',
    relatedPartner: 'GADEF',
    tags: ['gadef', 'composite', 'nghiên cứu', '2021', 'vật liệu'],
    isScanned: true,
  },
  {
    id: 'arc-2021-002',
    number: 'HĐ/2021/GADEF-VN-003',
    title: 'Hợp đồng nghiên cứu vật liệu composite - GADEF',
    year: 2021,
    date: '2021-08-20',
    category: 'hop-dong',
    sender: 'GADEF + Tổng cục CNQP',
    receiver: 'Lưu trữ',
    fileType: 'pdf',
    size: '3.3 MB',
    pages: 18,
    classification: 'thuong',
    ocrStatus: 'done',
    ocrContent: 'HỢP ĐỒNG NGHIÊN CỨU VÀ PHÁT TRIỂN. Hợp tác nghiên cứu vật liệu composite siêu nhẹ (carbon fiber composite) cho ứng dụng quân sự: vỏ giáp cá nhân, thân xe bọc thép nhẹ. Kinh phí: 45 tỷ đồng. Thời hạn 24 tháng. Bản quyền sở hữu trí tuệ thuộc hai bên theo tỷ lệ 60/40.',
    relatedPartner: 'GADEF',
    tags: ['gadef', 'composite', 'hợp đồng', '2021', 'carbon fiber', 'giáp'],
    isScanned: false,
  },
  // 2020
  {
    id: 'arc-2020-001',
    number: '78/TCCNQP-HTN',
    title: 'Hồ sơ năng lực GADEF - Lần hợp tác đầu tiên 2020 (Scan)',
    year: 2020,
    date: '2020-03-10',
    category: 'khac',
    sender: 'GADEF',
    receiver: 'Phòng HTQT',
    fileType: 'pdf',
    size: '12.5 MB',
    pages: 25,
    classification: 'thuong',
    ocrStatus: 'done',
    ocrContent: 'HỒ SƠ NĂNG LỰC DOANH NGHIỆP - GADEF. Thành lập năm 1994. Vốn điều lệ: 5.000 tỷ đồng. Lĩnh vực: Sản xuất vũ khí hạng nhẹ, đạn dược, trang thiết bị quân sự. Nhà máy: Z111, Z113, Z121, Z125. Xuất khẩu sang 12 quốc gia. ISO 9001:2015.',
    relatedPartner: 'GADEF',
    tags: ['gadef', 'hồ sơ năng lực', '2020', 'sản xuất', 'vũ khí'],
    isScanned: true,
  },
];

// --- Thư mục tệp đính kèm theo đoàn (Epic 2.2) ---
export const delegationFolders: DelegationFolder[] = [
  {
    id: 'folder-001',
    folderName: 'Đoàn - Viettel - 15/03/2026',
    partnerName: 'Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel)',
    partnerShort: 'Viettel',
    country: 'Việt Nam',
    visitDate: '2026-03-15',
    purpose: 'Triển khai nâng cấp mạng an toàn - Phase 2',
    attendees: 8,
    status: 'active',
    createdAt: '2026-03-10',
    createdBy: 'Nguyễn Quản Trị',
    files: [
      { id: 'f-001-1', name: '1289_TCCNQP_CV_Den_Viettel_08032026.pdf', fileType: 'pdf', category: 'cong-van-den', size: '1.4 MB', uploadDate: '2026-03-08', uploadedBy: 'Nguyễn Quản Trị', ocrStatus: 'done', isScanned: false, ocrContent: 'Công văn đề nghị vào làm việc ngày 15/03/2026 của Tập đoàn Viettel, gồm 08 kỹ sư mạng an toàn' },
      { id: 'f-001-2', name: '412_TCCNQP_CV_Di_DongY_Viettel.pdf', fileType: 'pdf', category: 'cong-van-di', size: '0.9 MB', uploadDate: '2026-03-11', uploadedBy: 'Trần Thư Ký', ocrStatus: 'done', isScanned: false, ocrContent: 'Công văn đồng ý tiếp đoàn Viettel ngày 15/03/2026' },
      { id: 'f-001-3', name: 'LichTrinh_Viettel_15032026.docx', fileType: 'docx', category: 'lich-trinh', size: '0.3 MB', uploadDate: '2026-03-13', uploadedBy: 'Lê Hành Chính', ocrStatus: 'not-scanned', isScanned: false },
      { id: 'f-001-4', name: 'HoChieu_TaoDucThang.jpg', fileType: 'jpg', category: 'ho-chieu', size: '2.1 MB', uploadDate: '2026-03-14', uploadedBy: 'Phạm An Ninh', ocrStatus: 'done', isScanned: true, ocrContent: 'Hộ chiếu Tào Đức Thắng, SN: 15/03/1975, số HC: B5012345, cấp ngày 01/01/2022' },
      { id: 'f-001-5', name: 'HoChieu_NguyenVanKhoa.jpg', fileType: 'jpg', category: 'ho-chieu', size: '1.9 MB', uploadDate: '2026-03-14', uploadedBy: 'Phạm An Ninh', ocrStatus: 'done', isScanned: true, ocrContent: 'Hộ chiếu Nguyễn Văn Khoa, SN: 22/07/1985, số HC: B4098765' },
      { id: 'f-001-6', name: 'BienBan_NghiemThu_Phase1.pdf', fileType: 'pdf', category: 'bien-ban', size: '1.7 MB', uploadDate: '2026-03-17', uploadedBy: 'Nguyễn Quản Trị', ocrStatus: 'done', isScanned: false, ocrContent: 'Biên bản nghiệm thu Phase 1 nâng cấp mạng an toàn TCCNQP - Viettel, đạt 57% tiến độ' },
    ],
  },
  {
    id: 'folder-002',
    folderName: 'Đoàn - DSDC - 18/03/2026',
    partnerName: 'Công ty CP Phát triển Phần mềm Quốc phòng (DSDC)',
    partnerShort: 'DSDC',
    country: 'Việt Nam',
    visitDate: '2026-03-18',
    purpose: 'Demo hệ thống VMS 2.0 beta',
    attendees: 4,
    status: 'active',
    createdAt: '2026-03-15',
    createdBy: 'Lê Hành Chính',
    files: [
      { id: 'f-002-1', name: 'CV_Den_DSDC_DemoVMS2.pdf', fileType: 'pdf', category: 'cong-van-den', size: '0.7 MB', uploadDate: '2026-03-13', uploadedBy: 'Lê Hành Chính', ocrStatus: 'done', isScanned: false, ocrContent: 'Công văn đề nghị demo VMS 2.0 của công ty DSDC' },
      { id: 'f-002-2', name: 'CV_Di_DongY_DSDC.pdf', fileType: 'pdf', category: 'cong-van-di', size: '0.5 MB', uploadDate: '2026-03-16', uploadedBy: 'Trần Thư Ký', ocrStatus: 'done', isScanned: false },
      { id: 'f-002-3', name: 'LichTrinh_DSDC_18032026.docx', fileType: 'docx', category: 'lich-trinh', size: '0.2 MB', uploadDate: '2026-03-16', uploadedBy: 'Lê Hành Chính', ocrStatus: 'not-scanned', isScanned: false },
      { id: 'f-002-4', name: 'BienBan_Demo_VMS2_Approved.pdf', fileType: 'pdf', category: 'bien-ban', size: '1.1 MB', uploadDate: '2026-03-19', uploadedBy: 'Nguyễn Quản Trị', ocrStatus: 'done', isScanned: false, ocrContent: 'Biên bản demo VMS 2.0 - phê duyệt tiếp tục phát triển giai đoạn 3' },
    ],
  },
  {
    id: 'folder-003',
    folderName: 'Đoàn - Hanwha Aerospace - 22/01/2026',
    partnerName: 'Hanwha Aerospace Co., Ltd.',
    partnerShort: 'Hanwha Aerospace',
    country: 'Hàn Quốc',
    visitDate: '2026-01-22',
    purpose: 'Thảo luận chuyển giao công nghệ pháo tự hành K9',
    attendees: 9,
    status: 'closed',
    createdAt: '2026-01-18',
    createdBy: 'Trần Thư Ký',
    files: [
      { id: 'f-003-1', name: 'CV_Den_Hanwha_ChuyenGiaoK9.pdf', fileType: 'pdf', category: 'cong-van-den', size: '2.8 MB', uploadDate: '2026-01-15', uploadedBy: 'Trần Thư Ký', ocrStatus: 'done', isScanned: false },
      { id: 'f-003-2', name: 'CV_Di_DongY_Hanwha.pdf', fileType: 'pdf', category: 'cong-van-di', size: '0.8 MB', uploadDate: '2026-01-20', uploadedBy: 'Trần Thư Ký', ocrStatus: 'done', isScanned: false },
      { id: 'f-003-3', name: 'HoChieu_DoanHanwha_9Nguoi.pdf', fileType: 'pdf', category: 'ho-chieu', size: '7.3 MB', uploadDate: '2026-01-21', uploadedBy: 'Phạm An Ninh', ocrStatus: 'done', isScanned: true, ocrContent: 'Hộ chiếu 9 thành viên đoàn Hanwha Aerospace, quốc tịch Hàn Quốc' },
      { id: 'f-003-4', name: 'LOI_HWA_TCCNQP_K9A1.pdf', fileType: 'pdf', category: 'hop-dong', size: '3.1 MB', uploadDate: '2026-01-22', uploadedBy: 'Nguyễn Quản Trị', ocrStatus: 'done', isScanned: false, ocrContent: 'Letter of Intent hợp tác sản xuất pháo tự hành K9A1 trong nước' },
      { id: 'f-003-5', name: 'BienBan_DamPhan_K9_22012026.docx', fileType: 'docx', category: 'bien-ban', size: '0.9 MB', uploadDate: '2026-01-23', uploadedBy: 'Nguyễn Quản Trị', ocrStatus: 'not-scanned', isScanned: false },
    ],
  },
  {
    id: 'folder-004',
    folderName: 'Đoàn - Thales Group - 12/11/2025',
    partnerName: 'Thales Group S.A.',
    partnerShort: 'Thales',
    country: 'Pháp',
    visitDate: '2025-11-12',
    purpose: 'Giới thiệu hệ thống radar phòng thủ bờ biển GM403',
    attendees: 7,
    status: 'closed',
    createdAt: '2025-11-05',
    createdBy: 'Trần Thư Ký',
    files: [
      { id: 'f-004-1', name: 'CV_Den_Thales_RadarGM403.pdf', fileType: 'pdf', category: 'cong-van-den', size: '2.2 MB', uploadDate: '2025-11-05', uploadedBy: 'Trần Thư Ký', ocrStatus: 'pending', isScanned: true },
      { id: 'f-004-2', name: 'CV_Di_DongY_Thales.pdf', fileType: 'pdf', category: 'cong-van-di', size: '0.6 MB', uploadDate: '2025-11-08', uploadedBy: 'Trần Thư Ký', ocrStatus: 'done', isScanned: false },
      { id: 'f-004-3', name: 'GP_VaoCQuan_Thales_12112025.pdf', fileType: 'pdf', category: 'giay-phep', size: '0.4 MB', uploadDate: '2025-11-10', uploadedBy: 'Phạm An Ninh', ocrStatus: 'done', isScanned: false, ocrContent: 'Giấy phép vào cơ quan ngày 12/11/2025 cho đoàn Thales 7 người' },
      { id: 'f-004-4', name: 'HoChieu_DoanThales.pdf', fileType: 'pdf', category: 'ho-chieu', size: '5.1 MB', uploadDate: '2025-11-10', uploadedBy: 'Phạm An Ninh', ocrStatus: 'done', isScanned: true, ocrContent: 'Hộ chiếu 7 thành viên đoàn Thales Group, quốc tịch Pháp' },
      { id: 'f-004-5', name: 'TaiLieu_GM403_TechnicalBrief.pdf', fileType: 'pdf', category: 'khac', size: '8.7 MB', uploadDate: '2025-11-12', uploadedBy: 'Nguyễn Quản Trị', ocrStatus: 'not-scanned', isScanned: false },
      { id: 'f-004-6', name: 'BienBan_ThamQuan_GM403.pdf', fileType: 'pdf', category: 'bien-ban', size: '1.4 MB', uploadDate: '2025-11-13', uploadedBy: 'Nguyễn Quản Trị', ocrStatus: 'done', isScanned: false, ocrContent: 'Biên bản tham quan giới thiệu hệ thống radar GM403 - đánh giá tích cực, cần nghiên cứu thêm' },
    ],
  },
  {
    id: 'folder-005',
    folderName: 'Đoàn - MICI - 15/07/2025',
    partnerName: 'Military Industry Corporation Indonesia (MICI)',
    partnerShort: 'MICI',
    country: 'Indonesia',
    visitDate: '2025-07-15',
    purpose: 'Khảo sát hợp tác sản xuất đạn dược',
    attendees: 5,
    status: 'closed',
    createdAt: '2025-07-08',
    createdBy: 'Lê Hành Chính',
    files: [
      { id: 'f-005-1', name: 'CV_Den_MICI_DanDuoc.pdf', fileType: 'pdf', category: 'cong-van-den', size: '1.8 MB', uploadDate: '2025-07-08', uploadedBy: 'Lê Hành Chính', ocrStatus: 'done', isScanned: false },
      { id: 'f-005-2', name: 'CV_Di_DongY_MICI.pdf', fileType: 'pdf', category: 'cong-van-di', size: '0.7 MB', uploadDate: '2025-07-11', uploadedBy: 'Trần Thư Ký', ocrStatus: 'done', isScanned: false },
      { id: 'f-005-3', name: 'HoChieu_DoanMICI.pdf', fileType: 'pdf', category: 'ho-chieu', size: '3.2 MB', uploadDate: '2025-07-14', uploadedBy: 'Phạm An Ninh', ocrStatus: 'done', isScanned: true },
      { id: 'f-005-4', name: 'MOU_MICI_TCCNQP_2025.pdf', fileType: 'pdf', category: 'hop-dong', size: '4.1 MB', uploadDate: '2025-07-15', uploadedBy: 'Nguyễn Quản Trị', ocrStatus: 'done', isScanned: false, ocrContent: 'Biên bản ghi nhớ hợp tác sản xuất đạn dược 5.56mm và 7.62mm' },
      { id: 'f-005-5', name: 'BienBan_KyKet_MICI.pdf', fileType: 'pdf', category: 'bien-ban', size: '1.5 MB', uploadDate: '2025-07-16', uploadedBy: 'Nguyễn Quản Trị', ocrStatus: 'done', isScanned: false },
    ],
  },
  {
    id: 'folder-006',
    folderName: 'Đoàn - Rosoboronexport - 10/04/2023',
    partnerName: 'Rosoboronexport JSC',
    partnerShort: 'Rosoboronexport',
    country: 'Nga',
    visitDate: '2023-04-10',
    purpose: 'Đàm phán và ký kết hợp đồng S-300PMU2',
    attendees: 10,
    status: 'archived',
    createdAt: '2023-04-05',
    createdBy: 'Trần Thư Ký',
    files: [
      { id: 'f-006-1', name: '890_TCCNQP_CV_Den_ROE.pdf', fileType: 'pdf', category: 'cong-van-den', size: '3.1 MB', uploadDate: '2023-04-02', uploadedBy: 'Trần Thư Ký', ocrStatus: 'done', isScanned: false },
      { id: 'f-006-2', name: '234_TCCNQP_CV_Di_ROE_DongY.pdf', fileType: 'pdf', category: 'cong-van-di', size: '0.7 MB', uploadDate: '2023-04-05', uploadedBy: 'Trần Thư Ký', ocrStatus: 'done', isScanned: false },
      { id: 'f-006-3', name: 'DanhSach_HoChieu_Doan_ROE.pdf', fileType: 'pdf', category: 'ho-chieu', size: '5.6 MB', uploadDate: '2023-04-08', uploadedBy: 'Phạm An Ninh', ocrStatus: 'done', isScanned: true, ocrContent: 'Danh sách 10 hộ chiếu ngoại giao đoàn Rosoboronexport' },
      { id: 'f-006-4', name: 'LichTrinh_ROE_10042023.xlsx', fileType: 'xlsx', category: 'lich-trinh', size: '0.4 MB', uploadDate: '2023-04-08', uploadedBy: 'Lê Hành Chính', ocrStatus: 'not-scanned', isScanned: false },
      { id: 'f-006-5', name: 'HopDong_CTR2023ROEVN005.pdf', fileType: 'pdf', category: 'hop-dong', size: '8.4 MB', uploadDate: '2023-04-10', uploadedBy: 'Nguyễn Quản Trị', ocrStatus: 'done', isScanned: false, ocrContent: 'Hợp đồng mua sắm hệ thống tên lửa phòng không S-300PMU2' },
      { id: 'f-006-6', name: 'BienBan_DamPhan_10042023.pdf', fileType: 'pdf', category: 'bien-ban', size: '2.2 MB', uploadDate: '2023-04-11', uploadedBy: 'Nguyễn Quản Trị', ocrStatus: 'done', isScanned: false },
    ],
  },
  {
    id: 'folder-007',
    folderName: 'Đoàn - Elbit Systems - 20/11/2022',
    partnerName: 'Elbit Systems Ltd.',
    partnerShort: 'Elbit Systems',
    country: 'Israel',
    visitDate: '2022-11-20',
    purpose: 'Ký kết hợp đồng thiết bị nhìn đêm NVG-7000',
    attendees: 6,
    status: 'archived',
    createdAt: '2022-11-15',
    createdBy: 'Trần Thư Ký',
    files: [
      { id: 'f-007-1', name: 'CV_Den_Elbit_NVG7000.pdf', fileType: 'pdf', category: 'cong-van-den', size: '2.0 MB', uploadDate: '2022-11-10', uploadedBy: 'Trần Thư Ký', ocrStatus: 'done', isScanned: false },
      { id: 'f-007-2', name: 'HoChieu_DoanElbit.pdf', fileType: 'pdf', category: 'ho-chieu', size: '4.5 MB', uploadDate: '2022-11-18', uploadedBy: 'Phạm An Ninh', ocrStatus: 'done', isScanned: true },
      { id: 'f-007-3', name: 'HopDong_CTR2022ELBITVN001.pdf', fileType: 'pdf', category: 'hop-dong', size: '5.2 MB', uploadDate: '2022-11-20', uploadedBy: 'Nguyễn Quản Trị', ocrStatus: 'done', isScanned: false },
      { id: 'f-007-4', name: 'BienBan_KyKet_20112022.pdf', fileType: 'pdf', category: 'bien-ban', size: '1.8 MB', uploadDate: '2022-11-21', uploadedBy: 'Nguyễn Quản Trị', ocrStatus: 'done', isScanned: false },
    ],
  },
  {
    id: 'folder-008',
    folderName: 'Đoàn - GADEF - 15/08/2021',
    partnerName: 'Tổng công ty Công nghiệp Quốc phòng (GADEF)',
    partnerShort: 'GADEF',
    country: 'Việt Nam',
    visitDate: '2021-08-15',
    purpose: 'Ký kết hợp đồng nghiên cứu vật liệu composite',
    attendees: 12,
    status: 'archived',
    createdAt: '2021-08-10',
    createdBy: 'Nguyễn Quản Trị',
    files: [
      { id: 'f-008-1', name: 'CV_Den_GADEF_HopTacComposite.jpg', fileType: 'jpg', category: 'cong-van-den', size: '4.8 MB', uploadDate: '2021-05-15', uploadedBy: 'Lê Hành Chính', ocrStatus: 'done', isScanned: true, ocrContent: 'GADEF kính đề nghị hợp tác nghiên cứu composite' },
      { id: 'f-008-2', name: 'HopDong_GADEF_Composite_2021.pdf', fileType: 'pdf', category: 'hop-dong', size: '3.3 MB', uploadDate: '2021-08-20', uploadedBy: 'Nguyễn Quản Trị', ocrStatus: 'done', isScanned: false, ocrContent: 'Hợp đồng nghiên cứu carbon fiber composite cho ứng dụng quân sự' },
      { id: 'f-008-3', name: 'LichTrinh_GADEF_15082021.docx', fileType: 'docx', category: 'lich-trinh', size: '0.3 MB', uploadDate: '2021-08-13', uploadedBy: 'Lê Hành Chính', ocrStatus: 'not-scanned', isScanned: false },
    ],
  },
];

export function getArchiveStats() {
  const totalDocs = archiveDocuments.length;
  const scannedDocs = archiveDocuments.filter((d) => d.isScanned).length;
  const ocrDone = archiveDocuments.filter((d) => d.ocrStatus === 'done').length;
  const totalFolders = delegationFolders.length;
  const totalFiles = delegationFolders.reduce((s, f) => s + f.files.length, 0);
  const totalSize = delegationFolders.reduce((s, f) =>
    s + f.files.reduce((fs, file) => {
      const mb = parseFloat(file.size);
      return fs + (isNaN(mb) ? 0 : mb);
    }, 0),
  0);
  const byYear = archiveDocuments.reduce<Record<number, number>>((acc, d) => {
    acc[d.year] = (acc[d.year] || 0) + 1;
    return acc;
  }, {});
  return { totalDocs, scannedDocs, ocrDone, totalFolders, totalFiles, totalSize: Math.round(totalSize * 10) / 10, byYear };
}

export type SortField = 'date' | 'name' | 'size' | 'year';
export type SortDir = 'asc' | 'desc';

export function sortDocuments(docs: ArchiveDocument[], field: SortField, dir: SortDir) {
  return [...docs].sort((a, b) => {
    let cmp = 0;
    if (field === 'date') cmp = a.date.localeCompare(b.date);
    else if (field === 'name') cmp = a.title.localeCompare(b.title, 'vi');
    else if (field === 'year') cmp = a.year - b.year;
    else if (field === 'size') {
      cmp = parseFloat(a.size) - parseFloat(b.size);
    }
    return dir === 'desc' ? -cmp : cmp;
  });
}
