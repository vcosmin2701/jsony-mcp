import * as path from 'path';
import * as os from 'os';

export interface IConfiguration {
  getDataDirectory(): string;
  getServerName(): string;
  getServerVersion(): string;
}

export class Configuration implements IConfiguration {
  private readonly dataDir: string;
  private readonly serverName: string;
  private readonly serverVersion: string;

  constructor() {
    this.dataDir = this.resolveDataDirectory();
    this.serverName = 'json-manager';
    this.serverVersion = '1.0.0';
  }

  private resolveDataDirectory(): string {
    if (process.env.MCP_JSON_DATA_DIR) {
      return process.env.MCP_JSON_DATA_DIR;
    }

    const homeDir = os.homedir();
    return path.join(homeDir, '.mcp-json-server', 'data');
  }

  public getDataDirectory(): string {
    return this.dataDir;
  }

  public getServerName(): string {
    return this.serverName;
  }

  public getServerVersion(): string {
    return this.serverVersion;
  }
}