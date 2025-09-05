import * as fs from 'fs/promises';
import * as path from 'path';
import { JsonObject } from '../types';
import { FileNotFoundError, FileOperationError } from '../errors/CustomErrors';

export interface IJsonFileRepository {
  read(filename: string): Promise<JsonObject[]>;
  write(filename: string, data: JsonObject[]): Promise<void>;
  exists(filename: string): Promise<boolean>;
  listFiles(): Promise<string[]>;
  ensureDirectoryExists(): Promise<void>;
}

export class JsonFileRepository implements IJsonFileRepository {
  constructor(private readonly dataDirectory: string) {}

  public async read(filename: string): Promise<JsonObject[]> {
    const filepath = this.getFilePath(filename);
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(content) as JsonObject[];
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw new FileOperationError(`Failed to read file ${filename}`, error);
    }
  }

  public async write(filename: string, data: JsonObject[]): Promise<void> {
    await this.ensureDirectoryExists();
    const filepath = this.getFilePath(filename);
    
    try {
      const content = JSON.stringify(data, null, 2);
      await fs.writeFile(filepath, content, 'utf-8');
    } catch (error: any) {
      throw new FileOperationError(`Failed to write file ${filename}`, error);
    }
  }

  public async exists(filename: string): Promise<boolean> {
    const filepath = this.getFilePath(filename);
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  public async listFiles(): Promise<string[]> {
    await this.ensureDirectoryExists();
    
    try {
      const files = await fs.readdir(this.dataDirectory);
      return files.filter(file => file.endsWith('.json'));
    } catch (error: any) {
      throw new FileOperationError('Failed to list files', error);
    }
  }

  public async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.access(this.dataDirectory);
    } catch {
      try {
        await fs.mkdir(this.dataDirectory, { recursive: true });
      } catch (error: any) {
        throw new FileOperationError(`Failed to create directory ${this.dataDirectory}`, error);
      }
    }
  }

  private getFilePath(filename: string): string {
    if (!filename.endsWith('.json')) {
      filename = `${filename}.json`;
    }
    return path.join(this.dataDirectory, filename);
  }
}