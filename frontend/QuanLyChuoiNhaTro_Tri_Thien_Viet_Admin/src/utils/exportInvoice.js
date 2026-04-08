import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import "../../public/fonts/Roboto-Regular-normal.js";
import "../../public/fonts/Roboto-Bold-normal.js";
import "../../public/fonts/Roboto-Italic-normal.js";

const F_NORMAL = "Roboto-Regular";
const F_BOLD = "Roboto-Bold";
const F_ITALIC = "Roboto-Italic";

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmt = {
  date: (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "—";
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
  },
  currency: (n) =>
    n != null ? new Intl.NumberFormat("vi-VN").format(n) + " đồng" : "—",
  numFmt: (n) => (n != null ? new Intl.NumberFormat("vi-VN").format(n) : "0"),
  numFmtOrDash: (n) =>
    n != null ? new Intl.NumberFormat("vi-VN").format(n) : "—",
  invoiceCode: (id) => (id ? `HDB-${String(id).padStart(5, "0")}` : "N/A"),
  contractCode: (id) => (id ? `HD-${String(id).padStart(5, "0")}` : "N/A"),
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

// ── LAYOUT ────────────────────────────────────────────────────────────────────
const PW = 210,
  PH = 297,
  ML = 14,
  MR = 14,
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

const statusLabel = (s) =>
  ({
    DRAFT: "Nháp",
    PENDING: "Chờ thanh toán",
    PARTIAL: "Thanh toán một phần",
    PAID: "Đã thanh toán",
    REFUNDED: "Đã hoàn cọc",
    CANCELLED: "Đã hủy",
  })[s] ||
  s ||
  "—";

// ── SHARED: tiêu đề quốc gia + tên hóa đơn ────────────────────────────────────
const drawPageHeader = (doc, titleText, invoiceId, y) => {
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
  center(doc, titleText, y);
  y += 7;
  setI(doc, 10);
  center(doc, `(Số hóa đơn: ${fmt.invoiceCode(invoiceId)})`, y);
  y += 10;
  return y;
};

// ── SHARED: khối thông tin chung 2 cột ────────────────────────────────────────
const drawInfoBlock = (doc, leftRows, rightRows, y) => {
  const col2 = ML + CW / 2;
  let yL = y,
    yR = y;
  leftRows.forEach(([lbl, val]) => {
    setB(doc, 10);
    doc.text(lbl, ML, yL);
    setN(doc, 10);
    doc.text(val, ML + 40, yL);
    yL += ROW_H;
  });
  rightRows.forEach(([lbl, val]) => {
    setB(doc, 10);
    doc.text(lbl, col2, yR);
    setN(doc, 10);
    doc.text(val, col2 + 40, yR);
    yR += ROW_H;
  });
  y = Math.max(yL, yR) + 4;
  hline(doc, y, ML, PW - MR, 0.5);
  return y + 6;
};

// ── SHARED: chữ ký + footer số trang ─────────────────────────────────────────
const drawSignatureAndFooter = (doc, invoice, y) => {
  y = checkPg(doc, y, 55);
  const td = new Date();
  y += 8;
  setI(doc, 11);
  doc.text(
    `TP. Hồ Chí Minh, ngày ${td.getDate()} tháng ${td.getMonth() + 1} năm ${td.getFullYear()}`,
    PW - MR,
    y,
    { align: "right" },
  );
  y += 10;
  const c1 = ML + CW / 4,
    c2 = ML + (3 * CW) / 4;
  setB(doc, 11);
  doc.text("BÊN CHO THUÊ", c1, y, { align: "center" });
  doc.text("BÊN THUÊ", c2, y, { align: "center" });
  y += 5;
  setI(doc, 10);
  doc.text("(Ký, ghi rõ họ tên)", c1, y, { align: "center" });
  doc.text("(Ký, ghi rõ họ tên)", c2, y, { align: "center" });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    setN(doc, 8);
    doc.setTextColor(130, 130, 130);
    doc.text(
      `Trang ${i}/${totalPages}  –  ${fmt.invoiceCode(invoice.invoiceId)}  –  HĐ: ${fmt.contractCode(invoice.contractId)}`,
      PW / 2,
      PH - 8,
      { align: "center" },
    );
    doc.setTextColor(0, 0, 0);
  }
};

