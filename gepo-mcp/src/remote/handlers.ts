import {
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import axios from "axios";

export const setupHandlers = (server: Server): void => {
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
          name: "execute_remote_ps_command",
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
};
