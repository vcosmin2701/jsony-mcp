import { Configuration, IConfiguration } from '../config/Configuration';
import { JsonFileRepository, IJsonFileRepository } from '../repositories/JsonFileRepository';
import { JsonDataService, IJsonDataService } from '../services/JsonDataService';
import { IToolHandler } from '../handlers/ToolHandler';
import {
  AddJsonObjectHandler,
  GetJsonObjectsHandler,
  QueryJsonObjectsHandler,
  UpdateJsonObjectHandler,
  DeleteJsonObjectHandler,
  ListJsonFilesHandler
} from '../handlers';

export interface IDependencyContainer {
  getConfiguration(): IConfiguration;
  getRepository(): IJsonFileRepository;
  getService(): IJsonDataService;
  getToolHandlers(): Map<string, IToolHandler>;
}

export class DependencyContainer implements IDependencyContainer {
  private configuration: IConfiguration;
  private repository: IJsonFileRepository;
  private service: IJsonDataService;
  private toolHandlers: Map<string, IToolHandler>;

  constructor() {
    this.configuration = this.createConfiguration();
    this.repository = this.createRepository();
    this.service = this.createService();
    this.toolHandlers = this.createToolHandlers();
  }

  private createConfiguration(): IConfiguration {
    return new Configuration();
  }

  private createRepository(): IJsonFileRepository {
    const dataDir = this.configuration.getDataDirectory();
    return new JsonFileRepository(dataDir);
  }

  private createService(): IJsonDataService {
    return new JsonDataService(this.repository);
  }

  private createToolHandlers(): Map<string, IToolHandler> {
    const handlers = new Map<string, IToolHandler>();
    
    const handlerInstances: IToolHandler[] = [
      new AddJsonObjectHandler(this.service),
      new GetJsonObjectsHandler(this.service),
      new QueryJsonObjectsHandler(this.service),
      new UpdateJsonObjectHandler(this.service),
      new DeleteJsonObjectHandler(this.service),
      new ListJsonFilesHandler(this.service),
    ];

    handlerInstances.forEach(handler => {
      handlers.set(handler.getName(), handler);
    });

    return handlers;
  }

  public getConfiguration(): IConfiguration {
    return this.configuration;
  }

  public getRepository(): IJsonFileRepository {
    return this.repository;
  }

  public getService(): IJsonDataService {
    return this.service;
  }

  public getToolHandlers(): Map<string, IToolHandler> {
    return this.toolHandlers;
  }
}