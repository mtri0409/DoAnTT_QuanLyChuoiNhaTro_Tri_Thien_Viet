import _XLSX from 'xlsx-js-style';
const XLSX = _XLSX.default || _XLSX;

/**
 * Hàm phụ trợ để trang trí style và tự động chỉnh độ rộng cột cho Worksheet
 */
const styleWorksheet = (worksheet) => {
  if (!worksheet || !worksheet['!ref']) return;

  const headerStyle = {
    font: { name: 'Arial', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '2563EB' } }, // Màu xanh Primary Blue #2563eb
    alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: 'CCCCCC' } },
      bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
      left: { style: 'thin', color: { rgb: 'CCCCCC' } },
      right: { style: 'thin', color: { rgb: 'CCCCCC' } }
    }
  };

  const bodyStyle = {
    font: { name: 'Arial', sz: 10 },
    alignment: { vertical: 'center', horizontal: 'left' },
    border: {
      top: { style: 'thin', color: { rgb: 'E5E7EB' } },
      bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
      left: { style: 'thin', color: { rgb: 'E5E7EB' } },
      right: { style: 'thin', color: { rgb: 'E5E7EB' } }
    }
  };

  const range = XLSX.utils.decode_range(worksheet['!ref']);
  const colWidths = [];

  // Khởi tạo độ rộng ban đầu cho các cột
  for (let C = range.s.c; C <= range.e.c; ++C) {
    colWidths[C] = 10;
  }

  // Quét qua từng cell để tô style và tính độ rộng cột
  for (const key in worksheet) {
    if (key[0] === '!') continue; // Bỏ qua thuộc tính meta

    const cell = worksheet[key];
    const cellRef = XLSX.utils.decode_cell(key);

    if (cellRef.r === 0) {
      // Header row
      cell.s = { ...headerStyle };
    } else {
      // Body rows
      cell.s = { ...bodyStyle };
      
      // Tự động căn phải nếu là số, căn giữa nếu là ngày/tháng
      if (typeof cell.v === 'number') {
        cell.s.alignment = { ...bodyStyle.alignment, horizontal: 'right' };
      }
    }

    // Tính toán độ rộng tự động của cột (Auto-fit)
    const valStr = cell.v ? String(cell.v) : '';
    if (colWidths[cellRef.c] < valStr.length + 3) {
      colWidths[cellRef.c] = valStr.length + 5; // Cộng thêm đệm
    }
  }

  // Gán độ rộng cột cho Worksheet
  worksheet['!cols'] = colWidths.map(w => ({ wch: w }));
};

/**
 * Xuất mảng dữ liệu JSON thành file Excel (.xlsx) có định dạng màu sắc & căn lề
 * @param {Array} data - Mảng dữ liệu JSON
 * @param {string} fileName - Tên file excel muốn lưu
 * @param {string} sheetName - Tên sheet trong file excel
 */
export const exportToExcel = (data, fileName = 'bao_cao', sheetName = 'Sheet1') => {
  if (!data || data.length === 0) {
    alert('Không có dữ liệu để xuất Excel!');
    return;
  }

  try {
    // 1. Chuyển đổi dữ liệu JSON thành Worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2. Trang trí màu sắc và căn chỉnh độ rộng cột
    styleWorksheet(worksheet);

    // 3. Tạo một Workbook mới và thêm Worksheet vào
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 4. Xuất workbook thành file và tự động tải về
    const formattedDate = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
    XLSX.writeFile(workbook, `${fileName}_${formattedDate}.xlsx`);
  } catch (error) {
    console.error('Lỗi khi xuất file Excel:', error);
    alert('Đã xảy ra lỗi trong quá trình tạo file Excel!');
  }
};
