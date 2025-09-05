# MCP JSON Server

A Model Context Protocol (MCP) server that provides tools for managing JSON data files. This server allows AI assistants like Claude to read, write, query, and manage JSON files in a structured way.

## Features

- **Add JSON Objects**: Add new objects to JSON files with automatic ID and timestamp generation
- **Query Objects**: Search for objects by property values
- **Update Objects**: Modify existing objects by index
- **Delete Objects**: Remove objects from JSON files
- **List Files**: View all available JSON files
- **Retrieve Objects**: Get all objects from a specific file

## Installation

### Option 1: Install from npm
```bash
npm install -g jsony-mcp
```

### Option 2: Local Development
```bash
git clone https://github.com/vcosmin2701/jsony-mcp
cd mcp-json-server
npm install
npm run build
```

## Configuration

### Claude Desktop Configuration

Add the server to your Claude desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "json-manager": {
      "command": "jsony-mcp"
    }
  }
}
```

For local development:
```json
{
  "mcpServers": {
    "json-manager": {
      "command": "node",
      "args": ["/path/to/mcp-json-server/dist/server.js"]
    }
  }
}
```

### Data Directory

By default, JSON files are stored in `~/.mcp-json-server/data/`

You can customize this location using the `MCP_JSON_DATA_DIR` environment variable:

```json
{
  "mcpServers": {
    "json-manager": {
      "command": "jsony-mcp",
      "env": {
        "MCP_JSON_DATA_DIR": "/custom/path/to/data"
      }
    }
  }
}
```

## Usage

Once configured, Claude can use the following tools:

### add_json_object
Add a new object to a JSON file:
```
Add to todos.json: {"title": "Buy groceries", "completed": false}
```

### get_json_objects
Retrieve all objects from a file:
```
Get all items from todos.json
```

### query_json_objects
Search for objects by property:
```
Find all completed tasks in todos.json
```

### update_json_object
Update an object at a specific index:
```
Update index 0 in todos.json: set completed to true
```

### delete_json_object
Remove an object by index:
```
Delete item at index 2 from todos.json
```

### list_json_files
List all available JSON files:
```
Show me all JSON files
```

## Architecture

The server follows clean code principles and SOLID design patterns:

- **Separation of Concerns**: Modular architecture with distinct layers
- **Dependency Injection**: Improved testability and maintainability
- **Strategy Pattern**: Extensible tool handler system
- **Repository Pattern**: Abstracted data access layer
- **Error Handling**: Custom error types with proper propagation

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed documentation.

## Development

### Build
```bash
npm run build
```

### Run in Development
```bash
npm run dev
```

### Test Locally
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

## Author

Vladut Cosmin

## Links

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [MCP Servers Registry](https://github.com/modelcontextprotocol/servers)