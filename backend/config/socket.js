const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Auth middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join personal room
    socket.join(`user:${socket.userId}`);

    // Join role-based room
    socket.join(`role:${socket.userRole}`);

    // Join location-based room (for nearby alerts)
    socket.on('join:location', ({ city, state }) => {
      socket.join(`location:${city}:${state}`);
    });

    // Join request tracking room
    socket.on('join:request', (requestId) => {
      socket.join(`request:${requestId}`);
    });

    // Leave request room
    socket.on('leave:request', (requestId) => {
      socket.leave(`request:${requestId}`);
    });

    // Donor location update
    socket.on('donor:location:update', (data) => {
      socket.to(`request:${data.requestId}`).emit('donor:location', data);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  console.log('⚡ Socket.io initialized');
  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) io.to(`user:${userId}`).emit(event, data);
};

const emitToRole = (role, event, data) => {
  if (io) io.to(`role:${role}`).emit(event, data);
};

const emitToLocation = (city, state, event, data) => {
  if (io) io.to(`location:${city}:${state}`).emit(event, data);
};

const emitToRequest = (requestId, event, data) => {
  if (io) io.to(`request:${requestId}`).emit(event, data);
};

module.exports = { initSocket, getIO, emitToUser, emitToRole, emitToLocation, emitToRequest };
