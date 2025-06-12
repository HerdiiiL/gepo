import { ListResourcesRequestSchema, ReadResourceRequestSchema, ListToolsRequestSchema, CallToolRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
export const setupHandlers = (server) => {
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
    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        if (request.params.name === "execute_remote_ps_command") {
            const arg = request.params.arguments;
            if (!arg || typeof arg !== "object") {
                throw new Error("Invalid arguments for execute_ps_command");
            }
            const command = arg.command;
            try {
                const response = await axios.post("http://10.12.10.10:3000/execute-ps-command", {
                    command: command,
                    description: arg.description || "",
                });
                const output = response.data;
                if (!output.success) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Remote error: ${output.error || "Unknown error"}`,
                            },
                        ],
                        isError: true,
                    };
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: output.output ||
                                "Command executed successfully with no output.",
                        },
                    ],
                };
            }
            catch (error) {
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
};
