require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Use the original CSV loader for now to avoid MongoDB issues
const { loadSalesData } = require("./utils/csvLoader");
const salesRoutes = require("./routes/salesRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "TruEstate Sales Management API", 
    status: "running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mode: "CSV_MODE"
  });
});

// CSV path
const CSV_PATH = path.join(__dirname, "..", "truestate_assignment_dataset.csv");

// Load CSV data and start server
loadSalesData(CSV_PATH)
  .then((salesData) => {
    console.log(`✅ Loaded ${salesData.length} sales records from CSV`);
    console.log(`📁 CSV file: ${CSV_PATH}`);

    // Middleware to attach sales data to requests
    app.use((req, res, next) => {
      req.salesData = salesData;
      next();
    });

    // API routes
    app.use("/api", salesRoutes);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/`);
      console.log(`📊 API endpoint: http://localhost:${PORT}/api/sales`);
      console.log(`📋 Mode: CSV file loading (working mode)`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to load CSV data:", err.message);
    console.log("💡 Make sure the CSV file exists at:", CSV_PATH);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions  
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});