// ── EXPORT DEPOSIT ─────────────────────────────────────────────────────────────
const exportDepositInvoice = (doc, invoice) => {
  const total = Number(invoice.totalAmount ?? 0);
  const paidAmount = Number(invoice.paidAmount ?? 0);
  const remain = total - paidAmount;

  let y = 16;

  // Tiêu đề
  y = drawPageHeader(doc, "BIÊN LAI TIỀN ĐẶT CỌC", invoice.invoiceId, y);

  // Thông tin chung
  y = drawInfoBlock(
    doc,
    [
      ["Số hợp đồng:", fmt.contractCode(invoice.contractId)],
      ["Phòng:", invoice.roomName || "—"],
      ["Trạng thái:", statusLabel(invoice.status)],
    ],
    [
      ["Ngày lập:", fmt.date(invoice.createdAt)],
      ["Người đại diện:", invoice.representativeName || "—"],
      ["Ghi chú:", invoice.notes || "—"],
    ],
    y,
  );

  // Bảng tiền cọc
  setB(doc, 11);
  y = para(doc, "THÔNG TIN TIỀN ĐẶT CỌC", ML, y, CW);
  y += 2;

  autoTable(doc, {
    startY: y,
    margin: { left: ML, right: MR },
    head: [["Hạng mục", "Mô tả", "Số tiền (đồng)"]],
    body: [
      [
        "Tiền đặt cọc",
        `Phòng ${invoice.roomName || "—"} — theo hợp đồng ${fmt.contractCode(invoice.contractId)}`,
        fmt.numFmt(total),
      ],
    ],
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 40, halign: "right" },
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "normal",
      fontSize: 9,
      halign: "center",
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      font: F_BOLD,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      font: F_NORMAL,
    },
    styles: { font: F_NORMAL, cellPadding: 2 },
    theme: "grid",
  });
  y = doc.lastAutoTable.finalY + 6;

  // Lịch sử nộp (nếu có)
  const history = invoice.paymentHistory || [];
  if (history.length > 0) {
    y = checkPg(doc, y, 30);
    setB(doc, 11);
    y = para(doc, "LỊCH SỬ NỘP TIỀN CỌC", ML, y, CW);
    y += 2;

    autoTable(doc, {
      startY: y,
      margin: { left: ML, right: MR },
      head: [["Lần nộp", "Ngày nộp", "Số tiền (đồng)"]],
      body: history.map((p, i) => [
        `Lần ${i + 1}`,
        fmt.date(p.paymentDate),
        fmt.numFmt(p.amount),
      ]),
      columnStyles: {
        0: { cellWidth: 25, halign: "center" },
        1: { cellWidth: 40, halign: "center" },
        2: { cellWidth: "auto", halign: "right" },
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "normal",
        fontSize: 9,
        halign: "center",
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        font: F_BOLD,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        font: F_NORMAL,
      },
      styles: { font: F_NORMAL, cellPadding: 2 },
      theme: "grid",
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // Tổng kết
  y = checkPg(doc, y, 40);
  const sumX = ML + CW * 0.5;

  setN(doc, 10);
  doc.text("Tổng tiền cọc:", sumX, y);
  doc.text(fmt.currency(total), PW - MR, y, { align: "right" });
  y += ROW_H;

  if (paidAmount > 0) {
    setN(doc, 10);
    doc.text("Đã nộp:", sumX, y);
    doc.text(fmt.currency(paidAmount), PW - MR, y, { align: "right" });
    y += ROW_H;
  }

  if (remain > 0) {
    setN(doc, 10);
    doc.setTextColor(220, 38, 38); // đỏ
    doc.text("Còn thiếu:", sumX, y);
    doc.text(fmt.currency(remain), PW - MR, y, { align: "right" });
    doc.setTextColor(0, 0, 0);
    y += ROW_H;
  }

  hline(doc, y, sumX, PW - MR, 0.3);
  y += 4;

  setB(doc, 12);
  const totalLabel =
    invoice.status === "REFUNDED" ? "ĐÃ HOÀN CỌC:" : "TỔNG TIỀN CỌC:";
  doc.text(totalLabel, sumX, y);
  doc.text(fmt.currency(total), PW - MR, y, { align: "right" });
  y += ROW_H + 2;

  setI(doc, 10);
  y = para(doc, `Bằng chữ: ${fmt.numToWords(total)}`, sumX, y, CW * 0.5);
  y += 4;

  // Ghi chú hoàn cọc
  if (invoice.status === "REFUNDED") {
    y = checkPg(doc, y, 20);
    setB(doc, 10);
    doc.setTextColor(109, 40, 217);
    doc.text("* Tiền cọc đã được hoàn trả cho bên thuê.", ML, y);
    doc.setTextColor(0, 0, 0);
    y += ROW_H + 2;
  }

  // Ghi chú
  if (invoice.notes) {
    y = checkPg(doc, y, 20);
    setB(doc, 10);
    doc.text("Ghi chú:", ML, y);
    y += ROW_H;
    setN(doc, 10);
    y = para(doc, invoice.notes, ML + 5, y, CW - 5);
    y += 4;
  }

  drawSignatureAndFooter(doc, invoice, y);
};

// ── EXPORT MONTHLY / REPAIR ────────────────────────────────────────────────────
const exportMonthlyInvoice = (doc, invoice) => {
  const details = invoice.invoiceDetails || [];
  const total =
    invoice.totalAmount != null
      ? Number(invoice.totalAmount)
      : Number(invoice.roomPrice ?? 0) +
        details.reduce((s, d) => s + Number(d.subTotal ?? 0), 0);

  const hasMetered = details.some(
    (d) => d.oldValue != null || d.newValue != null,
  );
  let y = 16;

  // Tiêu đề
  const titleText =
    invoice.type === "REPAIR" ? "HÓA ĐƠN SỬA CHỮA" : "HÓA ĐƠN TIỀN PHÒNG";
  y = drawPageHeader(doc, titleText, invoice.invoiceId, y);

  // Thông tin chung
  const infoL = [
    [
      "Kỳ thanh toán:",
      invoice.type === "REPAIR"
        ? "—"
        : `Tháng ${invoice.periodMonth}/${invoice.periodYear}`,
    ],
    ["Số hợp đồng:", fmt.contractCode(invoice.contractId)],
    ["Phòng:", invoice.roomName || "—"],
  ];
  const infoR = [
    ["Trạng thái:", statusLabel(invoice.status)],
    ["Ngày tạo:", fmt.date(invoice.createdAt)],
    ["Hạn thanh toán:", fmt.date(invoice.dueDate)],
  ];
  y = drawInfoBlock(doc, infoL, infoR, y);

  // Bảng chi tiết
  setB(doc, 11);
  y = para(doc, "CHI TIẾT HÓA ĐƠN", ML, y, CW);
  y += 2;

  const tableHead = hasMetered
    ? [
        "STT",
        "Hạng mục",
        "Đơn vị",
        "Số cũ",
        "Số mới",
        "Số lượng",
        "Đơn giá",
        "Thành tiền",
      ]
    : ["STT", "Hạng mục", "Đơn vị", "Số lượng", "Đơn giá", "Thành tiền"];

  const buildRoomRow = () => {
    const base = ["1", "Tiền phòng", "tháng"];
    if (hasMetered) base.push("—", "—");
    base.push(
      "1",
      fmt.numFmt(invoice.roomPrice),
      fmt.numFmt(invoice.roomPrice),
    );
    return base;
  };
  const roomRow = invoice.roomPrice != null ? [buildRoomRow()] : [];

  const svcRows = details.map((d, i) => {
    const isMetered = d.oldValue != null || d.newValue != null;
    const base = [
      String(roomRow.length + i + 1),
      d.serviceName || "Dịch vụ",
      d.unit || "—",
    ];
    if (hasMetered) {
      base.push(
        isMetered ? fmt.numFmtOrDash(d.oldValue) : "—",
        isMetered ? fmt.numFmtOrDash(d.newValue) : "—",
      );
    }
    base.push(
      d.quantity != null ? fmt.numFmt(d.quantity) : "—",
      d.unitPrice != null ? fmt.numFmt(d.unitPrice) : "—",
      d.subTotal != null ? fmt.numFmt(d.subTotal) : "—",
    );
    return base;
  });

  const allRows = [...roomRow, ...svcRows];
  const emptyRow = hasMetered
    ? ["", "(Chưa có chi tiết)", "", "", "", "", "", ""]
    : ["", "(Chưa có chi tiết)", "", "", "", ""];

  const colStylesWithMeter = {
    0: { cellWidth: 8, halign: "center" },
    1: { cellWidth: "auto" },
    2: { cellWidth: 16, halign: "center" },
    3: { cellWidth: 20, halign: "right" },
    4: { cellWidth: 20, halign: "right" },
    5: { cellWidth: 18, halign: "right" },
    6: { cellWidth: 26, halign: "right" },
    7: { cellWidth: 26, halign: "right" },
  };
  const colStylesNoMeter = {
    0: { cellWidth: 10, halign: "center" },
    1: { cellWidth: "auto" },
    2: { cellWidth: 18, halign: "center" },
    3: { cellWidth: 22, halign: "right" },
    4: { cellWidth: 30, halign: "right" },
    5: { cellWidth: 30, halign: "right" },
  };

  autoTable(doc, {
    startY: y,
    margin: { left: ML, right: MR },
    head: [tableHead],
    body: allRows.length > 0 ? allRows : [emptyRow],
    columnStyles: hasMetered ? colStylesWithMeter : colStylesNoMeter,
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "normal",
      fontSize: 9,
      halign: "center",
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      font: F_BOLD,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      font: F_NORMAL,
    },
    styles: { font: F_NORMAL, cellPadding: 2 },
    theme: "grid",
  });
  y = doc.lastAutoTable.finalY + 4;

  // Tổng cộng
  y = checkPg(doc, y, 30);
  const sumX = ML + CW * 0.5;

  if (invoice.roomPrice != null) {
    setN(doc, 10);
    doc.text("Tiền phòng:", sumX, y);
    doc.text(fmt.currency(invoice.roomPrice), PW - MR, y, { align: "right" });
    y += ROW_H;
  }
  if (details.length > 0) {
    const svcSum = details.reduce((s, d) => s + Number(d.subTotal ?? 0), 0);
    setN(doc, 10);
    doc.text("Tiền dịch vụ:", sumX, y);
    doc.text(fmt.currency(svcSum), PW - MR, y, { align: "right" });
    y += ROW_H;
  }
  hline(doc, y, sumX, PW - MR, 0.3);
  y += 4;

  setB(doc, 12);
  doc.text("TỔNG CỘNG:", sumX, y);
  doc.text(fmt.currency(total), PW - MR, y, { align: "right" });
  y += ROW_H + 2;

  setI(doc, 10);
  y = para(doc, `Bằng chữ: ${fmt.numToWords(total)}`, sumX, y, CW * 0.5);
  y += 6;

  if (invoice.notes) {
    y = checkPg(doc, y, 20);
    setB(doc, 10);
    doc.text("Ghi chú:", ML, y);
    y += ROW_H;
    setN(doc, 10);
    y = para(doc, invoice.notes, ML + 5, y, CW - 5);
    y += 4;
  }

  drawSignatureAndFooter(doc, invoice, y);
};

// ── MAIN EXPORT (điểm vào duy nhất) ───────────────────────────────────────────
export const exportInvoiceToPDF = ({ invoice }) => {
  if (!invoice) return;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  if (invoice.type === "DEPOSIT") {
    exportDepositInvoice(doc, invoice);
  } else {
    // MONTHLY và REPAIR đều dùng cùng layout chi tiết dịch vụ
    exportMonthlyInvoice(doc, invoice);
  }

  doc.save(`HoaDon_${fmt.invoiceCode(invoice.invoiceId)}.pdf`);
};
