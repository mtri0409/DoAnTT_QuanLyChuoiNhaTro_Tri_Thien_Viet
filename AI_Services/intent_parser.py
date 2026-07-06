import re
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple


DEBT_KEYWORDS = [
    "nợ", "nợ tiền", "chưa đóng", "chưa thanh toán", "chậm đóng", "quá hạn",
    "trốn tiền", "trốn bill", "nợ hóa đơn", "nợ tiền điện", "nợ tiền nước",
    "chưa đóng tiền", "chưa nộp", "đóng muộn", "cư dân nợ", "nợ phòng", "nợ tiền phòng",
    "nợ tiền nhà", "nợ tiền phòng"
]

REVENUE_KEYWORDS = [
    "doanh thu", "doanh thủ", "doang thu", "thu nhập", "báo cáo", "tài chính", "thu về", "doanh số",
    "số tiền thu", "kinh doanh", "so sánh doanh thu", "tiền phòng", "doanh thu phòng", "doanh thu thuê"
]

GREETING_KEYWORDS = ["xin chào", "chào", "cảm ơn", "thank", "giới thiệu", "hướng dẫn", "ai", "hello", "hi"]

CONTRACT_KEYWORDS = [
    "hợp đồng", "hết hạn", "hợp đồng hết hạn", "hợp đồng sắp hết hạn", "hợp đồng đã hết hạn",
    "danh sách hợp đồng", "contract expired", "expired contract", "hết hạn hợp đồng",
    "đang hiệu lực", "chờ bắt đầu", "chưa bắt đầu", "chấm dứt", "bị hủy", "đặt cọc", "đã cọc",
    "hủy hợp đồng", "chấm dứt hợp đồng", "hợp đồng sắp đáo hạn"
]

EXPIRING_KEYWORDS = [
    "sắp hết hạn", "sắp đáo hạn", "sắp tới hạn", "hết hạn trong tháng", "đáo hạn trong tháng",
    "hết hạn tháng này", "hết hạn tháng tới", "hạn hợp đồng", "hạn hợp đồng tới"
]

ROOM_STATUS_KEYWORDS = [
    "phòng trống", "phòng đã thuê", "trạng thái phòng", "tình trạng phòng", "còn trống",
    "hết phòng", "phòng đang trống", "phòng chưa thuê", "trống phòng", "thuê phòng", "tỷ lệ phòng", "số lượng phòng"
]

VACANT_ROOMS_KEYWORDS = [
    "liệt kê phòng trống", "danh sách phòng trống", "phòng nào trống", "phòng nào còn trống",
    "phòng trống nào", "liet ke phong trong", "danh sach phong trong", "phòng trống còn lại", "danh sách các phòng trống",
    "còn trống bao nhiêu", "phòng trống bao nhiêu"
]

COMPARE_KEYWORDS = [
    "so sánh", "đối chiếu", "so sanh", "tỷ lệ phòng trống", "tỉ lệ phòng trống",
    "số lượng người giữa các chi nhánh", "so sánh doanh thu", "so sánh chi nhánh", "các chi nhánh", "so sánh các chi nhánh",
    "giữa các chi nhánh", "giữa chi nhánh", "so sánh các", "đối chiếu"
]

UTILITY_KEYWORDS = [
    "điện nước", "tiền điện", "tiền nước", "nước dùng", "dùng nước", "điện tiêu thụ", "nước tiêu thụ",
    "số nước", "chỉ số nước", "số lượng nước", "số điện", "chỉ số điện", "lượng nước", "lượng điện",
    "tiêu thụ điện", "tiêu thụ nước", "hóa đơn điện", "hóa đơn nước"
]

