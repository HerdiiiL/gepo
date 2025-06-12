import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setupHandlers } from "./handlers.js";
// Initialize server with capabilities resources
const server = new Server({
    name: "gepo-mcp",
    version: "0.1.0",
}, {
    capabilities: {
        resources: {},
        tools: {},
    },
});
setupHandlers(server);
// Start the server with Stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.info('{"jsonrpc": "2.0", "method": "log", "params": { "message": "Server running..." }}');
