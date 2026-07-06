"""
LangGraph state schema for the AI conversational agent.
"""
from typing import TypedDict, Annotated, List, Optional, Dict, Any
from datetime import datetime
import operator


class AgentState(TypedDict):
    """
    Shared state across the LangGraph agent.
    """
    messages: Annotated[List[Dict[str, str]], operator.add]
    """Conversation history: [{'role': 'user'|'assistant'|'system', 'content': str}]"""

    user_id: Optional[str]
    """Authenticated user identifier."""

    thread_id: Optional[str]
    """Conversation thread identifier."""

    current_message: Optional[str]
    """Latest user message being processed."""

    intent: Optional[str]
    """Detected tool intent (e.g. get_detailed_debtors)."""

    args: Dict[str, Any]
    """Extracted arguments for the intent."""

    rule_intent: Optional[Dict[str, Any]]
    """Result from rule-based intent parser."""

    ai_intent: Optional[Dict[str, Any]]
    """Result from LLM-based intent parser."""

    tool_result: Optional[Any]
    """Raw output from the executed tool."""

    tool_name: Optional[str]
    """Name of the tool that was executed."""

    tool_error: Optional[str]
    """Error message from the last tool execution."""

    response: Optional[str]
    """Final assistant response."""

    current_month: int
    """Reference month for relative time queries."""

    current_year: int
    """Reference year for relative time queries."""

    provider: Optional[str]
    """AI provider: GEMINI, MISTRAL, etc."""

    api_key: Optional[str]
    """Resolved API key."""

    base_url: Optional[str]
    """Resolved base URL."""

    model_name: Optional[str]
    """Resolved model name."""

    java_backend_url: Optional[str]
    """Java backend base URL."""

    fallback_count: int
    """Number of fallback retries performed."""

    loop_count: int
    """Number of multi-tool execution loop iterations performed."""


def create_initial_state() -> AgentState:
    """Return a fresh state dictionary with sensible defaults."""
    now = datetime.now()
    return AgentState(
        messages=[],
        user_id=None,
        thread_id=None,
        current_message=None,
        intent=None,
        args={},
        rule_intent=None,
        ai_intent=None,
        tool_result=None,
        tool_name=None,
        tool_error=None,
        response=None,
        current_month=now.month,
        current_year=now.year,
        provider=None,
        api_key=None,
        base_url=None,
        model_name=None,
        java_backend_url=None,
        fallback_count=0,
        loop_count=0,
    )
