import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { server } from "./server.js";

export function initializeResources() {
  // Static greeting resource
  server.resource(
    "greeting",
    "greeting://welcome",
    { description: "A welcome greeting resource" },
    async (uri: URL) => ({
      contents: [
        {
          uri: uri.href,
          text: "Welcome to the MCP server! This is a static resource.",
        },
      ],
    })
  );

  // Dynamic resource with parameters
  server.resource(
    "user-data",
    new ResourceTemplate("users://{userId}", { list: undefined }),
    { description: "User data resource that accepts a user ID parameter" },
    async (uri: URL, variables: { [key: string]: string | string[] }) => ({
      contents: [
        {
          uri: uri.href,
          text: `User data for user ID: ${variables.userId}`,
        },
      ],
    })
  );
}

// Initialize resources
initializeResources();
