"""
LangGraph nodes for the AI conversational agent.
"""
import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

from graph.state import AgentState
from graph.tool_registry import get_registry
from intent_parser import infer_intent, normalize_tool_name
from tools import call_ai_unified

logger = logging.getLogger(__name__)

INTENT_ANALYSIS_PROMPT = """
Bạn là AI phân tích ý định và trích xuất thực thể (NLU Engine) của hệ thống quản lý chuỗi nhà trọ.
Hãy dựa vào lịch sử trò chuyện và tin nhắn mới nhất để phân tích.

Các công cụ có sẵn:
{tool_descriptions}

QUY TẮC PHÂN TÍCH TIẾNG VIỆT & LỖI CHÍNH TẢ:
1. "get_detailed_debtors": Gọi khi người dùng hỏi về danh sách cư dân nợ tiền, chưa đóng, quá hạn. Nhận diện cả lỗi chính tả (nợ, nọ, nơ, chưa đóng, chưa thanh toán).
2. "get_revenue_stats": Gọi khi người dùng hỏi về doanh thu, thu nhập, báo cáo tài chính của chuỗi nhà trọ. Nhận diện cả lỗi chính tả hoặc từ tương tự (doanh thu, doanh thủ, doang thu, doanh sô).
3. "get_contracts_by_status": Gọi khi người dùng hỏi về hợp đồng theo trạng thái (ACTIVE, PENDING, EXPIRED, ...). Nhận diện lỗi chính tả (họp đồng, hợ đồng).
4. "get_contracts_expiring_in_month": Gọi khi người dùng hỏi về hợp đồng sắp hết hạn trong tháng này/tháng tới.
5. "get_room_status": Gọi khi người dùng hỏi về thống kê số lượng phòng trống/phòng đã thuê (dạng đếm số lượng).
6. "compare_branches": Gọi khi người dùng muốn so sánh doanh thu, tỉ lệ phòng trống/phòng đã thuê, số lượng người ở (khách thuê), số hóa đơn nợ hoặc tổng số tiền nợ giữa các chi nhánh.
7. "get_vacant_rooms_list": Gọi khi người dùng muốn liệt kê danh sách chi tiết các phòng trống cụ thể (ví dụ: "liệt kê phòng trống", "danh sách phòng trống", "những phòng nào còn trống").
8. "get_utility_stats": Gọi khi người dùng hỏi về tiêu thụ điện, nước, hoặc số tiền điện nước tương ứng.
9. "none": Gọi khi câu hỏi hoàn toàn là xã giao chào hỏi (ví dụ: "hi", "xin chào"), câu hỏi ngoài ngành quản lý nhà trọ, HOẶC khi trong lịch sử trò chuyện đã có đầy đủ kết quả chạy công cụ cần thiết để trả lời câu hỏi phức tạp của người dùng và bạn đã sẵn sàng đưa ra câu trả lời trực tiếp.

LƯU Ý QUAN TRỌNG VỀ QUY TRÌNH NHIỀU BƯỚC (MULTI-STEP):
- Nếu người dùng hỏi một câu hỏi phức tạp đòi hỏi nhiều thông tin khác nhau (ví dụ: vừa tìm phòng trống vừa lọc theo lượng điện nước sử dụng tháng trước):
  - Bước đầu tiên: Hãy chọn công cụ đầu tiên phù hợp (ví dụ: "get_vacant_rooms_list").
  - Các bước tiếp theo: Dựa trên kết quả chạy công cụ đã có trong lịch sử trò chuyện, hãy chọn công cụ tiếp theo (ví dụ: "get_utility_stats").
  - Khi đã có đủ kết quả thực thi của các công cụ cần thiết trong lịch sử trò chuyện, hãy chọn "none" để hệ thống dừng gọi công cụ và trả lời.
- Tuyệt đối KHÔNG gọi lại một công cụ với cùng tham số nếu kết quả của nó đã tồn tại trong lịch sử trò chuyện.

QUY ƯỚC THỜI GIAN (hi hiện tại là Tháng {month} năm {year}):
- "Tháng này" -> tháng {month}, năm {year}
- "Tháng trước" -> tháng {prev_month}, năm {prev_year}
- "Tháng sau" -> tháng {next_month}, năm {next_year}

GUARDRAILS:
- Tháng 1-12, năm 2020-2026.
- Nếu vượt ngưỡng, tool="none".

YÊU CẦU ĐẦU RA:
Chỉ trả về JSON thô, không markdown, không giải thích.
Cấu trúc:
{{"tool": "tool_name", "args": {{"branch_name": null, "month": null, "year": null, "status": null}}}}
"""

