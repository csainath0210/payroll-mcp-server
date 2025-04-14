// import { initMCP } from "./mcp/init.js";

// Initialize the MCP server
// await initMCP();

import express from "express";
import dotenv from "dotenv";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { server } from "./mcp/server.js";

// Load environment variables
dotenv.config();

const app = express();
const transports: { [sessionId: string]: SSEServerTransport } = {};

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

app.get("/sse", async (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;

  console.log("SSE session started:", transport.sessionId);

  res.on("close", () => {
    console.log("SSE session closed:", transport.sessionId);
    delete transports[transport.sessionId];
  });

  await server.connect(transport);
});

app.options('/messages', (req: express.Request, res: express.Response) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.status(204).end();
});

function getTools() {
  try {
    // Access tools through reflection
    const toolsMap = (server as any)._tools || {};
    return Object.values(toolsMap).map((tool: any) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }));
  } catch (error) {
    console.error("Error accessing tools:", error);
    return [];
  }
}

app.post("/messages", async (req, res) => {
  try {
    const sessionId = req.query.sessionId as string;
    console.log(`POST /messages for sessionId: ${sessionId}`);
    console.log(`Request body:`, JSON.stringify(req.body));
    
    const transport = transports[sessionId];

    // Special handling for discovery requests regardless of session
    if (req.body && req.body.type === "discover" && req.body.payload?.requestManifest) {
      console.log("Handling discover request manually");
      
      // Get tools using our helper
      const tools = getTools();
      
      // Return a formatted discovery response
      return res.json({
        type: "discover_response",
        payload: {
          manifest: {
            tools: tools,
            resources: [], // Add actual resources if available
            prompts: []    // Add actual prompts if available
          }
        }
      });
    }
    
    // Regular handling for non-discovery requests
    if (transport) {
      console.log(`Transport found for ${sessionId}, handling message`);
      await transport.handlePostMessage(req, res);
    } else {
      console.error(`No transport found for sessionId: ${sessionId}`);
      res.status(400).json({ error: "No transport found for sessionId" });
    }
  } catch (error) {
    console.error("Error in /messages:", error);
    res.status(500).json({ error: "Internal server error", details: String(error) });
  }
});

const PORT = 8089;

app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
});
