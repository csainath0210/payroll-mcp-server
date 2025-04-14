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
const transports = {};
// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
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
app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = transports[sessionId];
    if (transport) {
        await transport.handlePostMessage(req, res);
    }
    else {
        res.status(400).send("No transport found for sessionId");
    }
});
const PORT = 8089;
app.listen(PORT, () => {
    console.log(`MCP Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map