SYSTEM_INSTRUCTION = """
Bạn là trợ lý AI nội bộ thân thiện, hóm hỉnh nhẹ nhàng và tận tâm của chủ chuỗi nhà trọ.
Nhiệm vụ của bạn là báo cáo số liệu một cách rõ ràng, chính xác, đồng thời đem lại cảm giác trò chuyện vui vẻ, dễ chịu cho người dùng mà không bị quá lố.

PHONG CÁCH TRẢ LỜI THÂN THIỆN & HÓM HĨNH NHẸ NHÀNG:
1. **Chào hỏi lịch sự & vui vẻ:** Mở đầu bằng lời chào thân mật, ấm áp (ví dụ: "Dạ, em đã tổng hợp xong số liệu anh/chị cần rồi đây ạ! Anh/chị xem qua nhé:", "Dạ sếp, số liệu sếp yêu cầu đã sẵn sàng rồi ạ. Em xin gửi sếp bảng thống kê chi tiết:").
2. **Ngôn từ tự nhiên, tinh tế, hóm hỉnh:** Xưng hô "Em" và gọi người dùng là "Anh/Chị" hoặc "Sếp". Tránh dùng các từ ngữ quá lố, giật gân (như "Ối giời ơi", "bay màu", "mời sếp xơi", "chủ tịch"). Hãy nhận xét số liệu một cách nhẹ nhàng, tích cực (Ví dụ nếu doanh thu cao: "Tháng này tình hình tài chính rất khởi sắc, hi vọng tháng tới doanh thu nhà mình còn bay cao hơn nữa ạ! 🎉", nếu có nợ xấu: "Có vẻ một vài phòng đang chậm thanh toán một chút, sếp xem có cần nhắc nhở nhẹ không nhé! 😉").
3. **Quy tắc so sánh giữa 2 đối tượng (2 chi nhánh hoặc 2 tháng):** 
   - Hãy thiết kế bảng Markdown theo dạng **cột là các đối tượng được so sánh** (Ví dụ: cột 1 là "Chỉ số so sánh", cột 2 là "Chi nhánh A / Tháng X", cột 3 là "Chi nhánh B / Tháng Y").
   - Các dòng là các tiêu chí so sánh (ví dụ: Doanh thu, Tỷ lệ phòng trống, Số lượng khách thuê, Số hóa đơn nợ, Tổng số tiền nợ). Cách trình bày này giúp đối chiếu cực kỳ trực quan.
4. **Nhận xét ngắn gọn (Commentary):** Thêm 1-2 câu bình luận vui vẻ, nhẹ nhàng về các con số nổi bật trong bảng để cuộc trò chuyện thêm sinh động.
5. Luôn trình bày dữ liệu dạng bảng Markdown nếu có danh sách hoặc so sánh số liệu.
6. Mẹo định dạng tiền tệ: Luôn viết rõ đơn vị VND và dùng dấu chấm phân tách phần nghìn (ví dụ: 3.500.000 VND).
7. Luôn giữ nguyên tên chi nhánh thực tế từ dữ liệu (ví dụ: "Nhà trọ Bình Thạnh", "Nhà trọ Thủ Đức"), tuyệt đối không đổi thành "Chi nhánh 1", "Chi nhánh 2".
8. **Quy tắc tránh lỗi hiển thị Markdown (RẤT QUAN TRỌNG):**
   - Khi viết bôi đậm Markdown (`**chữ bôi đậm**`), tuyệt đối KHÔNG ĐƯỢC có khoảng cách (dấu cách) ngay sau dấu `**` mở hoặc ngay trước dấu `**` đóng (ví dụ: viết `**BẢNG DOANH THU**` hoặc `**Lưu ý:**`, không viết `** BẢNG DOANH THU **` hay `** BẢNG DOANH THU**`).
   - Tuyệt đối không thêm ký tự `#` (tiêu đề to) đằng trước các câu bôi đậm làm chúng bị phóng to quá cỡ và mất định dạng bôi đậm.
9. Kết thúc bằng một câu hỏi gợi mở thân thiện (Ví dụ: "Anh/Chị cần em hỗ trợ thêm thông tin nào khác nữa không ạ? Em luôn sẵn sàng! 🌟").
10. **Quy tắc khi thiếu công cụ tra cứu hoặc câu hỏi không rõ ràng (RẤT QUAN TRỌNG):**
    - Nếu câu hỏi của người dùng yêu cầu tra cứu thông tin, thống kê, báo cáo hoặc thực hiện hành động nào đó trong hệ thống nhà trọ mà không có công cụ chuyên dụng tương ứng được chạy (dữ liệu rỗng hoặc không có), bạn tuyệt đối không được tự bịa ra các số liệu hoặc kết quả giả.
    - Hãy lịch sự thông báo rằng tính năng này chưa được hệ thống hỗ trợ hoặc câu hỏi chưa rõ ràng, và khuyên sếp/người dùng liên hệ với bộ phận IT để được nâng cấp và hỗ trợ thêm.

PHẠM VI HỆ THỐNG:
- Chỉ trả lời các thông tin liên quan đến doanh thu nhà trọ, nợ tiền, hợp đồng và trạng thái phòng.
- Tuyệt đối không trả lời kiến thức chung ngoài ngành (như VinGroup, Viettel...). Nếu bị hỏi ngoài phạm vi, hãy từ chối khéo léo và hóm hỉnh: "Dạ, em chỉ chuyên hỗ trợ sếp quản lý chuỗi nhà trọ thôi ạ, các vấn đề vĩ mô này nằm ngoài tầm phủ sóng của em mất rồi. Sếp hỏi em về tiền nhà, hợp đồng hay phòng ốc đi, em giải đáp ngay! 😊"
"""


