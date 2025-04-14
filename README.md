# TypeScript MCP Server

A Model Context Protocol (MCP) server implementation using TypeScript and Express for payroll management.

## What is MCP?

The Model Context Protocol (MCP) enables AI models to interact with external systems in a standardized way. It provides a framework for defining resources, tools, and prompts that LLMs can use to perform tasks.

For more information, visit the [Model Context Protocol repository](https://github.com/modelcontextprotocol/typescript-sdk).

## Features

- Implements the MCP protocol for LLM interactions
- Provides payroll management tools and employee information access
- Uses Express for HTTP handling
- Supports Server-Sent Events (SSE) for real-time communication
- Includes a client example for testing

## Requirements

- Node.js 18+
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on the `.env.example` template:

```bash
cp .env.example .env
```

4. Update the `.env` file with your API configuration:

```
# API configuration
BASE_URL=http://app.localopfin.com
PORT=8089
```

## Running the Server

Start the development server with:

```bash
npm run dev
```

For production:

```bash
npm run build
npm start
```

The server will run on port 8089 by default. You can change this by setting the `PORT` environment variable in the `.env` file.

## Authentication

This server supports two authentication methods for API requests:

1. API authentication using authId and authKey
2. Partner authentication using partnerKey and clientKey

For custom authentication needs, you can modify the `src/api.ts` file.

## API Endpoints

- `GET /sse`: Server-Sent Events endpoint for MCP communication
- `POST /messages`: Endpoint for clients to send messages to the MCP server

## Available Resources

- `greeting://welcome`: A static welcome message
- `users://{userId}`: A dynamic resource that returns user data

## Available Tools

- `view-people`: View information about a specific person using employee ID (requires authId and authKey authentication)
- `view-all-people`: View all people with optional filtering and pagination (supports both API authentication with authId/authKey or Partner authentication with partnerKey/clientKey)
- `getEmployeeInfo`: A simplified employee information retrieval tool that returns basic employee data (name, department, role) based on employee ID
- `calculatePayroll`: Calculate payroll for an employee based on hours worked and hourly rate (computes gross pay, 20% tax, and net pay)

## Available Interfaces

The project includes typed interfaces for API responses:

- `ApiResponse<T>`: Generic API response wrapper with data, error, and status fields
- `ApiConfig`: Configuration for API client with baseUrl and optional headers
- `ApiCredentials`: For API-based authentication with authId and authKey 
- `PartnerCredentials`: For partner-based authentication with partnerKey and clientKey

These interfaces help ensure type safety when working with API data.

## Available Prompts

- `ask-question`: A prompt template for asking questions

## Testing with the Example Client

The repository includes an example client that demonstrates how to connect to the MCP server and use its resources, tools, and prompts.

To run the example client (with the server already running):

```bash
npm run client
```

This will:

1. Connect to the MCP server
2. List available resources, tools, and prompts
3. Read the greeting resource
4. Use the available tools
5. Get the ask-question prompt

## Usage with LLMs

This MCP server can be used with LLM clients that support the MCP protocol. Refer to the MCP documentation for information on how to connect LLM clients to this server.

## License

MIT
