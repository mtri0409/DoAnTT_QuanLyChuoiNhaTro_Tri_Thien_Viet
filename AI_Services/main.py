"""
FastAPI AI Service - LangGraph Agent Gateway
"""
import os
import logging
import certifi
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import ChatPayload, ChatResponse
from tools import get_ai_config
from graph.state import create_initial_state
from graph.app import get_graph
from graph.tool_registry import get_registry

# Load environment variables
load_dotenv()

# Fix TLS CA bundle
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
JAVA_BACKEND_API_BASE = os.getenv("API_BACKEND_URL", "http://localhost:8080")

# Load AI config from Java backend
ai_config = get_ai_config(JAVA_BACKEND_API_BASE)
DEFAULT_AI_API_KEY = ai_config.get("API_KEY", os.getenv("DEFAULT_AI_API_KEY", ""))
DEFAULT_AI_BASE_URL = ai_config.get("BASE_URL", os.getenv("DEFAULT_AI_BASE_URL", ""))
DEFAULT_AI_MODEL = ai_config.get("MODEL", os.getenv("DEFAULT_AI_MODEL", ""))

logger.info(f"[Startup] JAVA_BACKEND_API_BASE={JAVA_BACKEND_API_BASE}")
logger.info(f"[Startup] AI config loaded: API_KEY={'***' if DEFAULT_AI_API_KEY else 'empty'}, BASE_URL={DEFAULT_AI_BASE_URL}, MODEL={DEFAULT_AI_MODEL}")
logger.info(f"[Startup] Registered tools: {get_registry().list_tools()}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: preload graph on startup."""
    logger.info("[Startup] Compiling LangGraph agent...")
    get_graph()
    logger.info("[Startup] LangGraph agent ready")
    yield
    logger.info("[Shutdown] Cleaning up...")


app = FastAPI(title="AI Service Gateway", version="2.0.0", lifespan=lifespan)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat_with_ai(payload: ChatPayload, request: Request):
    """
    Endpoint xử lý chat với AI sử dụng LangGraph.
    """
    logger.info(f"[Chat Endpoint] Received chat request from {request.client.host}: {payload.message!r}")

    try:
        # Resolve AI configuration
        api_key = payload.api_key or DEFAULT_AI_API_KEY
        base_url = payload.base_url or DEFAULT_AI_BASE_URL
        model_name = payload.model_name or DEFAULT_AI_MODEL
        java_backend_url = payload.java_backend_url or JAVA_BACKEND_API_BASE

        logger.info(f"[Chat Endpoint] Resolved config: model={model_name}, base_url={base_url}, api_key={'***' if api_key else 'empty'}")

        # Build initial state
        state = create_initial_state()
        state.update({
            "current_message": payload.message,
            "provider": payload.provider,
            "api_key": api_key,
            "base_url": base_url,
            "model_name": model_name,
            "java_backend_url": java_backend_url,
            "thread_id": getattr(payload, "thread_id", None) or "default",
        })

        # Invoke LangGraph
        graph = get_graph()
        config = {"configurable": {"thread_id": state["thread_id"]}}
        result = await graph.ainvoke(state, config)

        response_text = result.get("response", "Xin lỗi, mình không xử lý được yêu cầu này.")
        logger.info(f"[Chat Endpoint] Final response length: {len(response_text)}, preview: {response_text[:200]!r}")

        return ChatResponse(
            response=response_text,
            provider=payload.provider,
            model_name=model_name,
            is_cached=False
        )

    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"AI Service Error: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "java_backend_url": JAVA_BACKEND_API_BASE,
        "tools": get_registry().list_tools(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=os.getenv("APP_HOST", "0.0.0.0"),
        port=int(os.getenv("APP_PORT", 8000))
    )
