const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); // Add this line
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/components', express.static(path.join(__dirname, 'assets'))); // Add this line to serve assets folder

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI_DIGINOTE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to DigiNote MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Models
const User = require('./models/User');

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server is running at http://localhost:${PORT}`);
});