def _relative_time(now: datetime) -> Dict[str, int]:
    prev = now.replace(day=1) - timedelta(days=1)
    nxt = now.replace(day=28) + timedelta(days=4)
    nxt = nxt.replace(day=1)
    return {
        "month": now.month,
        "year": now.year,
        "prev_month": prev.month,
        "prev_year": prev.year,
        "next_month": nxt.month,
        "next_year": nxt.year,
    }


def intent_node(state: AgentState) -> Dict[str, Any]:
    """Rule-based intent detection."""
    message = state["current_message"]
    now = datetime(state["current_year"], state["current_month"], 1)
    parsed = infer_intent(message, now)
    logger.info(f"[IntentNode] Rule-based intent: {parsed}")
    return {
        "rule_intent": parsed,
        "intent": parsed.get("tool"),
        "args": parsed.get("args", {}),
        "messages": [{"role": "user", "content": message}],
    }


def should_use_llm_intent(state: AgentState) -> str:
    """Conditional edge: always run LLM intent node to validate rules and handle follow-ups contextually."""
    return "llm_intent"


def llm_intent_node(state: AgentState) -> Dict[str, Any]:
    """LLM-based intent parsing with history."""
    message = state["current_message"]
    now = datetime(state["current_year"], state["current_month"], 1)
    time_ctx = _relative_time(now)

    registry = get_registry()
    prompt = INTENT_ANALYSIS_PROMPT.format(
        tool_descriptions=registry.get_tool_descriptions(),
        **time_ctx,
    )

    history = state.get("messages", [])
    result = call_ai_unified(
        endpoint=state["base_url"],
        api_key=state["api_key"],
        model_name=state["model_name"],
        prompt=message,
        system_instruction=prompt,
        temperature=0.0,
        history=history,
    )
    logger.info(f"[LLMIntentNode] Raw: {result!r}")

    try:
        data = json.loads(result)
        tool = normalize_tool_name(data.get("tool", "none"))
        args = data.get("args", {})
    except json.JSONDecodeError:
        logger.warning(f"[LLMIntentNode] Invalid JSON: {result!r}")
        tool = "none"
        args = {}

    # Merge with rule-based args for missing fields
    rule_args = state.get("args", {})
    merged_args = {**rule_args, **args}
    for key in ["month", "year", "status", "branch_name"]:
        if merged_args.get(key) is None:
            merged_args[key] = rule_args.get(key)

    return {
        "ai_intent": {"tool": tool, "args": merged_args},
        "intent": tool,
        "args": merged_args,
    }


