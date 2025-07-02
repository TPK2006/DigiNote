const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');
require('dotenv').config();

// Function to get local network IP
function getLocalNetworkIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            const { address, family, internal } = interface;
            if (family === 'IPv4' && !internal) {
                return address;
            }
        }
    }
    return 'localhost';
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5005;
const networkIP = getLocalNetworkIP();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/components', express.static(path.join(__dirname, 'assets')));

// Trust proxy for correct IP detection
app.set('trust proxy', true);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI_DIGINOTE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to DigiNote MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Models
const User = require('./models/User');

// Make io accessible to routes
app.set('io', io);

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

const qrRoutes = require('./routes/qrRoutes');
app.use('/api/qr', qrRoutes);

const bookRoutes = require('./routes/bookRoutes');
app.use('/api/books', bookRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Backend server with Socket.IO is running on:`);
    console.log(`   Local:    http://localhost:${PORT}`);
    console.log(`   Network:  http://${networkIP}:${PORT}`);
    console.log(`📱 Mobile devices can scan QR codes to connect!`);
});