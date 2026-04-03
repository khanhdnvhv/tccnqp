// ============================================================
// BÁO CÁO ĐOÀN VÀO / ĐOÀN RA — Mock Data
// ============================================================

export interface DoanVao {
  id: string;
  stt: number;
  congVanTongCuc: string;
  congVanDonVi: string;
  trichYeu: string;
  cvCucTacChien: string;
  cvCucBVAN: string;
  doMat: string;
  nguoiNhan: string;
  soLuong: number;
  danhSachDoiTac: { hoTen: string; hoChieu: string; quocTich: string }[];
  thangVao: number;
  thangVe: number;
  thoiGianCuThe: string;
  donVi: string;
  congTyDoiTac: string;
  mucDich: string;
  ghiChu: string;
}

export interface DoanRa {
  id: string;
  stt: number;
  congVanTongCuc: string;
  congVanDonVi: string;
  trichYeu: string;
  soQuyetDinh: string;
  nguoiNhan: string;
  donVi: string;
  soLuong: number;
  truongDoan: string;
  nuocDi: string;
  thoiGianDi: number;
  thoiGianVe: number;
  thoiGianCuThe: string;
  mucDich: string;
  doiTacMoi: string;
  ghiChu: string;
}

export const doanVaoData: DoanVao[] = [
  {
    id: 'dv-001',
    stt: 1,
    congVanTongCuc: '16640/CNQP-TM ngày 03/11/25',
    congVanDonVi: '2544/ĐTHH-CT 27/10/2025',
    trichYeu: '',
    cvCucTacChien: '10324/TC-KH ngày 07/8/25',
    cvCucBVAN: '8731/BVAN-P5 ngày 17/11/25',
    doMat: 'Lực',
    nguoiNhan: '',
    soLuong: 2,
    danhSachDoiTac: [
      { hoTen: 'Leiv Sindre Muren', hoChieu: 'CFF595169', quocTich: 'Na Uy' },
      { hoTen: 'Jarle Asgeir Aasemyr', hoChieu: '33595900', quocTich: 'Na Uy' },
    ],
    thangVao: 11,
    thangVe: 11,
    thoiGianCuThe: '20/11',
    donVi: 'Hồng Hà',
    congTyDoiTac: 'Công ty Myklebust Verft AS/Na Uy và Công ty Cổ phần Tư vấn Đóng tàu và Xúc tiến thương mại Việt Nam (QNP)',
    mucDich: 'Trao đổi hợp tác đóng tàu cá, tàu dịch vụ cỡ nhỏ giữa hai Bên',
    ghiChu: 'Vũ Minh Đoàn 02208000843​9',
  },
  {
    id: 'dv-002',
    stt: 2,
    congVanTongCuc: '17250/CNQP-TM ngày 11/11/25',
    congVanDonVi: '4952/Z131-CT ngày 07/11/25',
    trichYeu: '',
    cvCucTacChien: '2343/TC-KH ngày 07/3/25',
    cvCucBVAN: '1294/BVAN-P5 ngày 07/3/25',
    doMat: 'Lực',
    nguoiNhan: '',
    soLuong: 7,
    danhSachDoiTac: [
      { hoTen: 'Olm Daniel Gerard', hoChieu: 'A11797070', quocTich: 'Hoa Kỳ' },
      { hoTen: 'Moore Kenneth Lee', hoChieu: 'A68887306', quocTich: 'Hoa Kỳ' },
      { hoTen: 'Sheahan Duong t', hoChieu: '679606470', quocTich: 'Hoa Kỳ' },
      { hoTen: 'Liang, Bikai', hoChieu: 'EA9509394', quocTich: 'Trung Quốc' },
      { hoTen: 'Chen Brenda', hoChieu: 'A35580059', quocTich: 'Hoa Kỳ' },
      { hoTen: 'Cheng Yi-Ting', hoChieu: '360172620', quocTich: 'Trung Quốc' },
      { hoTen: 'Chen Wei Chi', hoChieu: '361453395', quocTich: 'Trung Quốc' },
    ],
    thangVao: 11,
    thangVe: 11,
    thoiGianCuThe: '13-15/11',
    donVi: 'Z131',
    congTyDoiTac: 'Công ty TNHH Dragon Right',
    mucDich: 'Kiểm tra, đánh giá các sản phẩm khuôn mẫu nối có khi đang sản xuất tại Nhà máy Z131 theo Hợp đồng ủy thác xuất khẩu số 2025.01.01-01 ngày 01/01/2025 và Đơn đặt hàng số C0356 ngày 30/6/2025.',
    ghiChu: '01 ngày',
  },
  {
    id: 'dv-003',
    stt: 3,
    congVanTongCuc: '18102/CNQP-TM ngày 25/11/25',
    congVanDonVi: '3210/ĐTHH-CT ngày 20/11/25',
    trichYeu: '',
    cvCucTacChien: '11245/TC-KH ngày 15/9/25',
    cvCucBVAN: '9520/BVAN-P5 ngày 28/11/25',
    doMat: 'Lực',
    nguoiNhan: '',
    soLuong: 3,
    danhSachDoiTac: [
      { hoTen: 'Kim Sung-hwan', hoChieu: 'M56789012', quocTich: 'Hàn Quốc' },
      { hoTen: 'Park Jin-young', hoChieu: 'M67890123', quocTich: 'Hàn Quốc' },
      { hoTen: 'Lee Dong-wook', hoChieu: 'M78901234', quocTich: 'Hàn Quốc' },
    ],
    thangVao: 12,
    thangVe: 12,
    thoiGianCuThe: '05-07/12',
    donVi: 'Hồng Hà',
    congTyDoiTac: 'Hanwha Ocean Co., Ltd / Hàn Quốc',
    mucDich: 'Khảo sát năng lực đóng tàu và trao đổi khả năng hợp tác chuyển giao công nghệ đóng tàu quân sự',
    ghiChu: '03 ngày',
  },
  {
    id: 'dv-004',
    stt: 4,
    congVanTongCuc: '19450/CNQP-TM ngày 10/01/26',
    congVanDonVi: '0125/Z131-CT ngày 05/01/26',
    trichYeu: '',
    cvCucTacChien: '0234/TC-KH ngày 03/01/26',
    cvCucBVAN: '0156/BVAN-P5 ngày 08/01/26',
    doMat: 'Lực',
    nguoiNhan: '',
    soLuong: 4,
    danhSachDoiTac: [
      { hoTen: 'Alexei Petrov', hoChieu: 'R12345678', quocTich: 'Nga' },
      { hoTen: 'Dmitry Volkov', hoChieu: 'R23456789', quocTich: 'Nga' },
      { hoTen: 'Sergei Ivanov', hoChieu: 'R34567890', quocTich: 'Nga' },
      { hoTen: 'Nguyen Van Phien dich', hoChieu: '001088056789', quocTich: 'Việt Nam' },
    ],
    thangVao: 1,
    thangVe: 1,
    thoiGianCuThe: '22-25/01',
    donVi: 'Ban GĐ',
    congTyDoiTac: 'Rosoboronexport JSC / Nga',
    mucDich: 'Đàm phán kỹ thuật giai đoạn 3 của hợp đồng hiện đại hóa hệ thống S-300PMU2',
    ghiChu: '04 ngày — Đoàn cấp chiến lược',
  },
  {
    id: 'dv-005',
    stt: 5,
    congVanTongCuc: '19780/CNQP-TM ngày 15/02/26',
    congVanDonVi: '0456/VCN-BCT ngày 10/02/26',
    trichYeu: '',
    cvCucTacChien: '0567/TC-KH ngày 08/02/26',
    cvCucBVAN: '0345/BVAN-P5 ngày 12/02/26',
    doMat: 'Lực',
    nguoiNhan: '',
    soLuong: 5,
    danhSachDoiTac: [
      { hoTen: 'Son Jae-il', hoChieu: 'M12345678', quocTich: 'Hàn Quốc' },
      { hoTen: 'Kim Min-ho', hoChieu: 'M23456789', quocTich: 'Hàn Quốc' },
      { hoTen: 'Park Sung-jin', hoChieu: 'M34567890', quocTich: 'Hàn Quốc' },
      { hoTen: 'Lee Joon-hyuk', hoChieu: 'M45678901', quocTich: 'Hàn Quốc' },
      { hoTen: 'Nguyễn Thành Vinh', hoChieu: '001088056789', quocTich: 'Việt Nam' },
    ],
    thangVao: 3,
    thangVe: 3,
    thoiGianCuThe: '10-12/03',
    donVi: 'Ban GĐ',
    congTyDoiTac: 'Hanwha Aerospace Co., Ltd / Hàn Quốc',
    mucDich: 'Thảo luận chi tiết điều khoản chuyển giao công nghệ pháo tự hành K9A1',
    ghiChu: '03 ngày',
  },
];