def validate_intent_node(state: AgentState) -> Dict[str, Any]:
    """Apply guardrails to intent and args."""
    args = state.get("args", {})
    intent = state.get("intent")
    loop_count = state.get("loop_count", 0)

    # Chốt chặn vòng lặp tối đa 5 bước
    if loop_count >= 5:
        logger.warning(f"[ValidateIntentNode] Loop count exceeded {loop_count}, forcing intent to 'none'")
        return {"intent": "none", "args": {}}

    month = args.get("month")
    year = args.get("year")

    if month is not None and not (1 <= month <= 12):
        intent = "none"
        args = {}
    if year is not None and not (2020 <= year <= 2026):
        intent = "none"
        args = {}

    return {"intent": intent, "args": args}


def route_after_validation(state: AgentState) -> str:
    """Conditional edge: chat or tool."""
    intent = state.get("intent")
    if intent == "none" or not intent:
        return "chat_response"
    return "execute_tool"


def execute_tool_node(state: AgentState) -> Dict[str, Any]:
    """Execute the selected tool via registry."""
    intent = state["intent"]
    args = dict(state.get("args", {}))
    registry = get_registry()

    tool_def = registry.get_tool(intent)
    if not tool_def:
        logger.warning(f"[ExecuteToolNode] Tool not registered: {intent}")
        return {
            "tool_error": f"Tool '{intent}' không được hỗ trợ.",
            "tool_name": intent,
        }

    # Inject java_backend_url
    args["java_backend_url"] = state.get("java_backend_url")

    # Filter args to only those accepted by the tool
    valid_args = {arg["name"] for arg in tool_def.get("args", [])}
    filtered_args = {k: v for k, v in args.items() if k in valid_args and v is not None}

    try:
        result = registry.execute(intent, filtered_args)
        return {
            "tool_result": result,
            "tool_name": intent,
            "tool_error": None,
        }
    except Exception as e:
        logger.error(f"[ExecuteToolNode] Error executing {intent}: {e}", exc_info=True)
        return {
            "tool_result": None,
            "tool_name": intent,
            "tool_error": str(e),
        }


def route_after_tool(state: AgentState) -> str:
    """Conditional edge: format_tool_message or fallback."""
    if state.get("tool_error"):
        return "fallback"
    return "format_tool_message"


def fallback_node(state: AgentState) -> Dict[str, Any]:
    """Handle tool failures with a friendly response."""
    error = state.get("tool_error", "Không rõ lỗi")
    intent = state.get("tool_name") or state.get("intent")
    
    logger.error(f"[FallbackNode] Lỗi khi thực thi công cụ {intent}: {error}")
    
    response = (
        "Dạ sếp ơi, có vẻ hệ thống đang gặp chút sự cố kỹ thuật hoặc lỗi kết nối khi lấy dữ liệu "
        f"(công cụ '{intent}' báo lỗi: {error}). "
        "Sếp vui lòng thử lại sau hoặc liên hệ bộ phận IT để kiểm tra và khắc phục lỗi hệ thống này nhé! 🛠️"
    )
    
    return {
        "response": response,
        "messages": [{"role": "assistant", "content": response}],
        "fallback_count": state.get("fallback_count", 0) + 1,
    }


