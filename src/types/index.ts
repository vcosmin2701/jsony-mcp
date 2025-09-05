export interface JsonObject {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface JsonDatabase {
  [key: string]: JsonObject[];
}

export interface ToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

export interface AddObjectParams {
  filename: string;
  object: JsonObject;
}

export interface GetObjectsParams {
  filename: string;
}

export interface QueryObjectsParams {
  filename: string;
  property: string;
  value: any;
}

export interface UpdateObjectParams {
  filename: string;
  index: number;
  updates: Partial<JsonObject>;
}

export interface DeleteObjectParams {
  filename: string;
  index: number;
}

export type ToolParams =
  | AddObjectParams
  | GetObjectsParams
  | QueryObjectsParams
  | UpdateObjectParams
  | DeleteObjectParams;