export const doanRaData: DoanRa[] = [
  {
    id: 'dr-001',
    stt: 1,
    congVanTongCuc: '16961/CNQP-TM ngày 06/11/25',
    congVanDonVi: '1048/VCN-BCT ngày 29/10/25',
    trichYeu: 'Đề nghị cử cán bộ đi nước ngoài',
    soQuyetDinh: '5782/QĐ-BQP ngày 12/11/25',
    nguoiNhan: 'Dũng',
    donVi: 'Viện Công nghệ',
    soLuong: 1,
    truongDoan: 'T=Thiếu tá Bùi Mỹ Dung, Trợ lý Phòng Thiết kế - Thiết bị/Viện Công nghệ',
    nuocDi: 'Hàn Quốc',
    thoiGianDi: 11,
    thoiGianVe: 11,
    thoiGianCuThe: '26-30/11',
    mucDich: 'trao đổi, tìm hiểu cơ hội hợp tác trong lĩnh vực nghiên cứu, thiết kế công nghệ điện tử công nghiệp',
    doiTacMoi: 'Công ty Cổ phần S-Tec System Vina',
    ghiChu: 'Tổng kết năm 2025',
  },
  {
    id: 'dr-002',
    stt: 2,
    congVanTongCuc: '16812/CNQP-TM ngày 05/11',
    congVanDonVi: '5608/TCT-ĐNPC ngày 30/10/2025',
    trichYeu: 'Đề nghị cử cán bộ đi nước ngoài',
    soQuyetDinh: '',
    nguoiNhan: 'Dũng',
    donVi: 'GAET',
    soLuong: 1,
    truongDoan: 'Thượng tá Đoàn Đắc Dũng, Phó Tổng Giám đốc Tổng Công ty GAET',
    nuocDi: 'CHLB Đức, Phần Lan, Pháp',
    thoiGianDi: 11,
    thoiGianVe: 11,
    thoiGianCuThe: '22/11 - 04/12/2025',
    mucDich: 'làm việc, thảo luận và tham quan cơ sở sản xuất các trang thiết bị phục vụ phát hiện, giám sát và ứng phó sự cố CBRN',
    doiTacMoi: 'Công ty FKS Engineering',
    ghiChu: '',
  },
  {
    id: 'dr-003',
    stt: 3,
    congVanTongCuc: '15821/CNQP-TM ngày 21/10/2025',
    congVanDonVi: '5006/TCTKTK T-ĐNPC ngày 07/10/2025',
    trichYeu: 'Đề nghị cử cán bộ đi nước ngoài',
    soQuyetDinh: '5294/QĐ-BQP ngày 21/10/2025',
    nguoiNhan: 'Dũng',
    donVi: 'GAET',
    soLuong: 10,
    truongDoan: 'Trung tá Nguyễn Minh Hương, Kế toán trưởng Tổng Công ty GAET',
    nuocDi: 'Tây Ban Nha, Pháp, Bồ Đào Nha',
    thoiGianDi: 11,
    thoiGianVe: 11,
    thoiGianCuThe: '23/10 - 16/11/2025',
    mucDich: 'tham gia Đoàn các doanh nghiệp Quân đội đi Tây Ban Nha, Pháp, Bồ Đào Nha để tham gia các hoạt động tọa đàm, hội thảo liên quan đến lĩnh vực tài chính, ngân hàng',
    doiTacMoi: 'Ngân hàng TMCP Quân đội (MBBank)',
    ghiChu: '',
  },
  {
    id: 'dr-004',
    stt: 4,
    congVanTongCuc: '20150/CNQP-TM ngày 05/01/26',
    congVanDonVi: '0098/VCN-BCT ngày 02/01/26',
    trichYeu: 'Đề nghị cử cán bộ đi nước ngoài',
    soQuyetDinh: '0345/QĐ-BQP ngày 08/01/26',
    nguoiNhan: 'Hùng',
    donVi: 'Phòng QHQT',
    soLuong: 3,
    truongDoan: 'Đại tá Nguyễn Văn Hùng, Trưởng phòng QHQT',
    nuocDi: 'Nga',
    thoiGianDi: 2,
    thoiGianVe: 2,
    thoiGianCuThe: '10-18/02/2026',
    mucDich: 'Tham quan nhà máy sản xuất và trao đổi kỹ thuật về hệ thống phòng không với Rosoboronexport',
    doiTacMoi: 'Rosoboronexport JSC',
    ghiChu: 'Đoàn cấp chiến lược',
  },
];

// Helper
export function getDoanVaoStats() {
  const total = doanVaoData.length;
  const totalNguoi = doanVaoData.reduce((s, d) => s + d.soLuong, 0);
  const quocGia = new Set(doanVaoData.flatMap((d) => d.danhSachDoiTac.map((p) => p.quocTich)));
  return { total, totalNguoi, soQuocGia: quocGia.size };
}

export function getDoanRaStats() {
  const total = doanRaData.length;
  const totalNguoi = doanRaData.reduce((s, d) => s + d.soLuong, 0);
  const nuocDi = new Set(doanRaData.flatMap((d) => d.nuocDi.split(',')).map((s) => s.trim()));
  return { total, totalNguoi, soNuoc: nuocDi.size };
}
