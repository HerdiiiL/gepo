import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Initialize server with capabilities resources
const server = new Server(
  {
    name: "gepo-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// List available resources when users request them
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "hello://world",
        name: "Hello World Message",
        description: "A simple greeting message",
        mimeType: "text/plain",
      },
    ],
  };
});

// Read a resource when users request it
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "hello://world") {
    return {
      contents: [
        {
          uri: "hello://world",
          text: "Hello, World! This is my first MCP resource.",
        },
      ],
    };
  }
  throw new Error("Resource not found");
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "execute_ps_command",
        description: "Execute a PowerShell command",
        inputSchema: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description: "The PowerShell command to execute",
            },
            description: {
              type: "string",
              description: "Description of what the command does",
            },
          },
          required: ["command"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "execute_ps_command") {
    const arg = request.params.arguments;
    if (!arg || typeof arg !== "object") {
      throw new Error("Invalid arguments for execute_ps_command");
    }
    const command = arg.command;

    try {
      const { stdout, stderr } = await execAsync(
        `powershell.exe -Command "${command}`
      );

      let result = "";
      if (stdout) {
        result += `Output:\n${stdout}`;
      }
      if (stderr) {
        result += `\nError:\n${stderr}`;
      }

      return {
        content: [
          {
            type: "text",
            text: result || "Command executed successfully with no output.",
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error executing PowerShell command: ${error}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Tool ${request.params.name} not found`);
});

// Start the server with Stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.info(
  '{"jsonrpc": "2.0", "method": "log", "params": { "message": "Server running..." }}'
);
