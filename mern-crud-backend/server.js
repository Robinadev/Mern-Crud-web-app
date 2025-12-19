import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Connection logic with a more robust fallback
let dbConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  
  // 1. First, attempt to connect with the provided URI
  if (mongoURI) {
    console.log('🔗 Attempting to connect to MongoDB Atlas...');
    try {
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000 // 10 second timeout
      });
      dbConnected = true;
      console.log('✅ SUCCESS: Connected to MongoDB Atlas.');
      return;
    } catch (atlasError) {
      console.warn('⚠️  Atlas connection failed:', atlasError.message);
    }
  }
  
  // 2. If the main connection fails, try a local fallback
  console.log('🔄 Falling back to local test mode (in-memory).');
  // Your API will use the in-memory routes defined next.
};

connectDB();

// Middleware to add connection status to requests
app.use((req, res, next) => {
  req.dbConnected = dbConnected;
  next();
});

// Use your imported routes (they will need to handle the `req.dbConnected` flag)
app.use('/api/users', userRoutes);

// A simple health check endpoint to see the status
app.get('/api/health', (req, res) => {
  res.json({
    status: dbConnected ? 'connected' : 'fallback_mode',
    database: dbConnected ? 'MongoDB Atlas' : 'In-Memory (Demo)',
    message: dbConnected ? 'All systems operational.' : 'Running in local test mode. Check Atlas connection.'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});