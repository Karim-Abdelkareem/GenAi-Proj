# Express + WebSocket Integration

This document explains how Express HTTP server and WebSocket server are integrated in a single server.

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         HTTP Server (Express)        │
│  - REST API endpoints               │
│  - Auth routes (/api/auth/*)        │
│  - Health check (/health)           │
└─────────────────────────────────────┘
              │
              │ (shares same HTTP server)
              ▼
┌─────────────────────────────────────┐
│      WebSocket Server (ws)           │
│  - Voice interview WebSocket        │
│  - Real-time audio streaming        │
│  - GPT Realtime API integration     │
└─────────────────────────────────────┘
```

## 📁 File Structure

```
index.js                    # Main entry point - starts both servers
src/
├── app.js                 # Express app configuration
├── core/
│   └── server.js         # WebSocket server (supports both standalone & attached)
└── modules/
    └── auth/             # Auth module with Express routes
```

## 🔄 How It Works

### 1. Express App Creation (`src/app.js`)

```javascript
export function createExpressApp() {
  const app = express();
  // ... middleware and routes
  return app;
}
```

### 2. HTTP Server Creation (`index.js`)

```javascript
const app = createExpressApp();
const httpServer = http.createServer(app);
```

### 3. WebSocket Server Attachment (`index.js`)

```javascript
const wss = createWebSocketServer(httpServer, options);
```

The WebSocket server attaches to the same HTTP server, sharing the same port.

### 4. Server Start (`index.js`)

```javascript
httpServer.listen(port, () => {
  // Both Express and WebSocket are now running on the same port
});
```

## 🌐 Endpoints

### HTTP Endpoints (Express)

- `GET /health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `PATCH /api/auth/update-password` - Update password (protected)
- ... (see auth routes for full list)

### WebSocket Endpoint

- `ws://localhost:3000` - Voice interview WebSocket connection

## 🚀 Usage

### Start Server

```bash
node index.js
```

### Environment Variables

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
OPENAI_API_KEY=your-openai-key
NODE_ENV=development
```

## 📡 Client Connections

### HTTP Client (REST API)

```javascript
// Register user
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});
```

### WebSocket Client

```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  console.log('Connected to WebSocket server');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

## 🔐 Authentication

The WebSocket server can optionally verify JWT tokens from the Express auth system:

```javascript
// In WebSocket connection handler
const token = url.searchParams.get('token');
// Verify token using same JWT secret
```

## ⚙️ Configuration

### Custom Session Config

```javascript
const wss = createWebSocketServer(httpServer, {
  sessionConfig: {
    level: "senior",
    role: "backend-developer",
    stack: ["Node.js", "PostgreSQL"],
  },
});
```

## 🛠️ Benefits

1. **Single Port**: Both HTTP and WebSocket on same port
2. **Shared Resources**: Same HTTP server instance
3. **Unified Logging**: Consistent logging across both
4. **Easy Deployment**: Single process to manage
5. **CORS Handling**: Can share CORS configuration

## 🔍 Debugging

### Check if server is running

```bash
curl http://localhost:3000/health
```

### Test WebSocket connection

```javascript
const ws = new WebSocket('ws://localhost:3000');
ws.on('open', () => console.log('Connected!'));
```

## 📝 Notes

- WebSocket server can work standalone (with port number) or attached to HTTP server
- Both servers share the same error handling
- Graceful shutdown closes both servers properly
- Database connection is initialized before starting servers

