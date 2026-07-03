from pydantic import BaseModel, Field
from typing import Optional

class ChatPayload(BaseModel):
    """
    Payload nhận từ Java Backend
    """
    message: str = Field(..., description="Câu hỏi từ ngườ dùng")
    provider: str = Field(..., description="Nhà cung cấp AI: GEMINI hoặc MISTRAL")
    api_key: str = Field(..., description="API Key cho nhà cung cấp AI")
    base_url: str = Field(..., description="Base URL cho API của nhà cung cấp")
    model_name: str = Field(..., description="Tên mô hình AI")
    java_backend_url: str = Field(..., description="Base URL của Java Backend để gọi ngược API")
    thread_id: Optional[str] = Field(None, description="ID cuộc hội thoại để giữ ngữ cảnh")


class ChatResponse(BaseModel):
    """
    Response trả về cho Java Backend
    """
    response: str = Field(..., description="Câu trả lờ từ AI")
    provider: str = Field(..., description="Nhà cung cấp AI đã sử dụng")
    model_name: str = Field(..., description="Tên mô hình AI đã sử dụng")
    is_cached: bool = Field(False, description="Có phải câu trả lờ từ cache không")
