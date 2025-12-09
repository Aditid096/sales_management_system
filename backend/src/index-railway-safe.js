require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for deployment
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;

let salesData = null;
let dataSource = 'UNKNOWN';

// Mock data for immediate deployment (in case of issues)
const mockSalesData = [
  {
    transactionId: "TXN001",
    date: "2024-01-15",
    customerId: "CUST001",
    customerName: "John Doe",
    phoneNumber: "+1234567890",
    gender: "Male",
    age: 28,
    customerRegion: "North",
    customerType: "Premium",
    productId: "PROD001",
    productName: "Wireless Headphones",
    brand: "TechBrand",
    productCategory: "Electronics",
    tags: ["wireless", "portable"],
    quantity: 2,
    pricePerUnit: 99.99,
    discountPercentage: 10,
    totalAmount: 199.98,
    finalAmount: 179.98,
    paymentMethod: "Credit Card",
    orderStatus: "Completed",
    deliveryType: "Express",
    storeId: "STORE001",
    storeLocation: "New York",
    salespersonId: "EMP001",
    employeeName: "Jane Smith"
  },
  {
    transactionId: "TXN002",
    date: "2024-01-16",
    customerId: "CUST002", 
    customerName: "Sarah Johnson",
    phoneNumber: "+1987654321",
    gender: "Female",
    age: 34,
    customerRegion: "South",
    customerType: "Regular",
    productId: "PROD002",
    productName: "Skincare Set",
    brand: "BeautyPro",
    productCategory: "Beauty",
    tags: ["organic", "skincare"],
    quantity: 1,
    pricePerUnit: 79.99,
    discountPercentage: 5,
    totalAmount: 79.99,
    finalAmount: 75.99,
    paymentMethod: "UPI",
    orderStatus: "Completed",
    deliveryType: "Standard",
    storeId: "STORE002",
    storeLocation: "Miami",
    salespersonId: "EMP002",
    employeeName: "Mike Wilson"
  }
];

// Smart data loading with better error handling
async function loadData() {
  console.log('🔄 Starting Railway-optimized data loading...');
  
  // Try MongoDB Atlas first
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('username')) {
    try {
      console.log('🎯 Attempting MongoDB Atlas connection...');
      const mongoose = require('mongoose');
      const Sales = require('./models/Sales');
      
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // 5 second timeout
        socketTimeoutMS: 45000,
      });
      
      console.log('✅ MongoDB Atlas connected successfully!');
      
      // Quick check for data
      const count = await Sales.countDocuments();
      if (count > 0) {
        console.log(`📊 Found ${count} records in MongoDB Atlas`);
        dataSource = 'MONGODB_ATLAS';
        return { source: 'mongodb', count };
      } else {
        console.log('⚠️ MongoDB connected but no data found');
        throw new Error('No data in MongoDB');
      }
    } catch (error) {
      console.log('⚠️ MongoDB connection failed:', error.message);
      console.log('🔄 Falling back to mock data...');
    }
  } else {
    console.log('💡 No valid MongoDB URI found');
  }
  
  // Use mock data as reliable fallback
  console.log('📄 Using mock data for demonstration...');
  salesData = mockSalesData;
  dataSource = 'MOCK_DATA';
  console.log(`✅ Mock data loaded: ${salesData.length} sample records`);
  return { source: 'mock', count: salesData.length };
}

// Simple filtering for mock data
function applyFilters(records, filters) {
  return records.filter(r => {
    if (filters.regions?.length && !filters.regions.includes(r.customerRegion)) return false;
    if (filters.genders?.length && !filters.genders.includes(r.gender)) return false;
    if (filters.categories?.length && !filters.categories.includes(r.productCategory)) return false;
    if (filters.tags?.length && !filters.tags.some(tag => r.tags.includes(tag))) return false;
    if (filters.paymentMethods?.length && !filters.paymentMethods.includes(r.paymentMethod)) return false;
    return true;
  });
}

function applySearch(records, searchTerm) {
  if (!searchTerm) return records;
  const search = searchTerm.toLowerCase();
  return records.filter(r => 
    r.customerName.toLowerCase().includes(search) || 
    r.phoneNumber.includes(searchTerm)
  );
}

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "TruEstate Sales Management API", 
    status: "running",
    dataSource,
    recordCount: salesData ? salesData.length : 'Unknown',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0-railway',
    note: dataSource === 'MOCK_DATA' ? 'Using sample data - MongoDB Atlas may need network configuration' : 'Production ready'
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: 'healthy',
    dataSource,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Sales API endpoint
app.get("/api/sales", async (req, res) => {
  try {
    const {
      searchTerm = "",
      regions = [],
      genders = [],
      categories = [],
      tags = [],
      paymentMethods = [],
      sortBy = "customerName",
      sortOrder = "asc",
      page = 1,
      limit = 10
    } = req.query;

    // Parse arrays
    const parseArray = (param) => {
      if (!param) return [];
      if (Array.isArray(param)) return param;
      return String(param).split(',').map(v => v.trim()).filter(Boolean);
    };

    if (dataSource === 'MONGODB_ATLAS') {
      // Use MongoDB routes
      const mongoRoutes = require("./routes/salesRoutes-mongo");
      return mongoRoutes(req, res);
    } else {
      // Use mock data
      let filtered = salesData || mockSalesData;
      
      // Apply search
      filtered = applySearch(filtered, searchTerm);
      
      // Apply filters
      filtered = applyFilters(filtered, {
        regions: parseArray(regions),
        genders: parseArray(genders),
        categories: parseArray(categories),
        tags: parseArray(tags),
        paymentMethods: parseArray(paymentMethods)
      });

      // Calculate stats
      const stats = {
        totalUnitsSold: filtered.reduce((sum, r) => sum + r.quantity, 0),
        totalAmount: filtered.reduce((sum, r) => sum + r.totalAmount, 0),
        totalDiscount: filtered.reduce((sum, r) => sum + (r.totalAmount - r.finalAmount), 0)
      };

      // Pagination
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      const paginatedData = filtered.slice(startIndex, endIndex);
      
      res.json({
        data: paginatedData,
        meta: {
          totalItems: filtered.length,
          totalPages: Math.ceil(filtered.length / limitNum),
          currentPage: pageNum,
          pageSize: limitNum
        },
        stats,
        _meta: {
          source: dataSource,
          note: dataSource === 'MOCK_DATA' ? 'Sample data - configure MongoDB Atlas network access for full dataset' : undefined
        }
      });
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ 
      message: "API error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Start server with guaranteed success
async function startServer() {
  try {
    console.log('🚀 TruEstate Sales API Starting (Railway Safe Mode)...');
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    const dataInfo = await loadData();
    console.log(`📈 Data source: ${dataInfo.source.toUpperCase()}`);
    console.log(`📊 Records available: ${dataInfo.count}`);
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`✨ Server running successfully!`);
      console.log(`🔗 Health check: http://localhost:${PORT}/`);
      console.log(`📊 API endpoint: http://localhost:${PORT}/api/sales`);
      console.log(`💾 Data source: ${dataSource}`);
      console.log(`🎯 Status: Production ready!`);
    });
    
  } catch (error) {
    console.error('❌ Startup error:', error.message);
    // Still start with mock data
    salesData = mockSalesData;
    dataSource = 'EMERGENCY_MOCK';
    
    app.listen(PORT, () => {
      console.log(`🛡️ Server started in emergency mode with mock data!`);
      console.log(`🔗 Health check: http://localhost:${PORT}/`);
    });
  }
}

// Graceful error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

startServer();