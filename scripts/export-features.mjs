/**
 * Script xuất Danh sách tính năng hệ thống VMS 2.0
 * Chạy: node scripts/export-features.mjs
 * Output: DANH_SACH_TINH_NANG.xlsx
 */
import XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '..', 'DANH_SACH_TINH_NANG.xlsx');

// V = có quyền, '' = không
const V = '✔';

// ── DATA ──
// [STT, Phân hệ, Nhóm tính năng, Tên tính năng, Thủ trưởng TC, Cán bộ QHQT, Ghi chú]
const rows = [
  // ─── A. TỔNG QUAN ───
  ['A',     'Tổng quan (Dashboard)', '', '', V, V, ''],
  ['A.1',   '', 'Xem thông tin tổng quan', '', V, V, ''],
  ['A.1.1', '', '', 'Xem số liệu thống kê đoàn vào/ra theo năm', V, V, 'KPI cards'],
  ['A.1.2', '', '', 'Xem số đoàn đang làm thủ tục', V, V, ''],
  ['A.1.3', '', '', 'Xem số đoàn đã phê duyệt', V, V, ''],
  ['A.1.4', '', '', 'Xem cảnh báo đoàn sắp vào chưa có VB đồng ý', V, V, 'Tự động 1-3 ngày'],
  ['A.1.5', '', '', 'Xem danh sách đoàn sắp tới (5 đoàn gần nhất)', V, V, 'Hiển thị countdown'],
  ['A.1.6', '', '', 'Xem tổng hợp số liệu cuối trang', V, V, ''],
  ['A.2',   '', 'Lịch trực quan', '', V, V, ''],
  ['A.2.1', '', '', 'Xem lịch theo tháng (Month view)', V, V, 'Mã màu trạng thái'],
  ['A.2.2', '', '', 'Xem lịch theo tuần (Week view)', V, V, 'Mã màu trạng thái'],
  ['A.2.3', '', '', 'Chuyển tháng trước/sau', V, V, ''],
  ['A.2.4', '', '', 'Click ngày để xem danh sách đoàn trong ngày', V, V, ''],
  ['A.2.5', '', '', 'Click đoàn trên lịch để xem chi tiết', V, V, 'Mở modal'],
  ['A.2.6', '', '', 'Xem mã màu: Vàng=Thủ tục, Xanh=Đã duyệt, Xám=Hoàn thành', V, V, ''],
  ['A.3',   '', 'Xem chi tiết đoàn (modal)', '', V, V, ''],
  ['A.3.1', '', '', 'Xem thông tin cơ bản (đối tác, ngày, người tiếp, phòng họp)', V, V, ''],
  ['A.3.2', '', '', 'Xem danh sách nhân sự đoàn', V, V, ''],
  ['A.3.3', '', '', 'Xem quà tặng phát sinh', V, V, ''],
  ['A.3.4', '', '', 'Xem ghi chú', V, V, ''],

  // ─── B. LÝ LỊCH ĐỐI TÁC ───
  ['B',     'Lý lịch Đối tác', '', '', V, V, ''],
  ['B.1',   '', 'Xem danh sách đối tác', '', V, V, ''],
  ['B.1.1', '', '', 'Xem thẻ đối tác (tên, lĩnh vực, quốc gia, giá trị HĐ)', V, V, 'Grid cards'],
  ['B.1.2', '', '', 'Tìm kiếm đối tác theo tên, mã, người liên hệ', V, V, 'Real-time'],
  ['B.1.3', '', '', 'Lọc theo lĩnh vực', V, V, 'Dropdown'],
  ['B.1.4', '', '', 'Lọc theo cấp độ quan hệ', V, V, 'Dropdown'],
  ['B.1.5', '', '', 'Lọc theo quốc gia', V, V, 'Cờ quốc kỳ'],
  ['B.1.6', '', '', 'Xem thống kê tổng hợp', V, V, '4 KPI cards'],
  ['B.2',   '', 'Xem chi tiết đối tác (drawer)', '', V, V, ''],
  ['B.2.1', '', '', 'Xem thông tin định danh đầy đủ', V, V, ''],
  ['B.2.2', '', '', 'Xem số liệu nhanh (giá trị HĐ, lợi nhuận, số HĐ, lượt thăm)', V, V, ''],
  ['B.2.3', '', '', 'Xem quan hệ đối tác liên quan', V, V, ''],
  ['B.2.4', '', '', 'Xem ghi chú/cảnh báo đối tác', V, V, ''],
  ['B.3',   '', 'Hợp đồng', '', V, V, ''],
  ['B.3.1', '', '', 'Xem danh sách hợp đồng (mã, tên, trạng thái, giá trị)', V, V, ''],
  ['B.3.2', '', '', 'Click hợp đồng để xem chi tiết đầy đủ', V, V, 'Mở modal'],
  ['B.3.3', '', '', 'Xem sản phẩm/dịch vụ của hợp đồng', V, V, ''],
  ['B.3.4', '', '', 'Xem tài liệu liên quan từ Kho số hóa (file HĐ, biên bản)', V, V, 'Tự động liên kết'],
  ['B.3.5', '', '', 'Mở rộng tài liệu để xem nội dung OCR', V, V, ''],
  ['B.4',   '', 'Lịch sử ra vào làm việc', '', V, V, ''],
  ['B.4.1', '', '', 'Xem lịch sử hợp nhất (Đoàn VLV + Thăm quan) sắp theo ngày', V, V, 'Mới nhất trước'],
  ['B.4.2', '', '', 'Click đoàn VLV để xem chi tiết (nhân sự, quà tặng, kết quả)', V, V, 'Mở modal'],
  ['B.4.3', '', '', 'Click thăm quan để xem chi tiết', V, V, 'Mở modal'],
  ['B.4.4', '', '', 'Xem công văn/biên bản liên quan từ Kho số hóa', V, V, 'Tự động liên kết'],
  ['B.4.5', '', '', 'Mở rộng tài liệu để xem nội dung OCR', V, V, ''],
  ['B.5',   '', 'Quà tặng', '', V, V, ''],
  ['B.5.1', '', '', 'Xem danh sách quà tặng phát sinh qua các đoàn', V, V, 'Liên kết delegation'],
  ['B.5.2', '', '', 'Xem hướng quà tặng (từ/tặng đối tác)', V, V, ''],
  ['B.5.3', '', '', 'Xem giá trị ước tính', V, V, ''],

  // ─── C. QUẢN LÝ ĐOÀN VÀO ───
  ['C',     'Quản lý Đoàn vào', '', '', V, V, ''],
  ['C.1',   '', 'Xem danh sách đoàn', '', V, V, ''],
  ['C.1.1', '', '', 'Xem theo tab trạng thái (Tất cả, Nháp, Chờ duyệt, Đã duyệt, Đang LV, Hoàn thành)', V, V, ''],
  ['C.1.2', '', '', 'Tìm kiếm đoàn theo tên, đối tác, mã', V, V, 'Real-time'],
  ['C.1.3', '', '', 'Xem thống kê (tổng đoàn, chờ duyệt, đã duyệt, thiếu VB)', V, V, '4 KPI cards'],
  ['C.1.4', '', '', 'Xem cảnh báo đoàn sắp vào chưa có VB đồng ý', V, V, ''],
  ['C.2',   '', 'Tạo đoàn mới', '', '', V, ''],
  ['C.2.1', '', '', 'Chọn đối tác từ danh sách (auto-fill thông tin)', '', V, 'Tự động điền'],
  ['C.2.2', '', '', 'Nhập tiêu đề đoàn', '', V, ''],
  ['C.2.3', '', '', 'Nhập mục đích', '', V, ''],
  ['C.2.4', '', '', 'Chọn ngày bắt đầu / kết thúc', '', V, ''],
  ['C.2.5', '', '', 'Chọn mức ưu tiên (Bình thường / Ưu tiên / TT chỉ đạo)', '', V, ''],
  ['C.2.6', '', '', 'Nhập người tiếp đón, đơn vị, phòng họp', '', V, ''],
  ['C.2.7', '', '', 'Thêm/xóa thành viên đoàn (họ tên, chức vụ, CCCD, đơn vị)', '', V, 'Động'],
  ['C.2.8', '', '', 'Đánh dấu trưởng đoàn', '', V, ''],
  ['C.2.9', '', '', 'Nhập ghi chú', '', V, ''],
  ['C.2.10','', '', 'Lưu tạo đoàn (trạng thái Nháp)', '', V, ''],
  ['C.3',   '', 'Xem chi tiết đoàn (modal)', '', V, V, ''],
  ['C.3.1', '', '', 'Xem thông tin cơ bản (đối tác, ngày, người tiếp, VB đồng ý)', V, V, ''],
  ['C.3.2', '', '', 'Xem công văn & tài liệu từ Kho số hóa', V, V, 'Tự động tìm kiếm'],
  ['C.3.3', '', '', 'Mở rộng tài liệu để đọc nội dung OCR', V, V, 'Hỗ trợ quyết định'],
  ['C.3.4', '', '', 'Xem độ mật tài liệu (Mật / Bí mật)', V, V, ''],
  ['C.3.5', '', '', 'Xem bảng nhân sự đoàn (STT, họ tên, chức vụ, CCCD, đơn vị)', V, V, ''],
  ['C.3.6', '', '', 'Xem quà tặng phát sinh', V, V, ''],
  ['C.3.7', '', '', 'Xem kết quả làm việc (nếu đã hoàn thành)', V, V, ''],
  ['C.3.8', '', '', 'Xem ghi chú / cảnh báo', V, V, ''],
  ['C.4',   '', 'Xử lý đoàn (Workflow)', '', '', '', ''],
  ['C.4.1', '', '', 'Gửi duyệt (Nháp → Chờ duyệt)', '', V, ''],
  ['C.4.2', '', '', 'Phê duyệt (Chờ duyệt → Đã duyệt)', V, '', 'Thủ trưởng duyệt'],
  ['C.4.3', '', '', 'Ghi nhận đoàn đã vào (Đã duyệt → Đang làm việc)', '', V, ''],
  ['C.4.4', '', '', 'Hoàn thành (Đang làm việc → Hoàn thành)', '', V, ''],
  ['C.4.5', '', '', 'Xóa đoàn (xác nhận trước khi xóa)', '', V, 'ConfirmDialog'],
  ['C.5',   '', 'Xuất dữ liệu', '', V, V, ''],
  ['C.5.1', '', '', 'Xuất danh sách đoàn đã lọc ra file CSV/Excel', V, V, 'UTF-8 BOM'],

  // ─── D. KHO SỐ HÓA ───
  ['D',     'Kho số hóa (OCR)', '', '', V, V, ''],
  ['D.1',   '', 'Tra cứu thông minh (OCR)', '', V, V, ''],
  ['D.1.1', '', '', 'Tìm kiếm toàn văn trong nội dung OCR', V, V, 'Full-text search'],
  ['D.1.2', '', '', 'Lọc theo năm', V, V, 'Dropdown'],
  ['D.1.3', '', '', 'Lọc theo loại tài liệu (công văn đến/đi, biên bản, hợp đồng...)', V, V, ''],
  ['D.1.4', '', '', 'Sắp xếp kết quả (ngày, tên, loại)', V, V, ''],
  ['D.1.5', '', '', 'Xem kết quả với highlight từ khóa tìm kiếm', V, V, ''],
  ['D.1.6', '', '', 'Chọn nhiều tài liệu (checkbox)', '', V, ''],
  ['D.1.7', '', '', 'Xem chi tiết tài liệu (metadata, nội dung OCR, tags)', V, V, 'Mở rộng'],
  ['D.1.8', '', '', 'Click tag để tìm kiếm liên quan', V, V, ''],
  ['D.2',   '', 'Quản lý thư mục đoàn', '', V, V, ''],
  ['D.2.1', '', '', 'Xem danh sách thư mục theo đoàn', V, V, ''],
  ['D.2.2', '', '', 'Tìm kiếm thư mục', V, V, ''],
  ['D.2.3', '', '', 'Lọc thư mục theo trạng thái', V, V, ''],
  ['D.2.4', '', '', 'Mở rộng thư mục để xem file bên trong', V, V, ''],
  ['D.2.5', '', '', 'Xem chi tiết file (metadata, nội dung OCR)', V, V, ''],
  ['D.2.6', '', '', 'Tạo thư mục đoàn mới', '', V, 'Modal form'],
  ['D.3',   '', 'Tải lên tài liệu', '', '', V, ''],
  ['D.3.1', '', '', 'Kéo thả file hoặc click chọn (PDF, DOCX, XLSX, JPG, PNG)', '', V, 'Drag & drop'],
  ['D.3.2', '', '', 'Chọn loại tài liệu', '', V, 'Dropdown'],
  ['D.3.3', '', '', 'Bật/tắt tự động quét OCR sau khi tải lên', '', V, 'Toggle switch'],
  ['D.3.4', '', '', 'Xem tiến trình tải lên (progress bar)', '', V, 'Animation'],
  ['D.4',   '', 'Thống kê kho', '', V, V, ''],
  ['D.4.1', '', '', 'Xem tổng số tài liệu, số đã OCR, số thư mục, dung lượng', V, V, ''],
  ['D.4.2', '', '', 'Xem thanh tiến độ số hóa OCR (%)', V, V, 'Progress bar'],

  // ─── E. BÁO CÁO ───
  ['E',     'Báo cáo & Thống kê', '', '', V, V, ''],
  ['E.1',   '', 'Tổng hợp', '', V, V, ''],
  ['E.1.1', '', '', 'Xem KPI: tổng đoàn vào, đoàn ra, quốc gia, nước đi', V, V, '4 cards'],
  ['E.1.2', '', '', 'Xem biểu đồ đoàn vào theo quốc tịch', V, V, 'Bar chart'],
  ['E.1.3', '', '', 'Xem biểu đồ đoàn ra theo nước đến', V, V, 'Bar chart'],
  ['E.1.4', '', '', 'Xem biểu đồ đoàn vào/ra theo đơn vị', V, V, 'Bar chart'],
  ['E.1.5', '', '', 'Xem biểu đồ đoàn vào theo tháng', V, V, 'Column chart'],
  ['E.1.6', '', '', 'Xem danh sách đoàn vào/ra gần đây', V, V, ''],
  ['E.2',   '', 'Báo cáo Đoàn vào', '', V, V, ''],
  ['E.2.1', '', '', 'Xem bảng báo cáo đầy đủ (17 cột theo mẫu)', V, V, ''],
  ['E.2.2', '', '', 'Lọc theo đối tác', V, V, 'Dropdown'],
  ['E.2.3', '', '', 'Lọc theo đơn vị tiếp nhận', V, V, 'Dropdown'],
  ['E.2.4', '', '', 'Tìm kiếm trong bảng', V, V, ''],
  ['E.2.5', '', '', 'Xem dòng TỔNG CỘNG cuối bảng', V, V, ''],
  ['E.2.6', '', '', 'Xóa bộ lọc', V, V, ''],
  ['E.3',   '', 'Báo cáo Đoàn ra', '', V, V, ''],
  ['E.3.1', '', '', 'Xem bảng báo cáo đầy đủ (16 cột theo mẫu)', V, V, ''],
  ['E.3.2', '', '', 'Lọc theo đối tác mới', V, V, 'Dropdown'],
  ['E.3.3', '', '', 'Lọc theo đơn vị cử đoàn', V, V, 'Dropdown'],
  ['E.3.4', '', '', 'Tìm kiếm trong bảng', V, V, ''],
  ['E.3.5', '', '', 'Xem dòng TỔNG CỘNG cuối bảng', V, V, ''],
  ['E.4',   '', 'Xuất báo cáo', '', V, V, ''],
  ['E.4.1', '', '', 'Xuất file CSV/Excel đoàn vào (dữ liệu đã lọc)', V, V, 'UTF-8 BOM'],
  ['E.4.2', '', '', 'Xuất file CSV/Excel đoàn ra (dữ liệu đã lọc)', V, V, ''],
  ['E.4.3', '', '', 'Xuất tất cả (cả 2 file cùng lúc)', V, V, 'Tab Tổng hợp'],
  ['E.4.4', '', '', 'In báo cáo', V, V, ''],
  ['E.4.5', '', '', 'Lọc theo năm (2024/2025/2026/Tất cả)', V, V, 'Global filter'],

  // ─── F. CẢNH BÁO ───
  ['F',     'Cảnh báo & Thông báo', '', '', V, V, ''],
  ['F.1',   '', 'Xem thông báo', '', V, V, ''],
  ['F.1.1', '', '', 'Xem danh sách thông báo nhóm theo ngày', V, V, ''],
  ['F.1.2', '', '', 'Tìm kiếm thông báo', V, V, ''],
  ['F.1.3', '', '', 'Lọc theo loại (công văn, workflow, lịch, hệ thống...)', V, V, ''],
  ['F.1.4', '', '', 'Lọc theo trạng thái (tất cả, chưa đọc, đã đọc, gắn sao)', V, V, ''],
  ['F.1.5', '', '', 'Click thông báo để đọc và chuyển trang', V, V, ''],
  ['F.2',   '', 'Thao tác thông báo', '', V, V, ''],
  ['F.2.1', '', '', 'Đánh dấu đã đọc', V, V, ''],
  ['F.2.2', '', '', 'Đánh dấu tất cả đã đọc', V, V, ''],
  ['F.2.3', '', '', 'Gắn/bỏ sao thông báo', V, V, ''],
  ['F.2.4', '', '', 'Xóa thông báo', V, V, ''],
  ['F.2.5', '', '', 'Xóa tất cả (giữ lại thông báo gắn sao)', V, V, ''],
  ['F.2.6', '', '', 'Nhận thông báo real-time (mô phỏng)', V, V, '12s/lần'],

  // ─── G. QUẢN TRỊ ───
  ['G',     'Quản trị', '', '', '', V, ''],
  ['G.1',   '', 'Danh mục', '', '', V, 'Admin only'],
  ['G.1.1', '', '', 'Xem 6 nhóm danh mục', '', V, ''],
  ['G.1.2', '', '', 'Tìm kiếm trong danh mục', '', V, ''],
  ['G.1.3', '', '', 'Sắp xếp cột', '', V, ''],
  ['G.1.4', '', '', 'Ẩn/hiện cột', '', V, 'Column toggle'],
  ['G.1.5', '', '', 'Kéo thay đổi kích thước cột', '', V, 'Resize handle'],
  ['G.1.6', '', '', 'Tạo mục danh mục mới', '', V, 'Modal form'],
  ['G.1.7', '', '', 'Sửa mục danh mục', '', V, 'Modal form'],
  ['G.1.8', '', '', 'Xóa mục danh mục (chặn nếu đang sử dụng)', '', V, 'Confirm dialog'],
  ['G.1.9', '', '', 'Chọn nhiều mục (checkbox)', '', V, ''],
  ['G.1.10','', '', 'Bật/tắt trạng thái hàng loạt', '', V, 'Bulk action'],
  ['G.1.11','', '', 'Xóa hàng loạt (kiểm tra ràng buộc sử dụng)', '', V, 'Bulk action'],

  // ─── H. CÀI ĐẶT ───
  ['H',     'Cài đặt', '', '', V, V, ''],
  ['H.1',   '', 'Cá nhân', '', V, V, ''],
  ['H.1.1', '', '', 'Xem thông tin tài khoản (avatar, tên, chức vụ, vai trò)', V, V, ''],
  ['H.1.2', '', '', 'Sửa thông tin cá nhân (họ tên, email, SĐT)', V, V, ''],
  ['H.2',   '', 'Bảo mật', '', V, V, ''],
  ['H.2.1', '', '', 'Đổi mật khẩu (mật khẩu cũ, mới, xác nhận)', V, V, 'Validation'],
  ['H.2.2', '', '', 'Xem lịch sử đăng nhập', V, V, ''],
  ['H.3',   '', 'Thông báo', '', V, V, ''],
  ['H.3.1', '', '', 'Bật/tắt thông báo email', V, V, 'Toggle'],
  ['H.3.2', '', '', 'Bật/tắt thông báo văn bản', V, V, 'Toggle'],
  ['H.3.3', '', '', 'Bật/tắt thông báo công việc', V, V, 'Toggle'],
  ['H.3.4', '', '', 'Bật/tắt thông báo lịch', V, V, 'Toggle'],
  ['H.4',   '', 'Hiển thị', '', V, V, ''],
  ['H.4.1', '', '', 'Chọn giao diện (Sáng / Tối / Tự động)', V, V, 'Theme cards'],
  ['H.4.2', '', '', 'Chọn ngôn ngữ', V, V, ''],
  ['H.4.3', '', '', 'Chọn định dạng ngày', V, V, ''],

  // ─── I. XÁC THỰC ───
  ['I',     'Xác thực & Phân quyền', '', '', V, V, ''],
  ['I.1',   '', 'Đăng nhập', '', V, V, ''],
  ['I.1.1', '', '', 'Nhập tài khoản và mật khẩu', V, V, ''],
  ['I.1.2', '', '', 'Ẩn/hiện mật khẩu', V, V, 'Eye toggle'],
  ['I.1.3', '', '', 'Hiển thị lỗi đăng nhập', V, V, ''],
  ['I.1.4', '', '', 'Khóa tài khoản sau 5 lần sai', V, V, ''],
  ['I.1.5', '', '', 'Tự động hết phiên sau 30 phút', V, V, ''],
  ['I.2',   '', 'Phân quyền', '', '', '', ''],
  ['I.2.1', '', '', 'Thủ trưởng: Xem tất cả + Phê duyệt đoàn', V, '', ''],
  ['I.2.2', '', '', 'Cán bộ QHQT: Tạo/sửa/xóa đoàn + Quản lý đối tác + Upload', '', V, ''],
  ['I.2.3', '', '', 'Menu Quản trị chỉ hiện với cán bộ QHQT', '', V, 'Permission-based'],
  ['I.2.4', '', '', 'Đăng xuất', V, V, ''],
];

