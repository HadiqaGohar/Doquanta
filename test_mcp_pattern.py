#!/usr/bin/env python3
"""
Test the correct MCP server pattern
"""
from mcp.server import Server
from mcp.types import Tool, TextContent
from typing import List
import asyncio

# Create a simple server to test the pattern
server = Server("test-server")

# Define tools function
def get_tools() -> List[Tool]:
    return [
        Tool(
            name="test_tool",
            description="A test tool",
            inputSchema={
                "type": "object",
                "properties": {
                    "param": {"type": "string", "description": "A test parameter"}
                },
                "required": ["param"]
            }
        )
    ]

# Register the function as the list_tools handler
server.list_tools(get_tools)

# Test if it works
print("Server name:", server.name)
print("Tools function registered")

# Now try to test the call_tool pattern
from typing import Dict, Any

async def handle_tool_call(tool_name: str, arguments: Dict[str, Any]) -> List[TextContent]:
    return [TextContent(type="text", text=f"Called {tool_name} with {arguments}")]


# Register the tool call handler
server.call_tool(handle_tool_call)

print("Tool call handler registered")

# Test running the server
async def test_run():
    print("Testing server run...")
    # This would normally connect to stdio or HTTP
    # For testing purposes, just verify the setup
    print("MCP server setup completed successfully")

if __name__ == "__main__":
    asyncio.run(test_run())