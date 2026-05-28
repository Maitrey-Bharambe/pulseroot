const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');
const cors = require('cors');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  
  // Enable CORS
  server.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
  }));

  const httpServer = http.createServer(server);
  
  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Share Socket.IO server with request context
  server.use((req, res, nextReq) => {
    req.io = io;
    nextReq();
  });

  // Socket.IO event handler
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join a device-specific room for real-time telemetry
    socket.on('join-device', (deviceId) => {
      console.log(`[Socket] Client ${socket.id} joining room: ${deviceId}`);
      socket.join(deviceId);
    });

    // Handle manual pump activation from client and relay to ESP32
    socket.on('pump-toggle', ({ deviceId, action }) => {
      console.log(`[Socket] Pump toggle requested for ${deviceId}: ${action}`);
      // Broadcast command to any listening ESP32 units in this room
      io.to(deviceId).emit('pump-command', { deviceId, action });
      // Broadcast status update back to the web console
      io.to(deviceId).emit('status-update', { deviceId, pumpStatus: action === 'on' });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  // Allow standard Next.js App Router endpoints and page rendering
  server.all(/.*/, (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});
