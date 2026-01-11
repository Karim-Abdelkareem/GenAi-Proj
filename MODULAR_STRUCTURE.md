# Modular Structure Overview

## ✅ Completed Modular Design

The project has been successfully refactored into a clean, modular architecture.

## 📁 Directory Structure

```
live-voice-interview/
├── index.js                    # Main entry point
├── src/
│   ├── index.js                # Main export file (for module usage)
│   ├── core/                   # Core server logic
│   │   ├── server.js           # WebSocket server setup
│   │   └── messageRouter.js    # Message routing
│   ├── handlers/               # Message handlers
│   │   ├── audioHandler.js     # Audio message handler
│   │   ├── commitHandler.js    # Commit message handler
│   │   └── endInterviewHandler.js  # End interview handler
│   ├── services/               # Business logic services
│   │   ├── sessionService.js   # Session management
│   │   ├── realtimeService.js  # GPT Realtime API
│   │   └── transcriptService.js # Transcript processing
│   ├── config/                 # Configuration
│   │   ├── promptConfig.js     # Prompt templates
│   │   └── messageConfig.js    # Message constants
│   └── utils/                  # Utilities
│       ├── logger.js           # Logging utility
│       └── commandDetector.js  # Command detection
└── ARCHITECTURE.md             # Detailed architecture docs
```

## 🔄 Migration from Old Structure

### Old Files (Still exist for compatibility)
- `src/prompt.js` → Now in `src/config/promptConfig.js`
- `src/realtimeClient.js` → Now in `src/services/realtimeService.js`
- `src/sessionManager.js` → Now in `src/services/sessionService.js`
- `src/commandDetection.js` → Now in `src/utils/commandDetector.js`

### New Modular Files
All functionality has been reorganized into the new structure.

## 🚀 Usage Examples

### Basic Server

```javascript
// index.js
import { createWebSocketServer } from "./src/core/server.js";

const server = createWebSocketServer(3001);
```

### Using as Module

```javascript
// In another project
import { 
  createWebSocketServer,
  createSession,
  logger 
} from "./src/index.js";

const server = createWebSocketServer(3001, {
  sessionConfig: {
    level: "senior",
    role: "backend-developer",
  },
});
```

### Custom Handler

```javascript
// src/handlers/customHandler.js
import { logger } from "../utils/logger.js";
import { isSessionActive } from "../services/sessionService.js";

export function handleCustom(session, message) {
  if (!isSessionActive(session)) {
    logger.warn("Session not active");
    return;
  }
  
  // Custom logic
}
```

## 📊 Module Responsibilities

| Module | Responsibility |
|--------|---------------|
| `core/server.js` | WebSocket server setup, connection handling |
| `core/messageRouter.js` | Route messages to handlers |
| `handlers/*.js` | Process specific message types |
| `services/sessionService.js` | Session lifecycle management |
| `services/realtimeService.js` | GPT Realtime API integration |
| `services/transcriptService.js` | Transcript processing |
| `config/promptConfig.js` | All prompt templates |
| `config/messageConfig.js` | Message type constants |
| `utils/logger.js` | Centralized logging |
| `utils/commandDetector.js` | Command detection |

## ✨ Benefits

1. **Separation of Concerns**: Each module has a single responsibility
2. **Easy Testing**: Modules can be tested independently
3. **Maintainability**: Changes are localized
4. **Scalability**: Easy to add new features
5. **Reusability**: Services can be reused
6. **Type Safety**: Constants prevent errors
7. **Consistency**: Centralized logging

## 🔧 Extending

### Add New Handler

1. Create `src/handlers/newHandler.js`
2. Export handler function
3. Add route in `src/core/messageRouter.js`
4. Add message type in `src/config/messageConfig.js`

### Add New Service

1. Create `src/services/newService.js`
2. Export service functions
3. Import in handlers/services as needed

## 📝 Next Steps

- [ ] Add unit tests for each module
- [ ] Add integration tests
- [ ] Add TypeScript types (optional)
- [ ] Add JSDoc documentation
- [ ] Consider removing old files after migration