CONTRACT_STATUS_MAP = {
    "hết hạn": "EXPIRED",
    "hết hạn tự nhiên": "EXPIRED",
    "hợp đồng hết hạn": "EXPIRED",
    "hợp đồng đã hết hạn": "EXPIRED",
    "sắp hết hạn": "EXPIRED",
    "đang hiệu lực": "ACTIVE",
    "đang có hiệu lực": "ACTIVE",
    "còn hiệu lực": "ACTIVE",
    "chờ bắt đầu": "PENDING",
    "chưa bắt đầu": "PENDING",
    "chưa active": "PENDING",
    "chấm dứt": "TERMINATED",
    "chấm dứt sớm": "TERMINATED",
    "đã chấm dứt": "TERMINATED",
    "bị hủy": "CANCELLED",
    "đã hủy": "CANCELLED",
    "hủy trước": "CANCELLED",
    "đặt cọc": "DEPOSITED",
    "đã cọc": "DEPOSITED",
    "cọc trước": "DEPOSITED",
}

TOOL_DEFINITIONS = {
    "get_detailed_debtors": {
        "description": "Lấy danh sách cư dân có hóa đơn/chuyến nợ và các thông tin chi tiết.",
        "maps_to": "get_detailed_debtors"
    },
    "get_overdue_debtors": {
        "description": "Lấy danh sách cư dân nợ quá hạn hoặc chậm thanh toán.",
        "maps_to": "get_detailed_debtors"
    },
    "get_revenue_stats": {
        "description": "Lấy thống kê doanh thu theo tháng/năm/chi nhánh.",
        "maps_to": "get_revenue_stats"
    },
    "get_revenue_by_branch": {
        "description": "Lấy thống kê doanh thu của một chi nhánh cụ thể.",
        "maps_to": "get_revenue_stats"
    },
    "get_expired_contracts": {
        "description": "Lấy danh sách hợp đồng đã hết hạn.",
        "maps_to": "get_contracts_by_status"
    },
    "get_contracts_expiring_in_month": {
        "description": "Lấy danh sách hợp đồng sắp hết hạn trong tháng.",
        "maps_to": "get_contracts_expiring_in_month"
    },
    "get_expiring_contracts": {
        "description": "Lấy danh sách hợp đồng sắp hết hạn.",
        "maps_to": "get_contracts_expiring_in_month"
    },
    "get_room_status": {
        "description": "Lấy thống kê số lượng phòng trống và phòng đã thuê theo chi nhánh.",
        "maps_to": "get_room_status"
    },
    "compare_branches": {
        "description": "So sánh doanh thu, tỷ lệ phòng trống/đã thuê, và số lượng người ở giữa tất cả các chi nhánh.",
        "maps_to": "compare_branches"
    },
    "get_vacant_rooms_list": {
        "description": "Liệt kê danh sách chi tiết các phòng trống.",
        "maps_to": "get_vacant_rooms_list"
    },
    "get_utility_stats": {
        "description": "Lấy thống kê tiêu thụ điện nước và số tiền điện nước tương ứng.",
        "maps_to": "get_utility_stats"
    },
}


def normalize_tool_name(tool_name: Optional[str]) -> str:
    if not tool_name:
        return "none"
    normalized = tool_name.strip().lower()
    mapping = {
        "get_overdue_debtors": "get_detailed_debtors",
        "get_revenue_by_branch": "get_revenue_stats",
        "get_revenue_summary": "get_revenue_stats",
        "get_debtors": "get_detailed_debtors",
        "get_debt_summary": "get_detailed_debtors",
        "get_expiring_contracts": "get_contracts_expiring_in_month",
        "get_expired_contracts": "get_contracts_by_status",
        "compare_branches": "compare_branches",
        "get_vacant_rooms_list": "get_vacant_rooms_list",
        "get_utility_stats": "get_utility_stats"
    }
    return mapping.get(normalized, normalized)


def extract_contract_status(message: str) -> Optional[str]:
    """
    Trích xuất trạng thái hợp đồng từ câu hỏi tiếng Việt.
    Trả về: PENDING | ACTIVE | EXPIRED | TERMINATED | CANCELLED | DEPOSITED | None
    """
    text = message.strip().lower()
    # Ưu tiên cụm dài trước
    sorted_keywords = sorted(CONTRACT_STATUS_MAP.keys(), key=len, reverse=True)
    for keyword in sorted_keywords:
        if keyword in text:
            return CONTRACT_STATUS_MAP[keyword]
    return None


