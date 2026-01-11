# Modular Architecture Documentation

## 📁 Project Structure

```
live-voice-interview/
├── index.js                    # Main entry point
├── src/
│   ├── core/                   # Core server logic
│   │   ├── server.js           # WebSocket server setup
│   │   └── messageRouter.js    # Message routing logic
│   ├── handlers/               # Message handlers
│   │   ├── audioHandler.js     # Handle audio messages
│   │   ├── commitHandler.js    # Handle commit messages
│   │   └── endInterviewHandler.js  # Handle end interview
│   ├── services/               # Business logic services
│   │   ├── sessionService.js   # Session management
│   │   ├── realtimeService.js  # GPT Realtime API service
│   │   └── transcriptService.js # Transcript processing
│   ├── config/                 # Configuration files
│   │   ├── promptConfig.js     # Prompt templates
│   │   └── messageConfig.js    # Message type constants
│   └── utils/                  # Utility functions
│       ├── logger.js           # Logging utility
│       └── commandDetector.js  # Command detection
└── package.json
```

## 🏗️ Architecture Layers

### 1. **Core Layer** (`src/core/`)
- **server.js**: WebSocket server initialization and connection handling
- **messageRouter.js**: Routes incoming messages to appropriate handlers

### 2. **Handler Layer** (`src/handlers/`)
- **audioHandler.js**: Processes incoming audio messages from client
- **commitHandler.js**: Handles commit signals (user finished speaking)
- **endInterviewHandler.js**: Manages interview termination flow

### 3. **Service Layer** (`src/services/`)
- **sessionService.js**: Session lifecycle management (create, close, validate)
- **realtimeService.js**: GPT Realtime API connection and message handling
- **transcriptService.js**: User transcript processing and command detection

### 4. **Config Layer** (`src/config/`)
- **promptConfig.js**: All GPT prompt templates and instructions
- **messageConfig.js**: Message type constants for type safety

### 5. **Utils Layer** (`src/utils/`)
- **logger.js**: Centralized logging with log levels
- **commandDetector.js**: Command detection from user transcripts

## 🔄 Data Flow

```
Client WebSocket
    ↓
index.js (Entry Point)
    ↓
core/server.js (Connection Handler)
    ↓
core/messageRouter.js (Route Message)
    ↓
handlers/*.js (Process Message)
    ↓
services/*.js (Business Logic)
    ↓
GPT Realtime API / Client Response
```

## 📝 Module Responsibilities

### Core Modules

#### `core/server.js`
- Creates WebSocket server
- Handles new connections
- Initializes sessions
- Sets up GPT Realtime connection
- Manages connection lifecycle

#### `core/messageRouter.js`
- Parses incoming messages
- Routes to appropriate handler
- Error handling

### Handler Modules

#### `handlers/audioHandler.js`
- Validates session state
- Forwards audio to GPT Realtime API

#### `handlers/commitHandler.js`
- Triggers GPT response after user finishes speaking
- Sends `input_audio_buffer.commit` and `response.create`

#### `handlers/endInterviewHandler.js`
- Handles interview termination
- Requests farewell message from GPT
- Manages connection closure

### Service Modules

#### `services/sessionService.js`
- Creates new sessions
- Manages session state
- Closes sessions
- Validates session status

#### `services/realtimeService.js`
- Establishes GPT Realtime API connection
- Handles GPT messages (audio, transcripts, responses)
- Forwards audio to client
- Manages connection state

#### `services/transcriptService.js`
- Processes user transcripts
- Detects end commands
- Updates session state

### Config Modules

#### `config/promptConfig.js`
- System prompt builder
- Greeting instruction builder
- Farewell instruction builder
- Continue instruction builder

#### `config/messageConfig.js`
- Message type constants
- GPT message type constants
- Type safety

### Utility Modules

#### `utils/logger.js`
- Centralized logging
- Log levels (DEBUG, INFO, WARN, ERROR)
- Consistent log format

#### `utils/commandDetector.js`
- Detects end commands in transcripts
- Detects repeat commands (future use)

## 🚀 Usage

### Basic Usage

```javascript
import { createWebSocketServer } from "./src/core/server.js";

const server = createWebSocketServer(3001);
```

### With Custom Session Config

```javascript
import { createWebSocketServer } from "./src/core/server.js";

const server = createWebSocketServer(3001, {
  sessionConfig: {
    level: "senior",
    role: "backend-developer",
    stack: ["Node.js", "PostgreSQL", "Docker"],
  },
});
```

## 🔧 Extending the Architecture

### Adding a New Handler

1. Create handler file in `src/handlers/`
2. Export handler function
3. Add route in `src/core/messageRouter.js`
4. Add message type in `src/config/messageConfig.js`

Example:
```javascript
// src/handlers/customHandler.js
export function handleCustom(session, message) {
  // Handler logic
}

// src/core/messageRouter.js
import { handleCustom } from "../handlers/customHandler.js";

export function routeMessage(clientSocket, session, message) {
  switch (message.type) {
    case MESSAGE_TYPES.CUSTOM:
      handleCustom(session, message);
      break;
    // ...
  }
}
```

### Adding a New Service

1. Create service file in `src/services/`
2. Export service functions
3. Import and use in handlers/services

Example:
```javascript
// src/services/customService.js
export function processCustom(data) {
  // Service logic
}
```

## 📊 Benefits of Modular Design

1. **Separation of Concerns**: Each module has a single responsibility
2. **Testability**: Easy to unit test individual modules
3. **Maintainability**: Changes are localized to specific modules
4. **Scalability**: Easy to add new features without affecting existing code
5. **Reusability**: Services and utilities can be reused across handlers
6. **Type Safety**: Constants prevent typos in message types
7. **Consistency**: Centralized logging and error handling

## 🔍 Module Dependencies

```
index.js
  └── core/server.js
      ├── services/sessionService.js
      ├── services/realtimeService.js
      └── core/messageRouter.js
          ├── handlers/audioHandler.js
          ├── handlers/commitHandler.js
          └── handlers/endInterviewHandler.js
              └── config/promptConfig.js
```

## 🧪 Testing Strategy

Each module can be tested independently:

- **Handlers**: Test with mock sessions and messages
- **Services**: Test business logic in isolation
- **Utils**: Test utility functions with various inputs
- **Config**: Test prompt generation with different session configs

## 📚 Best Practices

1. **Single Responsibility**: Each module should do one thing well
2. **Dependency Injection**: Pass dependencies as parameters
3. **Error Handling**: Use logger for consistent error logging
4. **Constants**: Use messageConfig for all message types
5. **Documentation**: JSDoc comments for all exported functions

