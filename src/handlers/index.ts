import { BaseToolHandler } from './ToolHandler';
import { IJsonDataService } from '../services/JsonDataService';
import { ToolResult, AddObjectParams, GetObjectsParams, QueryObjectsParams, UpdateObjectParams, DeleteObjectParams } from '../types';
import { MissingArgumentsError } from '../errors/CustomErrors';

export class AddJsonObjectHandler extends BaseToolHandler {
  constructor(private readonly service: IJsonDataService) {
    super(
      'add_json_object',
      'Add a JSON object to a specified file',
      {
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
      }
    );
  }

  public async execute(args: any): Promise<ToolResult> {
    const params = this.validateArgs(args);
    const result = await this.service.addObject(params.filename, params.object);
    return this.createSuccessResult(
      `${result.message}. Total objects: ${result.totalCount}`
    );
  }

  private validateArgs(args: any): AddObjectParams {
    if (!args?.filename || !args?.object) {
      throw new MissingArgumentsError('filename and object');
    }
    return args as AddObjectParams;
  }
}

export class GetJsonObjectsHandler extends BaseToolHandler {
  constructor(private readonly service: IJsonDataService) {
    super(
      'get_json_objects',
      'Retrieve all objects from a JSON file',
      {
        type: 'object',
        properties: {
          filename: {
            type: 'string',
            description: 'Name of the JSON file (with .json extension)',
          },
        },
        required: ['filename'],
      }
    );
  }

  public async execute(args: any): Promise<ToolResult> {
    const params = this.validateArgs(args);
    const data = await this.service.getObjects(params.filename);
    return this.createSuccessResult(
      `Found ${data.length} objects in ${params.filename}:\n${JSON.stringify(data, null, 2)}`
    );
  }

  private validateArgs(args: any): GetObjectsParams {
    if (!args?.filename) {
      throw new MissingArgumentsError('filename');
    }
    return args as GetObjectsParams;
  }
}

export class QueryJsonObjectsHandler extends BaseToolHandler {
  constructor(private readonly service: IJsonDataService) {
    super(
      'query_json_objects',
      'Query JSON objects based on property values',
      {
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
      }
    );
  }

  public async execute(args: any): Promise<ToolResult> {
    const params = this.validateArgs(args);
    const results = await this.service.queryObjects(params.filename, params.property, params.value);
    return this.createSuccessResult(
      `Found ${results.length} objects where ${params.property} = ${params.value}:\n${JSON.stringify(results, null, 2)}`
    );
  }

  private validateArgs(args: any): QueryObjectsParams {
    if (!args?.filename || !args?.property || args?.value === undefined) {
      throw new MissingArgumentsError('filename, property, and value');
    }
    return args as QueryObjectsParams;
  }
}

export class UpdateJsonObjectHandler extends BaseToolHandler {
  constructor(private readonly service: IJsonDataService) {
    super(
      'update_json_object',
      'Update a JSON object by index',
      {
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
      }
    );
  }

  public async execute(args: any): Promise<ToolResult> {
    const params = this.validateArgs(args);
    const result = await this.service.updateObject(params.filename, params.index, params.updates);
    return this.createSuccessResult(result.message);
  }

  private validateArgs(args: any): UpdateObjectParams {
    if (!args?.filename || args?.index === undefined || !args?.updates) {
      throw new MissingArgumentsError('filename, index, and updates');
    }
    return args as UpdateObjectParams;
  }
}

export class DeleteJsonObjectHandler extends BaseToolHandler {
  constructor(private readonly service: IJsonDataService) {
    super(
      'delete_json_object',
      'Delete a JSON object by index',
      {
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
      }
    );
  }

  public async execute(args: any): Promise<ToolResult> {
    const params = this.validateArgs(args);
    const result = await this.service.deleteObject(params.filename, params.index);
    return this.createSuccessResult(
      `${result.message}. Remaining objects: ${result.remainingCount}`
    );
  }

  private validateArgs(args: any): DeleteObjectParams {
    if (!args?.filename || args?.index === undefined) {
      throw new MissingArgumentsError('filename and index');
    }
    return args as DeleteObjectParams;
  }
}

export class ListJsonFilesHandler extends BaseToolHandler {
  constructor(private readonly service: IJsonDataService) {
    super(
      'list_json_files',
      'List all available JSON files',
      {
        type: 'object',
        properties: {},
      }
    );
  }

  public async execute(args: any): Promise<ToolResult> {
    const files = await this.service.listAvailableFiles();
    const fileList = files.length > 0 ? files.join('\n') : 'No JSON files found';
    return this.createSuccessResult(`Available JSON files:\n${fileList}`);
  }
}