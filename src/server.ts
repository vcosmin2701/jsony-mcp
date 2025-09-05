#!/usr/bin/env node

import { DependencyContainer } from './container/DependencyContainer';
import { McpJsonServer } from './McpJsonServer';

async function main(): Promise<void> {
  try {
    const container = new DependencyContainer();
    const server = new McpJsonServer(container);
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await server.shutdown();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      await server.shutdown();
      process.exit(0);
    });
    
    await server.run();
  } catch (error) {
    console.error('[FATAL] Failed to start server:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('[FATAL] Unhandled error:', error);
  process.exit(1);
});