"""
Tool registry: load tool definitions from YAML and build callable tools.
"""
import os
import yaml
import logging
from typing import Dict, Any, List, Callable, Optional
from importlib import import_module
from pathlib import Path

logger = logging.getLogger(__name__)

DEFAULT_REGISTRY_PATH = Path(__file__).parent.parent / "tools" / "tool_registry.yaml"


class ToolRegistry:
    def __init__(self, registry_path: Optional[str] = None):
        self.registry_path = Path(registry_path or DEFAULT_REGISTRY_PATH)
        self._tools: Dict[str, Dict[str, Any]] = {}
        self._functions: Dict[str, Callable] = {}
        self._load()

    def _load(self) -> None:
        if not self.registry_path.exists():
            logger.warning(f"Tool registry not found: {self.registry_path}")
            return

        with open(self.registry_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}

        for tool_def in data.get("tools", []):
            name = tool_def.get("name")
            if not name:
                logger.warning("Skipping tool definition without name")
                continue
            self._tools[name] = tool_def
            fn = self._resolve_function(tool_def.get("function"))
            if fn:
                self._functions[name] = fn
            else:
                logger.warning(f"Could not resolve function for tool '{name}'")

        logger.info(f"Loaded {len(self._tools)} tools from registry")

    def _resolve_function(self, function_path: Optional[str]) -> Optional[Callable]:
        if not function_path:
            return None
        try:
            module_name, func_name = function_path.rsplit(".", 1)
            module = import_module(module_name)
            return getattr(module, func_name)
        except Exception as e:
            logger.error(f"Error resolving function '{function_path}': {e}")
            return None

    def get_tool(self, name: str) -> Optional[Dict[str, Any]]:
        return self._tools.get(name)

    def get_function(self, name: str) -> Optional[Callable]:
        return self._functions.get(name)

    def list_tools(self) -> List[str]:
        return list(self._tools.keys())

    def build_tool_functions(self) -> List[Callable]:
        """Return all resolved callable tools for LangGraph ToolNode."""
        return [fn for fn in self._functions.values() if fn is not None]

    def get_tool_descriptions(self) -> str:
        """Return a Markdown description of all tools for LLM prompts."""
        lines = []
        for name, tool in self._tools.items():
            lines.append(f"- {name}: {tool.get('description', '')}")
            for arg in tool.get("args", []):
                req = "bắt buộc" if arg.get("required") else "tùy chọn"
                lines.append(f"    - {arg.get('name')} ({arg.get('type')}, {req}): {arg.get('description', '')}")
        return "\n".join(lines)

    def execute(self, name: str, args: Dict[str, Any]) -> Any:
        """Execute a tool by name with given arguments."""
        fn = self.get_function(name)
        if not fn:
            raise ValueError(f"Tool '{name}' not found or not resolved")
        return fn(**args)


# Singleton registry
_registry: Optional[ToolRegistry] = None


def get_registry() -> ToolRegistry:
    global _registry
    if _registry is None:
        _registry = ToolRegistry()
    return _registry
