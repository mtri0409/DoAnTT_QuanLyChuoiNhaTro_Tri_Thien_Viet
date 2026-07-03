"""
LangGraph application setup and compilation.
"""
import logging
import os
from typing import Optional

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from graph.state import AgentState, create_initial_state
from graph.nodes import (
    intent_node,
    llm_intent_node,
    validate_intent_node,
    execute_tool_node,
    format_tool_message_node,
    fallback_node,
    chat_response_node,
    should_use_llm_intent,
    route_after_validation,
    route_after_tool,
)

logger = logging.getLogger(__name__)


def create_graph(checkpointer: Optional[MemorySaver] = None) -> StateGraph:
    """Create and compile the LangGraph agent."""
    graph = StateGraph(AgentState)

    # Nodes
    graph.add_node("intent", intent_node)
    graph.add_node("llm_intent", llm_intent_node)
    graph.add_node("validate_intent", validate_intent_node)
    graph.add_node("execute_tool", execute_tool_node)
    graph.add_node("format_tool_message", format_tool_message_node)
    graph.add_node("fallback", fallback_node)
    graph.add_node("chat_response", chat_response_node)

    # Edges
    graph.add_edge(START, "intent")
    graph.add_conditional_edges(
        "intent",
        should_use_llm_intent,
        {"llm_intent": "llm_intent", "validate_intent": "validate_intent"},
    )
    graph.add_edge("llm_intent", "validate_intent")
    graph.add_conditional_edges(
        "validate_intent",
        route_after_validation,
        {"execute_tool": "execute_tool", "chat_response": "chat_response"},
    )
    graph.add_conditional_edges(
        "execute_tool",
        route_after_tool,
        {"format_tool_message": "format_tool_message", "fallback": "fallback"},
    )
    graph.add_edge("format_tool_message", "llm_intent")
    graph.add_edge("fallback", END)
    graph.add_edge("chat_response", END)

    # Checkpointer: in-memory for dev, Postgres/Redis for prod
    if checkpointer is None:
        checkpointer = MemorySaver()

    return graph.compile(checkpointer=checkpointer)


# Global graph instance
_graph = None


def get_graph():
    global _graph
    if _graph is None:
        _graph = create_graph()
    return _graph
