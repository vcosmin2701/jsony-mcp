import { ToolResult } from '../types';
import { BaseError } from '../errors/CustomErrors';

export interface IToolHandler {
  execute(args: any): Promise<ToolResult>;
  getName(): string;
  getDescription(): string;
  getInputSchema(): any;
}

export abstract class BaseToolHandler implements IToolHandler {
  constructor(
    protected readonly name: string,
    protected readonly description: string,
    protected readonly inputSchema: any
  ) {}

  public abstract execute(args: any): Promise<ToolResult>;

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public getInputSchema(): any {
    return this.inputSchema;
  }

  protected createSuccessResult(text: string): ToolResult {
    return {
      content: [
        {
          type: 'text',
          text,
        },
      ],
    };
  }

  protected createErrorResult(error: Error | string): ToolResult {
    const message = error instanceof Error ? error.message : error;
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

  protected async handleErrors<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}