def format_response_node(state: AgentState) -> Dict[str, Any]:
    """Format tool output into natural language response."""
    message = state["current_message"]
    tool_name = state.get("tool_name")
    tool_result = state.get("tool_result")
    args = state.get("args", {})

    tool_labels = {
        "get_detailed_debtors": "Danh sách nợ",
        "get_revenue_stats": "Thống kê doanh thu",
        "get_contracts_by_status": f"Danh sách hợp đồng ({args.get('status', 'hết hạn')})",
        "get_contracts_expiring_in_month": f"Hợp đồng sắp hết hạn tháng {args.get('month')}/{args.get('year')}",
        "get_room_status": f"Thống kê trạng thái phòng trống / đã thuê ({args.get('branch_name', 'Tất cả chi nhánh')})",
        "compare_branches": "Bảng so sánh doanh thu, tỷ lệ phòng trống và khách thuê giữa các chi nhánh",
        "get_vacant_rooms_list": f"Danh sách các phòng trống ({args.get('branch_name', 'Tất cả chi nhánh')})",
        "get_utility_stats": f"Thống kê tiêu thụ điện nước ({args.get('branch_name', 'Tất cả chi nhánh')})",
    }
    label = tool_labels.get(tool_name, "Dữ liệu")

    prompt = f"{label}:\n{tool_result}\n\nCâu hỏi của người dùng: {message}"
    history = state.get("messages", [])
    response = call_ai_unified(
        endpoint=state["base_url"],
        api_key=state["api_key"],
        model_name=state["model_name"],
        prompt=prompt,
        system_instruction=SYSTEM_INSTRUCTION,
        temperature=0.1,
        history=history,
    )

    return {
        "response": response,
        "messages": [{"role": "assistant", "content": response}],
    }


def chat_response_node(state: AgentState) -> Dict[str, Any]:
    """Free-form chat response when no tool is selected."""
    message = state["current_message"]

    guardrail_note = ""
    args = state.get("args", {})
    month = args.get("month")
    year = args.get("year")
    if month is not None and not (1 <= month <= 12):
        guardrail_note = "Tháng phải từ 1-12 nha sếp!"
    elif year is not None and not (2020 <= year <= 2026):
        guardrail_note = "Năm phải từ 2020-2026 nha sếp!"

    prompt = f"{guardrail_note}\n{message}".strip()
    history = state.get("messages", [])
    response = call_ai_unified(
        endpoint=state["base_url"],
        api_key=state["api_key"],
        model_name=state["model_name"],
        prompt=prompt,
        system_instruction=SYSTEM_INSTRUCTION,
        temperature=0.1,
        history=history,
    )
    return {
        "response": response,
        "messages": [{"role": "assistant", "content": response}],
    }


def format_tool_message_node(state: AgentState) -> Dict[str, Any]:
    """Format tool execution results and append them to messages, preparing for the next loop."""
    tool_name = state["tool_name"]
    tool_result = state["tool_result"]
    args = state["args"]

    logger.info(f"[FormatToolMessageNode] Appending tool '{tool_name}' execution result to history.")

    tool_msg = {
        "role": "assistant",
        "content": f"[Hệ thống đã chạy công cụ '{tool_name}' với tham số {args} và thu được kết quả]\n{json.dumps(tool_result, ensure_ascii=False)}"
    }

    return {
        "messages": [tool_msg],
        "loop_count": state.get("loop_count", 0) + 1,
        "intent": None,
        "tool_result": None,
        "tool_name": None,
    }
