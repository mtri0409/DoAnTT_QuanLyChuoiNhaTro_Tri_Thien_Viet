"""
Unified AI Tools & HTTP Client
"""
import requests
import json
import os
import re
from typing import Optional, Dict, Any, List
from models import ChatPayload
import logging

logger = logging.getLogger(__name__)


def call_ai_unified(
    endpoint: str,
    api_key: str,
    model_name: str,
    prompt: str,
    system_instruction: Optional[str] = None,
    temperature: float = 0.1,
    history: Optional[List[Dict[str, str]]] = None
) -> str:
    """
    Hàm gọi AI hợp nhất sử dụng HTTP POST chuẩn tương thích OpenAI.
    Tự động chuẩn hóa endpoint và cấu trúc JSON payload.
    Hỗ trợ truyền lịch sử hội thoại (history) dưới dạng danh sách tin nhắn.
    """
    if not endpoint or not endpoint.strip():
        return "Thiếu endpoint AI Gateway. Vui lòng kiểm tra cấu hình AI."
    if not api_key or not api_key.strip():
        return "Thiếu API key cho AI Gateway. Vui lòng kiểm tra cấu hình AI."
    if not model_name or not model_name.strip():
        return "Thiếu tên mô hình AI. Vui lòng kiểm tra cấu hình AI."

    # 1. Chuẩn hóa Endpoint về đuôi /v1/chat/completions
    url = endpoint.strip().rstrip('/')
    if not url.endswith('/chat/completions'):
        if url.endswith('/v1'):
            url = f"{url}/chat/completions"
        else:
            url = f"{url}/v1/chat/completions"

    logger.info(f"[AI Gateway] Chuẩn hóa endpoint: {endpoint!r} -> {url}")
    logger.info(f"[AI Gateway] Model: {model_name}, Prompt length: {len(prompt)}, System instruction length: {len(system_instruction) if system_instruction else 0}, History length: {len(history) if history else 0}")

    # 2. Thiết lập Header xác thực chung
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # 3. Gom cấu trúc Messages (System Prompt + History + User Prompt)
    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    
    if history:
        # Clone history and append them
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Avoid duplicating the user message if it's already the last message in history
        if prompt and history[-1]["content"] != prompt:
            messages.append({"role": "user", "content": prompt})
    else:
        messages.append({"role": "user", "content": prompt})

    # 4. Đóng gói payload gửi đi
    payload = {
        "model": model_name,
        "messages": messages,
        "temperature": temperature
    }

    try:
        logger.info(f"[AI Gateway] POST {url} với payload model={model_name}, temperature={temperature}")
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        logger.info(f"[AI Gateway] Response status: {response.status_code}")
        if response.status_code >= 400:
            error_text = response.text[:1000]
            logger.error(f"AI Gateway Error status={response.status_code}: {error_text}")
            return f"Lỗi AI Gateway ({response.status_code}): {error_text}"

        result_json = response.json()
        choices = result_json.get("choices", [])
        logger.info(f"[AI Gateway] Choices count: {len(choices)}")
        if not choices:
            logger.warning("[AI Gateway] Không có choices trong response")
            return "AI Gateway không trả về nội dung hợp lệ."
        message = choices[0].get("message", {})
        content = message.get("content", "")
        logger.info(f"[AI Gateway] Nội dung phản hồi (200 chars đầu): {content[:200]!r}")
        return content
    except Exception as e:
        logger.error(f"AI Gateway Error: {str(e)}", exc_info=True)
        return f"Lỗi kết nối AI Gateway: {str(e)}"


def get_ai_config(java_backend_url: str) -> Dict[str, str]:
    """
    Lấy cấu hình AI từ Java Backend (API_KEY, BASE_URL, MODEL)
    Args:
        java_backend_url: Base URL của Java Backend
    Returns:
        Dict[str, str]: Cấu hình AI
    """
    url = f"{java_backend_url}/api/v1/internal/ai-tools/ai-config"
    logger.info(f"[Java Backend] Gọi GET {url}")
    try:
        response = requests.get(url, timeout=30.0)
        response.raise_for_status()
        data = response.json()
        logger.info(f"[Java Backend] AI config keys: {list(data.keys())}")
        return data
    except Exception as e:
        logger.error(f"Error fetching AI config: {str(e)}", exc_info=True)
        return {
            "API_KEY": os.getenv("DEFAULT_AI_API_KEY", ""),
            "BASE_URL": os.getenv("DEFAULT_AI_BASE_URL", ""),
            "MODEL": os.getenv("DEFAULT_AI_MODEL", "")
        }