def infer_intent(message: str, now: Optional[datetime] = None) -> Dict[str, object]:
    """
    Phân tích ý định bằng quy tắc trước, rồi mới dùng AI nếu cần.
    Luôn đảm bảo month/year có giá trị mặc định hợp lý cho các câu hỏi tài chính.
    """
    if not message or not message.strip():
        return {"tool": "none", "args": {"branch_name": None, "month": None, "year": None}}

    text = message.strip().lower()
    normalized_text = " ".join(text.split())
    now = now or datetime.now()

    has_greeting = any(k in normalized_text for k in GREETING_KEYWORDS)
    has_compare = any(k in normalized_text for k in COMPARE_KEYWORDS)
    has_debt = any(k in normalized_text for k in DEBT_KEYWORDS)
    has_utility = any(k in normalized_text for k in UTILITY_KEYWORDS)
    has_vacant = any(k in normalized_text for k in VACANT_ROOMS_KEYWORDS)
    has_room_status = any(k in normalized_text for k in ROOM_STATUS_KEYWORDS)
    has_expiring = any(k in normalized_text for k in EXPIRING_KEYWORDS)
    has_contract = any(k in normalized_text for k in CONTRACT_KEYWORDS)
    has_revenue = any(k in normalized_text for k in REVENUE_KEYWORDS)

    tool = "none"
    if has_compare:
        tool = "compare_branches"
    elif has_debt:
        tool = "get_detailed_debtors"
    elif has_utility:
        tool = "get_utility_stats"
    elif has_vacant:
        tool = "get_vacant_rooms_list"
    elif has_room_status:
        tool = "get_room_status"
    elif has_expiring:
        tool = "get_contracts_expiring_in_month"
    elif has_contract:
        tool = "get_contracts_by_status"
    elif has_revenue:
        tool = "get_revenue_stats"
    elif has_greeting:
        tool = "none"

    # Nếu có ý rõ ràng so sánh giữa các chi nhánh nhưng hệ thống chưa nhận diện compare keyword,
    # giữ compare chỉ khi có từ khóa so sánh rõ ràng hoặc khi có cả doanh thu và nợ/room status cụm từ so sánh.
    if tool == "get_revenue_stats" and has_compare:
        tool = "compare_branches"

    args: Dict[str, Optional[object]] = {"branch_name": None, "month": None, "year": None, "status": None}

    # Trích xuất tên chi nhánh
    branch_name = extract_branch_name(message)
    if branch_name:
        args["branch_name"] = branch_name

    # Trích xuất trạng thái hợp đồng
    contract_status = extract_contract_status(message)
    if contract_status:
        args["status"] = contract_status


    # Trích xuất tháng/năm theo quy tắc thời gian mới
    month, year = extract_time_context(message, now)
    args["month"] = month
    args["year"] = year


    # Mặc định dùng tháng/năm hiện tại cho get_contracts_expiring_in_month nếu không đề cập tháng
    if tool in {"get_contracts_expiring_in_month"}:
        if args["month"] is None:
            args["month"] = now.month
        if args["year"] is None:
            args["year"] = now.year

    # Guardrails: tháng/năm vượt ngưỡng thì fallback none
    if args.get("month") is not None and not (1 <= args["month"] <= 12):
        tool = "none"
        args = {"branch_name": None, "month": None, "year": None, "status": None}
    if args.get("year") is not None and not (2020 <= args["year"] <= 2026):
        tool = "none"
        args = {"branch_name": None, "month": None, "year": None, "status": None}

    return {"tool": tool, "args": args}


