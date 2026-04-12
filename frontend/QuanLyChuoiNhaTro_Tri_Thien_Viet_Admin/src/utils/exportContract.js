import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import "../../public/fonts/Roboto-Regular-normal.js";
import "../../public/fonts/Roboto-Bold-normal.js";
import "../../public/fonts/Roboto-Italic-normal.js";

const F_NORMAL = "Roboto-Regular";
const F_BOLD = "Roboto-Bold";
const F_ITALIC = "Roboto-Italic";

// ====================== HELPERS ======================
const fmt = {
  date: (d) => {
    if (!d) return "............";
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
  },
  day: (d) => (d ? new Date(d).getDate() : "....."),
  month: (d) => (d ? new Date(d).getMonth() + 1 : "....."),
  year: (d) => (d ? new Date(d).getFullYear() : "......"),
  currency: (n) =>
    n != null
      ? new Intl.NumberFormat("vi-VN").format(n) + " đồng"
      : "............",
  numFmt: (n) => (n != null ? new Intl.NumberFormat("vi-VN").format(n) : "0"),
  code: (id) => (id ? `HD-${String(id).padStart(5, "0")}` : "N/A"),
  numToWords: (num) => {
    if (!num) return "Không đồng";
    const units = [
      "",
      "một",
      "hai",
      "ba",
      "bốn",
      "năm",
      "sáu",
      "bảy",
      "tám",
      "chín",
    ];
    const teens = [
      "mười",
      "mười một",
      "mười hai",
      "mười ba",
      "mười bốn",
      "mười lăm",
      "mười sáu",
      "mười bảy",
      "mười tám",
      "mười chín",
    ];
    const tens = [
      "",
      "",
      "hai mươi",
      "ba mươi",
      "bốn mươi",
      "năm mươi",
      "sáu mươi",
      "bảy mươi",
      "tám mươi",
      "chín mươi",
    ];
    const cvt = (n) => {
      if (n === 0) return "không";
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];
      if (n < 100)
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + units[n % 10] : "");
      if (n < 1e3)
        return (
          units[Math.floor(n / 100)] +
          " trăm" +
          (n % 100 ? " " + cvt(n % 100) : "")
        );
      if (n < 1e6)
        return (
          cvt(Math.floor(n / 1e3)) +
          " nghìn" +
          (n % 1e3 ? " " + cvt(n % 1e3) : "")
        );
      if (n < 1e9)
        return (
          cvt(Math.floor(n / 1e6)) +
          " triệu" +
          (n % 1e6 ? " " + cvt(n % 1e6) : "")
        );
      return (
        cvt(Math.floor(n / 1e9)) + " tỷ" + (n % 1e9 ? " " + cvt(n % 1e9) : "")
      );
    };
    const r = cvt(Math.round(num));
    return r.charAt(0).toUpperCase() + r.slice(1) + " đồng";
  },
};

// ====================== PDF HELPERS ======================
const PW = 210,
  PH = 297,
  ML = 25,
  MR = 20,
  CW = PW - ML - MR;
const ROW_H = 6;

const setN = (doc, sz = 11) => {
  doc.setFont(F_NORMAL, "normal");
  doc.setFontSize(sz);
};
const setB = (doc, sz = 11) => {
  doc.setFont(F_BOLD, "normal");
  doc.setFontSize(sz);
};
const setI = (doc, sz = 11) => {
  doc.setFont(F_ITALIC, "normal");
  doc.setFontSize(sz);
};

const para = (doc, str, x, y, maxW, lh = ROW_H) => {
  doc.splitTextToSize(str, maxW).forEach((line) => {
    doc.text(line, x, y);
    y += lh;
  });
  return y;
};
const center = (doc, str, y) => doc.text(str, PW / 2, y, { align: "center" });
const hline = (doc, y, x1 = ML, x2 = PW - MR, lw = 0.3) => {
  doc.setDrawColor(0);
  doc.setLineWidth(lw);
  doc.line(x1, y, x2, y);
};
const checkPg = (doc, y, needed = 35) => {
  if (y + needed > PH - 18) {
    doc.addPage();
    return 20;
  }
  return y;
};