// ── BUILD WORKBOOK ──
const wb = XLSX.utils.book_new();

// Header rows
const header1 = ['', '', '', '', 'Vai trò', '', ''];
const header2 = ['STT', 'Phân hệ', 'Nhóm tính năng', 'Tên tính năng', 'Thủ trưởng\nTổng cục', 'Cán bộ\nphòng QHQT', 'Ghi chú'];

const sheetData = [header1, header2, ...rows];
const ws = XLSX.utils.aoa_to_sheet(sheetData);

// ── Column widths ──
ws['!cols'] = [
  { wch: 8 },   // STT
  { wch: 26 },  // Phân hệ
  { wch: 32 },  // Nhóm tính năng
  { wch: 58 },  // Tên tính năng
  { wch: 14 },  // Thủ trưởng
  { wch: 14 },  // Cán bộ QHQT
  { wch: 22 },  // Ghi chú
];

// ── Merge cells for header ──
ws['!merges'] = [
  { s: { r: 0, c: 4 }, e: { r: 0, c: 5 } }, // "Vai trò" spans 2 cols
];

// ── Row heights ──
ws['!rows'] = [
  { hpt: 22 },  // header row 1
  { hpt: 32 },  // header row 2
];

XLSX.utils.book_append_sheet(wb, ws, 'Danh sách tính năng');

// ── Write ──
XLSX.writeFile(wb, outputPath);
console.log(`✅ Đã xuất: ${outputPath}`);
console.log(`   ${rows.length} dòng | 9 phân hệ | 2 vai trò`);