def extract_time_context(message: str, now: datetime) -> Tuple[Optional[int], Optional[int]]:
    """
    Trích xuất tháng/năm từ câu hỏi tiếng Việt.
    Trả về: (month, year) với None nếu không xác định.
    """
    text = message.lower()

    # Mốc thờ gian tương đối
    if "năm ngoái" in text or "năm trước" in text:
        return None, now.year - 1
    if "năm nay" in text or "năm hiện tại" in text:
        return None, now.year
    if "tháng này" in text or "tháng hiện tại" in text or "tính đến nay" in text:
        return now.month, now.year
    if "tháng trước" in text or "tháng vừa rồi" in text:
        prev = now.replace(day=1) - timedelta(days=1)
        return prev.month, prev.year
    if "tháng sau" in text or "tháng tới" in text:
        nxt = now.replace(day=28) + timedelta(days=4)
        nxt = nxt.replace(day=1)
        return nxt.month, nxt.year

    # Quý
    quarter_match = re.search(r"quý\s*(\d+)", text)
    if quarter_match:
        q = int(quarter_match.group(1))
        if 1 <= q <= 4:
            # Lấy năm đi kèm nếu có
            year_match = re.search(r"(\d{4})", text)
            year = int(year_match.group(1)) if year_match else now.year
            return None, year

    # Ngày/tháng hoặc tháng/năm
    # Ưu tiên pattern tháng/năm trước
    patterns = [
        r"tháng\s*(\d{1,2})\s*năm\s*(\d{4})",
        r"(\d{1,2})\s*/\s*(\d{4})",
        r"tháng\s*(\d{1,2})\b",
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if not match:
            continue
        groups = match.groups()
        if len(groups) == 2 and groups[0] and groups[1]:
            month = int(groups[0])
            year = int(groups[1])
            if 1 <= month <= 12:
                return month, year
        if len(groups) == 1 and groups[0]:
            month = int(groups[0])
            if 1 <= month <= 12:
                year_match = re.search(r"năm\s*(\d{4})", text)
                year = int(year_match.group(1)) if year_match else now.year
                return month, year

    year_match = re.search(r"năm\s*(\d{4})", text)
    if year_match:
        return None, int(year_match.group(1))

    return None, None


def extract_branch_name(message: str) -> Optional[str]:
    patterns = [
        r"\bchi nhánh\b\s+([^,.;:!?]+)",
        r"\bnhà trọ\b\s+([^,.;:!?]+)",
        r"\btại\b\s+([^,.;:!?]+)",
        r"\bở\b\s+([^,.;:!?]+)",
        r"\bcủa\b\s+([^,.;:!?]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, message, flags=re.IGNORECASE)
        if match:
            value = match.group(1).strip()
            value = re.split(r"\b(?:ngày|tháng|thang|năm|year|quý|qui|giữa|và|cùng)\b", value, maxsplit=1)[0].strip()
            value = re.sub(r"\b(?:ngày|tháng|thang|năm|year)\s*\d{1,2}(?:/\d{1,2})?(?:/\d{2,4})?\b", "", value, flags=re.IGNORECASE).strip()
            value = value.rstrip(" ,.;:-")
            if value:
                val_lower = value.lower()
                generic_terms = [
                    "2 chi nhánh", "hai chi nhánh", "các chi nhánh", "mọi chi nhánh",
                    "tất cả chi nhánh", "tất cả", "các", "mọi", "chi nhánh nào", "chi nhánh"
                ]
                if val_lower in generic_terms:
                    continue
                if re.match(r"^\d+\s*chi\s*nhánh", val_lower) or val_lower.isdigit():
                    continue
                return value

    # Fallback tên chi nhánh riêng lẻ hoặc quận
    branch_name_match = re.search(r"\b(bình thạnh|thủ đức|thủduc|quận\s*\d+|q\.?\s*\d+|bình tân|gò vấp|tân bình|quận bình thạnh)\b", message, flags=re.IGNORECASE)
    if branch_name_match:
        return branch_name_match.group(1).strip()

    return None

