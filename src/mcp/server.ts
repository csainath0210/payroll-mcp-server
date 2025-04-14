import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Create MCP server instance
const server = new McpServer({
  name: "payroll",
  version: "0.0.1",
  description: "Payroll Management Server using MCP"
});

// Initialize MCP components
function initializeServer() {
  import("./resources.js");
  import("./tools.js");
  import("./prompts.js");
}

// Initialize the server components
initializeServer();

// Export the server instance
export { server }; 