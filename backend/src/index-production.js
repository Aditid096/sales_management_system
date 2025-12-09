require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || ['*'] // Allow production frontend
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;

let salesData = null;
let dataSource = 'UNKNOWN';

// Smart data loading - MongoDB with CSV fallback
async function loadData() {
  console.log('🔄 Starting smart data loading...');
  
  // Try MongoDB Atlas first
  if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_connection_string_here') {
    try {
      console.log('🎯 Attempting MongoDB Atlas connection...');
      const mongoose = require('mongoose');
      const Sales = require('./models/Sales');
      
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB Atlas connected successfully!');
      
      // Check if data exists
      const count = await Sales.countDocuments();
      if (count > 0) {
        console.log(`📊 Found ${count} records in MongoDB Atlas`);
        dataSource = 'MONGODB_ATLAS';
        return { source: 'mongodb', count };
      } else {
        console.log('⚠️ MongoDB connected but no data found, falling back to CSV...');
      }
    } catch (error) {
      console.log('⚠️ MongoDB connection failed, falling back to CSV...');
      console.log(`🔍 MongoDB error: ${error.message}`);
    }
  } else {
    console.log('💡 No MongoDB URI found, using CSV mode...');
  }
  
  // Fallback to CSV
  try {
    console.log('📄 Loading data from CSV file...');
    const { loadSalesData } = require("./utils/csvLoader");
    const CSV_PATH = path.join(__dirname, "..", "truestate_assignment_dataset.csv");
    
    salesData = await loadSalesData(CSV_PATH);
    dataSource = 'CSV_FILE';
    console.log(`✅ CSV loaded successfully: ${salesData.length} records`);
    return { source: 'csv', count: salesData.length };
  } catch (error) {
    console.error('❌ CSV loading failed:', error.message);
    throw new Error('Both MongoDB and CSV loading failed');
  }
}

// Health check endpoint with detailed status
app.get("/", (req, res) => {
  res.json({ 
    message: "TruEstate Sales Management API", 
    status: "running",
    dataSource,
    recordCount: salesData ? salesData.length : 'Unknown',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    features: [
      'Multi-select filters',
      'Search (Customer Name + Phone)',
      'Sorting with state preservation',
      'Pagination (10 items/page)'
    ]
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: dataSource === 'MONGODB_ATLAS' ? 'excellent' : 'good',
    dataSource,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Start server with smart initialization
async function startServer() {
  try {
    console.log('🚀 TruEstate Sales API Starting...');
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    const dataInfo = await loadData();
    console.log(`📈 Data source: ${dataInfo.source.toUpperCase()}`);
    console.log(`📊 Records available: ${dataInfo.count}`);
    
    // Set up routes based on data source
    if (dataInfo.source === 'mongodb') {
      // Use MongoDB-based routes
      console.log('🔧 Configuring MongoDB routes...');
      const mongoRoutes = require("./routes/salesRoutes-mongo");
      app.use("/api", mongoRoutes);
    } else {
      // Use CSV-based routes
      console.log('🔧 Configuring CSV routes...');
      const csvRoutes = require("./routes/salesRoutes");
      
      // Middleware to attach CSV data
      app.use((req, res, next) => {
        req.salesData = salesData;
        next();
      });
      
      app.use("/api", csvRoutes);
    }

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        dataSource: dataSource
      });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({ 
        message: 'Route not found',
        availableEndpoints: [
          'GET /',
          'GET /health', 
          'GET /api/sales'
        ]
      });
    });

    // Start listening
    app.listen(PORT, () => {
      console.log(`✨ Server running successfully!`);
      console.log(`🔗 Health check: http://localhost:${PORT}/`);
      console.log(`📊 API endpoint: http://localhost:${PORT}/api/sales`);
      console.log(`💾 Data source: ${dataSource}`);
      console.log(`🎯 Status: Ready for production!`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('💡 This should not happen with CSV fallback!');
    process.exit(1);
  }
}

// Graceful error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  console.log('🛡️ Server continuing with current data source...');
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  console.log('🛡️ Server attempting graceful shutdown...');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

startServer();