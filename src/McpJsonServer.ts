import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  CallToolRequest,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { IDependencyContainer } from './container/DependencyContainer';
import { IToolHandler } from './handlers/ToolHandler';
import { ToolNotFoundError, BaseError } from './errors/CustomErrors';
import { ToolResult } from './types';

export class McpJsonServer {
  private readonly server: Server;
  private readonly toolHandlers: Map<string, IToolHandler>;

  constructor(private readonly container: IDependencyContainer) {
    const config = container.getConfiguration();
    
    this.server = new Server(
      {
        name: config.getServerName(),
        version: config.getServerVersion(),
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.toolHandlers = container.getToolHandlers();
    this.setupHandlers();
    this.logInitialization();
  }

  private logInitialization(): void {
    const config = this.container.getConfiguration();
    console.error(`[${new Date().toISOString()}] MCP JSON Server initialized`);
    console.error(`Data directory: ${config.getDataDirectory()}`);
    console.error(`Server: ${config.getServerName()} v${config.getServerVersion()}`);
    console.error(`Available tools: ${Array.from(this.toolHandlers.keys()).join(', ')}`);
  }

  private setupHandlers(): void {
    this.setupListToolsHandler();
    this.setupCallToolHandler();
  }

  private setupListToolsHandler(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = Array.from(this.toolHandlers.values()).map(handler => ({
        name: handler.getName(),
        description: handler.getDescription(),
        inputSchema: handler.getInputSchema(),
      }));

      return { tools };
    });
  }

  private setupCallToolHandler(): void {
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;
      
      try {
        const handler = this.getToolHandler(name);
        const result = await handler.execute(args);
        return result as any;
      } catch (error) {
        const errorResult = this.handleError(error);
        return errorResult as any;
      }
    });
  }

  private getToolHandler(name: string): IToolHandler {
    const handler = this.toolHandlers.get(name);
    if (!handler) {
      throw new ToolNotFoundError(name);
    }
    return handler;
  }

  private handleError(error: unknown): ToolResult {
    let message: string;
    
    if (error instanceof BaseError) {
      message = error.message;
      console.error(`[${new Date().toISOString()}] Business error: ${message}`);
    } else if (error instanceof Error) {
      message = error.message;
      console.error(`[${new Date().toISOString()}] Unexpected error:`, error);
    } else {
      message = String(error);
      console.error(`[${new Date().toISOString()}] Unknown error:`, error);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Error: ${message}`,
        },
      ],
      isError: true,
    };
  }

  public async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`[${new Date().toISOString()}] MCP JSON Server running on stdio`);
  }

  public async shutdown(): Promise<void> {
    console.error(`[${new Date().toISOString()}] Shutting down MCP JSON Server...`);
    // Add any cleanup logic here if needed
  }
}