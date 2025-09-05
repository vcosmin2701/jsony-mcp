# MCP JSON Server Architecture

## Overview
The MCP JSON Server has been refactored following clean code principles, SOLID principles, and TypeScript best practices.

## Directory Structure
```
src/
├── config/             # Configuration management
│   └── Configuration.ts
├── container/          # Dependency injection
│   └── DependencyContainer.ts
├── errors/             # Custom error types
│   └── CustomErrors.ts
├── handlers/           # Tool handlers (Strategy pattern)
│   ├── ToolHandler.ts
│   └── index.ts
├── repositories/       # Data access layer
│   └── JsonFileRepository.ts
├── services/           # Business logic layer
│   └── JsonDataService.ts
├── types/              # TypeScript interfaces and types
│   └── index.ts
├── McpJsonServer.ts    # Main server class
└── server.ts           # Entry point
```

## Design Patterns & Principles

### SOLID Principles

#### Single Responsibility Principle (SRP)
- **Configuration**: Manages server configuration
- **Repository**: Handles file I/O operations
- **Service**: Contains business logic
- **Handlers**: Process individual tool requests
- **Container**: Manages dependencies

#### Open/Closed Principle (OCP)
- New tool handlers can be added without modifying existing code
- Base classes allow extension through inheritance

#### Liskov Substitution Principle (LSP)
- All handlers implement `IToolHandler` interface
- Services and repositories use interfaces for substitutability

#### Interface Segregation Principle (ISP)
- Focused interfaces for each layer (IConfiguration, IJsonFileRepository, IJsonDataService)
- No forced implementation of unnecessary methods

#### Dependency Inversion Principle (DIP)
- High-level modules depend on abstractions (interfaces)
- Dependency injection through constructor parameters

### Design Patterns

#### Strategy Pattern
- Tool handlers implement a common interface
- Server dynamically selects handler based on tool name

#### Repository Pattern
- Abstracts data access logic
- Separates business logic from data persistence

#### Dependency Injection
- `DependencyContainer` manages object creation and dependencies
- Improves testability and maintainability

#### Factory Method
- Container creates instances of services and handlers

## Key Components

### Configuration
- Environment-based configuration
- Default to `~/.mcp-json-server/data` for data storage
- Configurable via `MCP_JSON_DATA_DIR` environment variable

### Error Handling
- Custom error hierarchy with `BaseError`
- Specific error types for different scenarios
- Proper error propagation and logging

### Type Safety
- Comprehensive TypeScript interfaces
- Strong typing throughout the codebase
- Parameter validation in handlers

## Benefits

1. **Testability**: Each component can be tested in isolation
2. **Maintainability**: Clear separation of concerns
3. **Extensibility**: Easy to add new features without breaking existing code
4. **Type Safety**: Full TypeScript support with proper typing
5. **Error Handling**: Robust error management with custom error types
6. **Configuration**: Flexible configuration management

## Adding New Tools

To add a new tool:
1. Create a new handler class extending `BaseToolHandler`
2. Implement the `execute` method
3. Register the handler in `DependencyContainer`

Example:
```typescript
export class MyNewToolHandler extends BaseToolHandler {
  constructor(private readonly service: IJsonDataService) {
    super('my_new_tool', 'Description', { /* schema */ });
  }
  
  public async execute(args: any): Promise<ToolResult> {
    // Implementation
  }
}
```