const METER_UNITS = ["kwh", "kWh", "KWH", "m³", "m3", "M3", "m^3"];
const isMeter = (svc) =>
  METER_UNITS.some(
    (u) => (svc.unitAtSigning || "").trim().toLowerCase() === u.toLowerCase(),
  );

// ====================== TABLE STYLES ======================
const tableHead = (font) => ({
  fillColor: [255, 255, 255],
  textColor: [0, 0, 0],
  fontStyle: "normal",
  fontSize: 10.5,
  halign: "center",
  lineColor: [0, 0, 0],
  lineWidth: 0.3,
  font,
});
const tableBody = (font) => ({
  fontSize: 10.5,
  textColor: [0, 0, 0],
  lineColor: [0, 0, 0],
  lineWidth: 0.3,
  font,
});
const tableBodyMuted = (font) => ({
  fontSize: 10.5,
  textColor: [80, 80, 80],
  lineColor: [0, 0, 0],
  lineWidth: 0.3,
  font,
});
const colStyles = {
  0: { cellWidth: 12, halign: "center" },
  1: { cellWidth: "auto" },
  2: { cellWidth: 48, halign: "right" },
  3: { cellWidth: 22, halign: "center" },
};

// ====================== MAIN EXPORT ======================
export const exportContractToPDF = async ({
  contract,
  members = [],
  services = [],
  adminProfile = null,
}) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const blank = (n = 30) => ".".repeat(n);
  const ownerName = adminProfile?.fullName || blank(35);
  const ownerCCCD = adminProfile?.identityNumber || blank(25);
  const ownerAddr = adminProfile?.address || blank(40);
  const ownerPhone = adminProfile?.phone || blank(20);

  const rep = members[0] || null;
  const tenantName = rep?.fullName || blank(35);
  const tenantCCCD = rep?.identityNumber || blank(25);
  const tenantAddr = rep?.address || blank(40);
  const tenantPhone = rep?.phone || blank(20);

  const rentPrice = contract?.rentPrice ?? 0;
  const deposit = contract?.depositAmount ?? 0;
  const roomName = contract?.roomName || `phòng #${contract?.roomId || "..."}`;
  const startDate = contract?.startDate;
  const endDate = contract?.endDate;

  // ✅ FIX: thêm billingDay vào đầu fallback — đây là field thực tế từ backend
  const paymentDay =
    contract?.billingDay ??
    contract?.paymentDay ??
    contract?.paymentDate ??
    contract?.payDay ??
    null;
  const paymentDayStr = paymentDay ? `ngày ${paymentDay}` : "ngày .....";

  const durationMonths = (() => {
    if (!startDate || !endDate) return "......";
    const s = new Date(startDate),
      e = new Date(endDate);
    const m =
      (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    return m > 0 ? m : "......";
  })();

  const monthlySvcs = services.filter((s) => !isMeter(s));
  const meterSvcs = services.filter((s) => isMeter(s));

  const totalMonthlySvc = monthlySvcs.reduce(
    (sum, s) => sum + Number(s.priceAtSigning ?? 0),
    0,
  );
  const totalFixed = rentPrice + totalMonthlySvc;

  const formulaParts = [
    `${fmt.numFmt(rentPrice)} (tiền phòng)`,
    ...monthlySvcs.map(
      (s) =>
        `${fmt.numFmt(s.priceAtSigning ?? 0)} (${s.serviceName || "dịch vụ"})`,
    ),
  ];
  const formulaStr =
    formulaParts.join(" + ") +
    ` = ${fmt.numFmt(totalFixed)} đồng (chưa bao gồm điện, nước)`;

  let y = 16;

  // TIÊU ĐỀ
  setB(doc, 13);
  center(doc, "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", y);
  y += 7;
  setB(doc, 12);
  center(doc, "Độc lập – Tự do – Hạnh phúc", y);
  const ulW = doc.getTextWidth("Độc lập – Tự do – Hạnh phúc");
  hline(doc, y + 1.2, PW / 2 - ulW / 2, PW / 2 + ulW / 2, 0.5);
  y += 8;
  setN(doc, 10);
  center(doc, "----------o0o----------", y);
  y += 12;
  setB(doc, 14);
  center(doc, "HỢP ĐỒNG THUÊ PHÒNG TRỌ", y);
  y += 7;
  setI(doc, 10);
  center(doc, `(Số hợp đồng: ${fmt.code(contract?.contractId)})`, y);
  y += 10;

  setN(doc, 11);
  y = para(
    doc,
    `Hôm nay, ngày ${fmt.day(startDate)} tháng ${fmt.month(startDate)} năm ${fmt.year(startDate)}, tại ${roomName}, chúng tôi gồm có:`,
    ML,
    y,
    CW,
  );
  y += 5;

  // BÊN A
  setB(doc, 11);
  y = para(doc, "BÊN CHO THUÊ PHÒNG TRỌ (gọi tắt là Bên A):", ML, y, CW);
  y += 1;
  setN(doc, 11);
  y = para(doc, `Ông/Bà (tên chủ hợp đồng): ${ownerName}`, ML + 5, y, CW - 5);
  y = para(doc, `Số CMND/CCCD: ${ownerCCCD}`, ML + 5, y, CW - 5);
  y = para(doc, `Địa chỉ thường trú: ${ownerAddr}`, ML + 5, y, CW - 5);
  y = para(doc, `Số điện thoại: ${ownerPhone}`, ML + 5, y, CW - 5);
  y += 4;

  // BÊN B
  setB(doc, 11);
  y = para(doc, "BÊN THUÊ PHÒNG TRỌ (gọi tắt là Bên B):", ML, y, CW);
  y += 1;
  setN(doc, 11);
  y = para(
    doc,
    `Ông/Bà (đại diện người thuê): ${tenantName}`,
    ML + 5,
    y,
    CW - 5,
  );
  y = para(doc, `Số CMND/CCCD: ${tenantCCCD}`, ML + 5, y, CW - 5);
  y = para(doc, `Địa chỉ thường trú: ${tenantAddr}`, ML + 5, y, CW - 5);
  y = para(doc, `Số điện thoại: ${tenantPhone}`, ML + 5, y, CW - 5);
  y += 4;

  setI(doc, 11);
  y = para(
    doc,
    "Sau khi thỏa thuận, hai bên thống nhất ký kết hợp đồng thuê phòng trọ với các điều khoản sau:",
    ML,
    y,
    CW,
  );
  y += 6;

  // ĐIỀU 1
  y = checkPg(doc, y, 55);
  setB(doc, 11);
  y = para(doc, "Điều 1. Nội dung thuê phòng", ML, y, CW);
  y += 2;
  setN(doc, 11);
  [
    `Bên A cho Bên B thuê 01 phòng trọ: ${roomName}.`,
    `Thời hạn thuê: ${durationMonths} tháng, từ ngày ${fmt.date(startDate)} đến ngày ${fmt.date(endDate)}.`,
    `Giá thuê: ${fmt.currency(rentPrice)}/tháng (Bằng chữ: ${fmt.numToWords(rentPrice)}).`,
    `Tiền đặt cọc: ${fmt.currency(deposit)} (Bằng chữ: ${fmt.numToWords(deposit)}).`,
    `Bên B thanh toán tiền thuê vào ${paymentDayStr} hàng tháng.`,
    `Tiền điện, nước tính riêng theo chỉ số thực tế, không gộp vào tiền thuê cố định.`,
  ].forEach((line, i) => {
    y = para(doc, `${i + 1}. ${line}`, ML + 5, y, CW - 5);
  });
  y += 5;

  // ĐIỀU 2
  y = checkPg(doc, y, 60);
  setB(doc, 11);
  y = para(doc, "Điều 2. Dịch vụ và chi phí hàng tháng", ML, y, CW);
  y += 2;
  setN(doc, 11);

  if (monthlySvcs.length > 0) {
    y = para(
      doc,
      "Dịch vụ cố định hàng tháng (tính vào tổng chi phí):",
      ML + 5,
      y,
      CW - 5,
    );
    y += 2;
    autoTable(doc, {
      startY: y,
      margin: { left: ML + 5, right: MR + 5 },
      head: [["STT", "Tên dịch vụ", "Đơn giá", "Đơn vị"]],
      body: monthlySvcs.map((s, i) => [
        String(i + 1),
        s.serviceName || "Dịch vụ",
        fmt.currency(s.priceAtSigning),
        s.unitAtSigning || "tháng",
      ]),
      columnStyles: colStyles,
      headStyles: tableHead(F_BOLD),
      bodyStyles: tableBody(F_NORMAL),
      styles: { font: F_NORMAL, cellPadding: 2.5 },
      theme: "grid",
    });
    y = doc.lastAutoTable.finalY + 3;
  }

  if (meterSvcs.length > 0) {
    y = checkPg(doc, y, 30);
    y = para(
      doc,
      "Dịch vụ theo chỉ số thực tế (tính riêng hàng tháng, không gộp vào tổng cố định):",
      ML + 5,
      y,
      CW - 5,
    );
    y += 2;
    autoTable(doc, {
      startY: y,
      margin: { left: ML + 5, right: MR + 5 },
      head: [["STT", "Tên dịch vụ", "Đơn giá", "Đơn vị"]],
      body: meterSvcs.map((s, i) => [
        String(i + 1),
        s.serviceName || "Dịch vụ",
        fmt.currency(s.priceAtSigning),
        s.unitAtSigning || "",
      ]),
      columnStyles: colStyles,
      headStyles: { ...tableHead(F_BOLD), fillColor: [240, 240, 240] },
      bodyStyles: tableBodyMuted(F_NORMAL),
      styles: { font: F_NORMAL, cellPadding: 2.5 },
      theme: "grid",
    });
    y = doc.lastAutoTable.finalY + 3;
  }

  if (services.length === 0) {
    y = para(doc, "(Không có dịch vụ đăng ký kèm theo)", ML + 5, y, CW - 5);
    y += 3;
  }

  y = checkPg(doc, y, 16);
  setN(doc, 11);
  y = para(
    doc,
    `Tổng chi phí cố định hàng tháng: ${formulaStr}`,
    ML + 5,
    y,
    CW - 5,
  );
  y += 5;

  // ĐIỀU 3
  y = checkPg(doc, y, 38);
  setB(doc, 11);
  y = para(doc, "Điều 3. Trách nhiệm Bên A", ML, y, CW);
  y += 2;
  setN(doc, 11);
  [
    "Bàn giao phòng đúng hạn, đảm bảo không có tranh chấp, khiếu kiện.",
    "Đăng ký tạm trú cho Bên B với cơ quan địa phương theo quy định pháp luật.",
    "Cung cấp điện, nước sinh hoạt bình thường trong suốt thời gian thuê.",
    "Thông báo trước 01 tháng nếu thay đổi giá thuê hoặc chấm dứt hợp đồng.",
  ].forEach((line, i) => {
    y = para(doc, `${i + 1}. ${line}`, ML + 5, y, CW - 5);
  });
  y += 5;

  // ĐIỀU 4
  y = checkPg(doc, y, 48);
  setB(doc, 11);
  y = para(doc, "Điều 4. Trách nhiệm Bên B", ML, y, CW);
  y += 2;
  setN(doc, 11);
  [
    "Thanh toán đầy đủ, đúng hạn tiền thuê và các chi phí phát sinh theo thỏa thuận.",
    "Giữ gìn vệ sinh, an ninh trật tự; không gây ảnh hưởng đến các phòng khác.",
    "Không cho thuê lại phòng khi chưa có sự đồng ý bằng văn bản của Bên A.",
    "Sử dụng phòng đúng mục đích ở; không chứa chấp tệ nạn xã hội, chất cấm.",
    "Cung cấp giấy tờ tùy thân để đăng ký tạm trú theo yêu cầu cơ quan chức năng.",
    "Thông báo trước 01 tháng nếu không tiếp tục gia hạn hợp đồng.",
  ].forEach((line, i) => {
    y = para(doc, `${i + 1}. ${line}`, ML + 5, y, CW - 5);
  });
  y += 5;

  // ĐIỀU 5
  y = checkPg(doc, y, 48);
  setB(doc, 11);
  y = para(
    doc,
    "Điều 5. Điều khoản pháp lý và giải quyết tranh chấp",
    ML,
    y,
    CW,
  );
  y += 2;
  setN(doc, 11);
  [
    "Hợp đồng căn cứ Bộ luật Dân sự Việt Nam năm 2015 và các quy định pháp luật hiện hành.",
    "Tranh chấp ưu tiên giải quyết bằng thương lượng. Nếu không thành, đưa ra Tòa án nhân dân có thẩm quyền.",
    "Bên B vi phạm thanh toán quá 15 ngày, Bên A có quyền chấm dứt hợp đồng, thu hồi phòng; tiền cọc xử lý theo pháp luật.",
    "Bên đơn phương chấm dứt hợp đồng không có lý do chính đáng phải bồi thường 01 tháng tiền thuê.",
    "Mọi thay đổi điều khoản phải lập thành văn bản có chữ ký của cả hai bên.",
    "Hợp đồng có hiệu lực từ ngày ký, lập 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.",
  ].forEach((line, i) => {
    y = para(doc, `${i + 1}. ${line}`, ML + 5, y, CW - 5);
  });

  if (contract?.note) {
    y += 3;
    y = checkPg(doc, y, 20);
    setB(doc, 11);
    doc.text("Ghi chú:", ML, y);
    y += 6;
    setN(doc, 11);
    y = para(doc, contract.note, ML + 5, y, CW - 5);
  }

  // CHỮ KÝ
  y = checkPg(doc, y, 65);
  y += 8;
  setI(doc, 11);
  const td = new Date();
  doc.text(
    `TP. Hồ Chí Minh, ngày ${td.getDate()} tháng ${td.getMonth() + 1} năm ${td.getFullYear()}`,
    PW - MR,
    y,
    { align: "right" },
  );
  y += 10;

  const col1 = ML + CW / 4,
    col2 = ML + (3 * CW) / 4;
  setB(doc, 11);
  doc.text("BÊN CHO THUÊ (Bên A)", col1, y, { align: "center" });
  doc.text("BÊN THUÊ (Bên B)", col2, y, { align: "center" });
  y += 5;
  setI(doc, 10);
  doc.text("(Ký, ghi rõ họ tên)", col1, y, { align: "center" });
  doc.text("(Ký, ghi rõ họ tên)", col2, y, { align: "center" });
  y += 32;
  setB(doc, 11);
  doc.text(ownerName, col1, y, { align: "center" });
  doc.text(tenantName, col2, y, { align: "center" });

  // Số trang
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    setN(doc, 8);
    doc.setTextColor(130, 130, 130);
    doc.text(
      `Trang ${i}/${totalPages}  –  Mã HĐ: ${fmt.code(contract?.contractId)}`,
      PW / 2,
      PH - 8,
      { align: "center" },
    );
    doc.setTextColor(0, 0, 0);
  }

  doc.save(`HopDong_${fmt.code(contract?.contractId)}.pdf`);
};
