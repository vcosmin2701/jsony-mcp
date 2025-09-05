export abstract class BaseError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class FileNotFoundError extends BaseError {
  constructor(filename: string) {
    super(`File not found: ${filename}`, 404);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class IndexOutOfBoundsError extends BaseError {
  constructor(index: number, length: number) {
    super(`Index ${index} is out of bounds. Array has ${length} elements.`, 400);
  }
}

export class FileOperationError extends BaseError {
  constructor(message: string, originalError?: Error) {
    super(
      `File operation failed: ${message}${originalError ? ` - ${originalError.message}` : ''}`,
      500
    );
  }
}

export class ToolNotFoundError extends BaseError {
  constructor(toolName: string) {
    super(`Unknown tool: ${toolName}`, 404);
  }
}

export class MissingArgumentsError extends BaseError {
  constructor(message: string) {
    super(`Missing required arguments: ${message}`, 400);
  }
}