def get_detailed_debtors(
    java_backend_url: str,
    branch_name: Optional[str] = None,
    month: Optional[int] = None,
    year: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Lấy danh sách cư dân nợ hóa đơn từ Java Backend
    Args:
        java_backend_url: Base URL của Java Backend
        branch_name: Tên chi nhánh (tùy chọn)
        month: Tháng (tùy chọn)
        year: Năm (tùy chọn)
    Returns:
        List[Dict]: Danh sách nợ thô (JSON)
    """
    url = f"{java_backend_url}/api/v1/internal/ai-tools/debtors"
    params = {}
    if branch_name:
        params["branchName"] = branch_name
    if month:
        params["month"] = month
    if year:
        params["year"] = year

    logger.info(f"[Java Backend] Gọi GET {url} với params={params}")
    try:
        response = requests.get(url, params=params, timeout=30.0)
        response.raise_for_status()
        data = response.json()
        logger.info(f"[Java Backend] Debtors count: {len(data)}")
        logger.info(f"[Java Backend JSON Output] {json.dumps(data, ensure_ascii=False)}")
        return data
    except Exception as e:
        logger.error(f"Error fetching debtors: {str(e)}", exc_info=True)
        return []


def get_room_status(
    java_backend_url: str,
    branch_name: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Lấy thống kê tình trạng phòng trống / đã thuê từ Java Backend
    Args:
        java_backend_url: Base URL của Java Backend
        branch_name: Tên chi nhánh (tùy chọn)
    Returns:
        List[Dict]: Thống kê tình trạng phòng thô (JSON)
    """
    url = f"{java_backend_url}/api/v1/internal/ai-tools/room-status"
    params = {}
    if branch_name:
        params["branchName"] = branch_name

    logger.info(f"[Java Backend] Gọi GET {url} với params={params}")
    try:
        response = requests.get(url, params=params, timeout=30.0)
        response.raise_for_status()
        data = response.json()
        logger.info(f"[Java Backend] Room status count: {len(data)}")
        logger.info(f"[Java Backend JSON Output] {json.dumps(data, ensure_ascii=False)}")
        return data
    except Exception as e:
        logger.error(f"Error fetching room status: {str(e)}", exc_info=True)
        return []


def get_revenue_stats(
    java_backend_url: str,
    branch_name: Optional[str] = None,
    month: Optional[int] = None,
    year: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Lấy thống kê doanh thu từ Java Backend
    Args:
        java_backend_url: Base URL của Java Backend
        branch_name: Tên chi nhánh (tùy chọn)
        month: Tháng (tùy chọn)
        year: Năm (tùy chọn)
    Returns:
        List[Dict]: Thống kê doanh thu thô (JSON)
    """
    url = f"{java_backend_url}/api/v1/internal/ai-tools/revenue-stats"
    params = {}
    if branch_name:
        params["branchName"] = branch_name
    if month:
        params["month"] = month
    if year:
        params["year"] = year

    logger.info(f"[Java Backend] Gọi GET {url} với params={params}")
    try:
        response = requests.get(url, params=params, timeout=30.0)
        response.raise_for_status()
        data = response.json()
        logger.info(f"[Java Backend] Revenue stats count: {len(data)}")
        logger.info(f"[Java Backend JSON Output] {json.dumps(data, ensure_ascii=False)}")
        return data
    except Exception as e:
        logger.error(f"Error fetching revenue stats: {str(e)}", exc_info=True)
        return []




def get_contracts_expiring_in_month(
    java_backend_url: str,
    month: Optional[int] = None,
    year: Optional[int] = None,
    branch_name: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Lấy danh sách hợp đồng sắp hết hạn trong tháng từ Java Backend
    Args:
        java_backend_url: Base URL của Java Backend
        month: Tháng (tùy chọn)
        year: Năm (tùy chọn)
        branch_name: Tên chi nhánh (tùy chọn)
    Returns:
        List[Dict]: Danh sách hợp đồng sắp hết hạn thô (JSON)
    """
    url = f"{java_backend_url}/api/v1/internal/ai-tools/contracts-expiring-in-month"
    params = {}
    if month:
        params["month"] = month
    if year:
        params["year"] = year
    if branch_name:
        params["branchName"] = branch_name

    logger.info(f"[Java Backend] Gọi GET {url} với params={params}")
    try:
        response = requests.get(url, params=params, timeout=30.0)
        response.raise_for_status()
        data = response.json()
        logger.info(f"[Java Backend] Contracts expiring in month count: {len(data)}")
        logger.info(f"[Java Backend JSON Output] {json.dumps(data, ensure_ascii=False)}")
        return data
    except Exception as e:
        logger.error(f"Error fetching contracts expiring in month: {str(e)}", exc_info=True)
        return []


def get_contracts_by_status(
    java_backend_url: str,
    status: Optional[str] = None,
    branch_name: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Lấy danh sách hợp đồng theo trạng thái từ Java Backend
    Args:
        java_backend_url: Base URL của Java Backend
        status: (Optional) Trạng thái hợp đồng (PENDING, ACTIVE, EXPIRED, TERMINATED, CANCELLED, DEPOSITED). Mặc định EXPIRED.
        branch_name: Tên chi nhánh (tùy chọn)
    Returns:
        List<Dict>: Danh sách hợp đồng thô (JSON)
    """
    url = f"{java_backend_url}/api/v1/internal/ai-tools/contracts-by-status"
    params = {}
    if status:
        params["status"] = status
    if branch_name:
        params["branchName"] = branch_name

    logger.info(f"[Java Backend] Gọi GET {url} với params={params}")
    try:
        response = requests.get(url, params=params, timeout=30.0)
        response.raise_for_status()
        data = response.json()
        logger.info(f"[Java Backend] Contracts by status count: {len(data)}")
        logger.info(f"[Java Backend JSON Output] {json.dumps(data, ensure_ascii=False)}")
        return data
    except Exception as e:
        logger.error(f"Error fetching contracts by status: {str(e)}", exc_info=True)
        return []


def get_tenant_count_stats(
    java_backend_url: str,
    branch_name: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Lấy thống kê số lượng người ở theo chi nhánh từ Java Backend
    Args:
        java_backend_url: Base URL của Java Backend
        branch_name: Tên chi nhánh (tùy chọn)
    Returns:
        List[Dict]: Thống kê số người thô (JSON)
    """
    url = f"{java_backend_url}/api/v1/internal/ai-tools/tenant-count"
    params = {}
    if branch_name:
        params["branchName"] = branch_name

    logger.info(f"[Java Backend] Gọi GET {url} với params={params}")
    try:
        response = requests.get(url, params=params, timeout=30.0)
        response.raise_for_status()
        data = response.json()
        logger.info(f"[Java Backend] Tenant count stats count: {len(data)}")
        logger.info(f"[Java Backend JSON Output] {json.dumps(data, ensure_ascii=False)}")
        return data
    except Exception as e:
        logger.error(f"Error fetching tenant count stats: {str(e)}", exc_info=True)
        return []


def is_branch_match(b_name: str, requested_branch: str) -> bool:
    """
    Hàm so khớp tên chi nhánh linh hoạt hỗ trợ so sánh nhiều chi nhánh.
    Ví dụ:
      - b_name = "Chi nhánh Quận 9", requested_branch = "quận 9 và thủ đức" -> True
      - b_name = "Chi nhánh Thủ Đức", requested_branch = "quận 9 và thủ đức" -> True
      - b_name = "Chi nhánh 1", requested_branch = "1 và chi nhánh 2" -> True
    """
    if not requested_branch:
        return True
        
    def clean_str(s: str) -> str:
        s_clean = s.lower()
        for kw in ["chi nhánh", "cn", "và", "and", "của"]:
            s_clean = s_clean.replace(kw, " ")
        return " ".join(s_clean.split())
        
    b_clean = clean_str(b_name)
    req_clean = clean_str(requested_branch)
    
    if not b_clean or not req_clean:
        return False
        
    # So khớp chuỗi trực tiếp sau khi làm sạch
    if b_clean == req_clean:
        return True
        
    # Kiểm tra xem b_clean có tồn tại dưới dạng cụm từ riêng biệt trong req_clean không
    pattern_b = r'\b' + re.escape(b_clean) + r'\b'
    if re.search(pattern_b, req_clean):
        return True
        
    # Kiểm tra xem req_clean có tồn tại dưới dạng cụm từ riêng biệt trong b_clean không
    pattern_req = r'\b' + re.escape(req_clean) + r'\b'
    if re.search(pattern_req, b_clean):
        return True
        
    # So khớp dựa trên tập hợp từ để tránh lệch thứ tự hoặc khớp sai từ một phần (ví dụ: 1 và 11)
    b_words = b_clean.split()
    req_words = req_clean.split()
    
    # Nếu tất cả các từ của b_clean đều nằm trong req_words
    if all(w in req_words for w in b_words):
        return True
        
    # Nếu tất cả các từ của req_clean đều nằm trong b_words
    if all(w in b_words for w in req_words):
        return True
        
    return False


def compare_branches(
    java_backend_url: str,
    branch_name: Optional[str] = None,
    month: Optional[int] = None,
    year: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    So sánh doanh thu, tỷ lệ phòng trống, và số lượng người ở giữa các chi nhánh
    Args:
        java_backend_url: Base URL của Java Backend
        branch_name: Tên chi nhánh (tùy chọn)
        month: Tháng (tùy chọn)
        year: Năm (tùy chọn)
    Returns:
        List[Dict]: Bảng so sánh các chi nhánh
    """
    logger.info(f"[Tools] Bắt đầu so sánh giữa các chi nhánh: branch_name={branch_name}, month={month}, year={year}")
    
    # 1. Lấy dữ liệu doanh thu cho tất cả chi nhánh để so sánh chéo/lọc
    revenue_data = get_revenue_stats(java_backend_url, None, month, year)
    
    # 2. Lấy dữ liệu tình trạng phòng cho tất cả chi nhánh
    room_data = get_room_status(java_backend_url, None)
    
    # 3. Lấy dữ liệu số lượng người ở cho tất cả chi nhánh
    tenant_data = get_tenant_count_stats(java_backend_url, None)

    # 4. Lấy dữ liệu hóa đơn nợ cho tất cả chi nhánh
    debt_data = get_detailed_debtors(java_backend_url, None, month, year)
    
    # Tổ chức gom nhóm theo chi nhánh
    branches_dict = {}
    
    def get_default_branch_data(name):
        return {
            "branch_name": name,
            "total_revenue": 0.0,
            "invoice_count": 0,
            "occupied_rooms": 0,
            "vacant_rooms": 0,
            "tenant_count": 0,
            "debt_invoice_count": 0,
            "total_debt_amount": 0.0
        }
    
    # Xử lý Doanh thu
    for item in revenue_data:
        b_name = item.get("branch_name")
        if not b_name:
            continue
        if b_name not in branches_dict:
            branches_dict[b_name] = get_default_branch_data(b_name)
        branches_dict[b_name]["total_revenue"] += float(item.get("total_revenue") or 0)
        branches_dict[b_name]["invoice_count"] += int(item.get("invoice_count") or 0)
        
    # Xử lý Trạng thái phòng trống/đã thuê
    for item in room_data:
        b_name = item.get("branch_name")
        status = item.get("room_status") # e.g. "AVAILABLE", "VACANT", "OCCUPIED"
        count = int(item.get("room_count") or 0)
        if not b_name:
            continue
        if b_name not in branches_dict:
            branches_dict[b_name] = get_default_branch_data(b_name)
        if status == "OCCUPIED":
            branches_dict[b_name]["occupied_rooms"] = count
        elif status in ("VACANT", "AVAILABLE"):
            branches_dict[b_name]["vacant_rooms"] = count
            
    # Xử lý Số lượng khách thuê
    for item in tenant_data:
        b_name = item.get("branch_name")
        count = int(item.get("tenant_count") or 0)
        if not b_name:
            continue
        if b_name not in branches_dict:
            branches_dict[b_name] = get_default_branch_data(b_name)
        branches_dict[b_name]["tenant_count"] = count

    # Xử lý Hóa đơn nợ
    for item in debt_data:
        b_name = item.get("branch_name")
        if not b_name:
            continue
        if b_name not in branches_dict:
            branches_dict[b_name] = get_default_branch_data(b_name)
        branches_dict[b_name]["debt_invoice_count"] += 1
        branches_dict[b_name]["total_debt_amount"] += float(item.get("debt_amount") or 0)

    # Tính toán các tỷ lệ
    result = []
    for b_name, data in branches_dict.items():
        total_rooms = data["occupied_rooms"] + data["vacant_rooms"]
        occupancy_rate = "0.0%"
        vacancy_rate = "0.0%"
        if total_rooms > 0:
            occ_pct = (data["occupied_rooms"] / total_rooms) * 100
            vac_pct = (data["vacant_rooms"] / total_rooms) * 100
            occupancy_rate = f"{occ_pct:.1f}%"
            vacancy_rate = f"{vac_pct:.1f}%"
            
        data["total_rooms"] = total_rooms
        data["occupancy_rate"] = occupancy_rate
        data["vacancy_rate"] = vacancy_rate
        result.append(data)
        
    # Lọc kết quả theo chi nhánh được yêu cầu nếu có
    if branch_name:
        filtered_result = []
        for item in result:
            if is_branch_match(item["branch_name"], branch_name):
                filtered_result.append(item)
        if filtered_result:
            logger.info(f"[Tools] Đã lọc chi nhánh thành công, khớp các chi nhánh: {[x['branch_name'] for x in filtered_result]}")
            result = filtered_result
        else:
            logger.info(f"[Tools] Không tìm thấy chi nhánh nào khớp với '{branch_name}', giữ nguyên toàn bộ danh sách để so sánh.")

    logger.info(f"[Tools] Kết quả so sánh chi nhánh: {result}")
    return result


def get_vacant_rooms_list(
    java_backend_url: str,
    branch_name: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Lấy danh sách chi tiết các phòng trống từ Java Backend
    Args:
        java_backend_url: Base URL của Java Backend
        branch_name: Tên chi nhánh (tùy chọn)
    Returns:
        List[Dict]: Danh sách phòng trống thô (JSON)
    """
    url = f"{java_backend_url}/api/v1/internal/ai-tools/vacant-rooms-list"
    params = {}
    if branch_name:
        params["branchName"] = branch_name

    logger.info(f"[Java Backend] Gọi GET {url} với params={params}")
    try:
        response = requests.get(url, params=params, timeout=30.0)
        response.raise_for_status()
        data = response.json()
        logger.info(f"[Java Backend] Vacant rooms list count: {len(data)}")
        logger.info(f"[Java Backend JSON Output] {json.dumps(data, ensure_ascii=False)}")
        return data
    except Exception as e:
        logger.error(f"Error fetching vacant rooms list: {str(e)}", exc_info=True)
        return []


def get_utility_stats(
    java_backend_url: str,
    branch_name: Optional[str] = None,
    month: Optional[int] = None,
    year: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Lấy thống kê tiêu thụ điện nước và số tiền tương ứng từ Java Backend
    Args:
        java_backend_url: Base URL của Java Backend
        branch_name: Tên chi nhánh (tùy chọn)
        month: Tháng (tùy chọn)
        year: Năm (tùy chọn)
    Returns:
        List[Dict]: Thống kê điện nước thô (JSON)
    """
    url = f"{java_backend_url}/api/v1/internal/ai-tools/utility-stats"
    params = {}
    if branch_name:
        # Nếu branch_name chứa "tất cả" hoặc các từ khóa so sánh chung thì không truyền branchName xuống backend
        b_clean = branch_name.lower()
        if not any(x in b_clean for x in ["tất cả", "các chi nhánh", "mọi chi nhánh"]):
            params["branchName"] = branch_name
    if month:
        params["month"] = month
    if year:
        params["year"] = year

    logger.info(f"[Java Backend] Gọi GET {url} với params={params}")
    try:
        response = requests.get(url, params=params, timeout=30.0)
        response.raise_for_status()
        data = response.json()
        logger.info(f"[Java Backend] Utility stats count: {len(data)}")
        logger.info(f"[Java Backend JSON Output] {json.dumps(data, ensure_ascii=False)}")
        return data
    except Exception as e:
        logger.error(f"Error fetching utility stats: {str(e)}", exc_info=True)
        return []

