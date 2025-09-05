import { JsonObject } from '../types';
import { IJsonFileRepository } from '../repositories/JsonFileRepository';
import { IndexOutOfBoundsError, ValidationError } from '../errors/CustomErrors';

export interface IJsonDataService {
  addObject(filename: string, object: JsonObject): Promise<{ message: string; totalCount: number }>;
  getObjects(filename: string): Promise<JsonObject[]>;
  queryObjects(filename: string, property: string, value: any): Promise<JsonObject[]>;
  updateObject(filename: string, index: number, updates: Partial<JsonObject>): Promise<{ message: string }>;
  deleteObject(filename: string, index: number): Promise<{ message: string; remainingCount: number }>;
  listAvailableFiles(): Promise<string[]>;
}

export class JsonDataService implements IJsonDataService {
  constructor(private readonly repository: IJsonFileRepository) {}

  public async addObject(
    filename: string,
    object: JsonObject
  ): Promise<{ message: string; totalCount: number }> {
    this.validateFilename(filename);
    
    const data = await this.repository.read(filename);
    
    const newObject: JsonObject = {
      ...object,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    
    data.push(newObject);
    await this.repository.write(filename, data);
    
    return {
      message: `Successfully added object to ${filename}`,
      totalCount: data.length,
    };
  }

  public async getObjects(filename: string): Promise<JsonObject[]> {
    this.validateFilename(filename);
    return await this.repository.read(filename);
  }

  public async queryObjects(
    filename: string,
    property: string,
    value: any
  ): Promise<JsonObject[]> {
    this.validateFilename(filename);
    
    if (!property) {
      throw new ValidationError('Property name is required for querying');
    }
    
    const data = await this.repository.read(filename);
    return data.filter(obj => this.deepEqual(obj[property], value));
  }

  public async updateObject(
    filename: string,
    index: number,
    updates: Partial<JsonObject>
  ): Promise<{ message: string }> {
    this.validateFilename(filename);
    this.validateIndex(index);
    
    const data = await this.repository.read(filename);
    
    if (index >= data.length) {
      throw new IndexOutOfBoundsError(index, data.length);
    }
    
    data[index] = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await this.repository.write(filename, data);
    
    return {
      message: `Successfully updated object at index ${index} in ${filename}`,
    };
  }

  public async deleteObject(
    filename: string,
    index: number
  ): Promise<{ message: string; remainingCount: number }> {
    this.validateFilename(filename);
    this.validateIndex(index);
    
    const data = await this.repository.read(filename);
    
    if (index >= data.length) {
      throw new IndexOutOfBoundsError(index, data.length);
    }
    
    data.splice(index, 1);
    await this.repository.write(filename, data);
    
    return {
      message: `Successfully deleted object at index ${index} from ${filename}`,
      remainingCount: data.length,
    };
  }

  public async listAvailableFiles(): Promise<string[]> {
    return await this.repository.listFiles();
  }

  private validateFilename(filename: string): void {
    if (!filename || filename.trim() === '') {
      throw new ValidationError('Filename is required');
    }
    
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(filename)) {
      throw new ValidationError('Filename contains invalid characters');
    }
  }

  private validateIndex(index: number): void {
    if (!Number.isInteger(index) || index < 0) {
      throw new ValidationError('Index must be a non-negative integer');
    }
  }

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      return keysA.every(key => this.deepEqual(a[key], b[key]));
    }
    
    return false;
  }
}