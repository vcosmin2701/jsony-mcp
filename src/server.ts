#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  CallToolRequest,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';

interface JsonDatabase {
  [key: string]: any[];
}

class JsonMcpServer {
  private server: Server;
  private dataDir: string;

  constructor() {
    // Use absolute path to ensure it works regardless of where the server is run from
    this.dataDir = '/Users/cosmin01/Agile/mcp-json-server/data';
    console.error(`Data directory set to: ${this.dataDir}`);
    console.error(`Current working directory: ${process.cwd()}`);
    this.server = new Server(
      {
        name: 'json-manager',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private async ensureDataDir(): Promise<void> {
    try {
      await fs.access(this.dataDir);
      console.error(`Data directory exists: ${this.dataDir}`);
    } catch (error) {
      console.error(`Creating data directory: ${this.dataDir}`);
      console.error(`Error was: ${error}`);
      try {
        await fs.mkdir(this.dataDir, { recursive: true });
        console.error(`Successfully created: ${this.dataDir}`);
      } catch (mkdirError) {
        console.error(`Failed to create directory: ${mkdirError}`);
        throw mkdirError;
      }
    }
  }

  private async readJsonFile(filename: string): Promise<any[]> {
    const filepath = path.join(this.dataDir, filename);
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  private async writeJsonFile(filename: string, data: any[]): Promise<void> {
    await this.ensureDataDir();
    const filepath = path.join(this.dataDir, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'add_json_object',
            description: 'Add a JSON object to a specified file',
            inputSchema: {
              type: 'object',
              properties: {
                filename: {
                  type: 'string',
                  description: 'Name of the JSON file (with .json extension)',
                },
                object: {
                  type: 'object',
                  description: 'JSON object to add',
                },
              },
              required: ['filename', 'object'],
            },
          },
          {
            name: 'get_json_objects',
            description: 'Retrieve all objects from a JSON file',
            inputSchema: {
              type: 'object',
              properties: {
                filename: {
                  type: 'string',
                  description: 'Name of the JSON file (with .json extension)',
                },
              },
              required: ['filename'],
            },
          },
          {
            name: 'query_json_objects',
            description: 'Query JSON objects based on property values',
            inputSchema: {
              type: 'object',
              properties: {
                filename: {
                  type: 'string',
                  description: 'Name of the JSON file (with .json extension)',
                },
                property: {
                  type: 'string',
                  description: 'Property name to search by',
                },
                value: {
                  description: 'Value to search for (can be string, number, boolean)',
                },
              },
              required: ['filename', 'property', 'value'],
            },
          },
          {
            name: 'update_json_object',
            description: 'Update a JSON object by index',
            inputSchema: {
              type: 'object',
              properties: {
                filename: {
                  type: 'string',
                  description: 'Name of the JSON file (with .json extension)',
                },
                index: {
                  type: 'number',
                  description: 'Index of the object to update',
                },
                updates: {
                  type: 'object',
                  description: 'Properties to update',
                },
              },
              required: ['filename', 'index', 'updates'],
            },
          },
          {
            name: 'delete_json_object',
            description: 'Delete a JSON object by index',
            inputSchema: {
              type: 'object',
              properties: {
                filename: {
                  type: 'string',
                  description: 'Name of the JSON file (with .json extension)',
                },
                index: {
                  type: 'number',
                  description: 'Index of the object to delete',
                },
              },
              required: ['filename', 'index'],
            },
          },
          {
            name: 'list_json_files',
            description: 'List all available JSON files',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'add_json_object': {
            if (!args || typeof args !== 'object') {
              throw new Error('Missing arguments');
            }
            const { filename, object } = args as { filename: string; object: any };
            if (!filename || !object) {
              throw new Error('Missing required arguments: filename and object');
            }
            return await this.addJsonObject(filename, object);
          }

          case 'get_json_objects': {
            if (!args || typeof args !== 'object') {
              throw new Error('Missing arguments');
            }
            const { filename } = args as { filename: string };
            if (!filename) {
              throw new Error('Missing required argument: filename');
            }
            return await this.getJsonObjects(filename);
          }

          case 'query_json_objects': {
            if (!args || typeof args !== 'object') {
              throw new Error('Missing arguments');
            }
            const { filename, property, value } = args as { filename: string; property: string; value: any };
            if (!filename || !property || value === undefined) {
              throw new Error('Missing required arguments: filename, property, and value');
            }
            return await this.queryJsonObjects(filename, property, value);
          }

          case 'update_json_object': {
            if (!args || typeof args !== 'object') {
              throw new Error('Missing arguments');
            }
            const { filename, index, updates } = args as { filename: string; index: number; updates: any };
            if (!filename || index === undefined || !updates) {
              throw new Error('Missing required arguments: filename, index, and updates');
            }
            return await this.updateJsonObject(filename, index, updates);
          }

          case 'delete_json_object': {
            if (!args || typeof args !== 'object') {
              throw new Error('Missing arguments');
            }
            const { filename, index } = args as { filename: string; index: number };
            if (!filename || index === undefined) {
              throw new Error('Missing required arguments: filename and index');
            }
            return await this.deleteJsonObject(filename, index);
          }

          case 'list_json_files':
            return await this.listJsonFiles();

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async addJsonObject(filename: string, object: any) {
    const data = await this.readJsonFile(filename);
    data.push({
      ...object,
      id: Date.now(), // Add a simple ID
      createdAt: new Date().toISOString(),
    });
    await this.writeJsonFile(filename, data);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully added object to ${filename}. Total objects: ${data.length}`,
        },
      ],
    };
  }

  private async getJsonObjects(filename: string) {
    const data = await this.readJsonFile(filename);
    return {
      content: [
        {
          type: 'text',
          text: `Found ${data.length} objects in ${filename}:\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }

  private async queryJsonObjects(filename: string, property: string, value: any) {
    const data = await this.readJsonFile(filename);
    const results = data.filter(obj => obj[property] === value);

    return {
      content: [
        {
          type: 'text',
          text: `Found ${results.length} objects where ${property} = ${value}:\n${JSON.stringify(results, null, 2)}`,
        },
      ],
    };
  }

  private async updateJsonObject(filename: string, index: number, updates: any) {
    const data = await this.readJsonFile(filename);
    
    if (index < 0 || index >= data.length) {
      throw new Error(`Index ${index} is out of bounds. File has ${data.length} objects.`);
    }

    data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
    await this.writeJsonFile(filename, data);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully updated object at index ${index} in ${filename}`,
        },
      ],
    };
  }

  private async deleteJsonObject(filename: string, index: number) {
    const data = await this.readJsonFile(filename);
    
    if (index < 0 || index >= data.length) {
      throw new Error(`Index ${index} is out of bounds. File has ${data.length} objects.`);
    }

    data.splice(index, 1);
    await this.writeJsonFile(filename, data);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully deleted object at index ${index} from ${filename}. Remaining objects: ${data.length}`,
        },
      ],
    };
  }

  private async listJsonFiles() {
    await this.ensureDataDir();
    const files = await fs.readdir(this.dataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    return {
      content: [
        {
          type: 'text',
          text: `Available JSON files:\n${jsonFiles.length > 0 ? jsonFiles.join('\n') : 'No JSON files found'}`,
        },
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('JSON MCP Server running on stdio');
  }
}

// Start the server
const server = new JsonMcpServer();
server.run().catch(console.error);