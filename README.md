# Live Voice Interview - Modular Architecture

A modular WebSocket server for live voice interviews using GPT Realtime API.

## 🏗️ Architecture

This project follows a **modular design** with clear separation of concerns:

- **Core**: Server setup and message routing
- **Handlers**: Message processing logic
- **Services**: Business logic and external API integration
- **Config**: Configuration and constants
- **Utils**: Utility functions

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

Create a `.env` file:

```env
PORT=3001
OPENAI_API_KEY=your_api_key_here
LOG_LEVEL=1  # 0=DEBUG, 1=INFO, 2=WARN, 3=ERROR
```

## 🚀 Usage

### Start Server

```bash
node index.js
```

### With Custom Session Config

Edit `index.js`:

```javascript
const server = createWebSocketServer(port, {
  sessionConfig: {
    level: "senior",
    role: "backend-developer",
    stack: ["Node.js", "PostgreSQL"],
  },
});
```

## 📁 Project Structure

```
src/
├── core/              # Core server logic
├── handlers/         # Message handlers
├── services/         # Business logic
├── config/           # Configuration
└── utils/            # Utilities
```

## 🔄 Message Flow

1. Client sends audio → `audioHandler`
2. Client sends commit → `commitHandler` → GPT responds
3. Client sends end_interview → `endInterviewHandler` → Farewell → Close

## 🧪 Development

### Adding New Features

1. Create handler in `src/handlers/`
2. Add route in `src/core/messageRouter.js`
3. Add message type in `src/config/messageConfig.js`

## 📝 License

ISC

