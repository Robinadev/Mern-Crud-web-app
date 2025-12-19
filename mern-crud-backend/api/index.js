import app from '../server.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Global variable to track connection status
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('✅ Using existing database connection');
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅ MongoDB Atlas connected via Vercel serverless');
    
    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB disconnected');
      isConnected = false;
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Please check:');
    console.error('1. MongoDB Atlas cluster is running');
    console.error('2. IP is whitelisted (0.0.0.0/0) in MongoDB Atlas');
    console.error('3. Database credentials are correct');
    console.error('4. MONGODB_URI is set in Vercel environment variables');
    isConnected = false;
    throw error;
  }
};

// Vercel serverless function handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Connect to database (cached between requests)
  try {
    await connectToDatabase();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message
    });
  }

  // Pass request to Express app
  return app(req, res);
}