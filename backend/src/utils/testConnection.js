// Simple test to run without database - for testing the backend logic
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Mock data for testing (small sample)
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
    tags: ["wireless", "portable", "gadgets"],
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

// Simple filtering logic (same as original)
function applySearch(records, searchTerm) {
  if (!searchTerm) return records;
  const search = searchTerm.toLowerCase();
  return records.filter(r => 
    r.customerName.toLowerCase().includes(search) || 
    r.phoneNumber.includes(searchTerm)
  );
}

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

// API endpoints
app.get("/", (req, res) => {
  res.json({ 
    message: "TruEstate Sales Management API - Test Mode", 
    status: "running",
    mode: "mock_data",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/sales", (req, res) => {
  try {
    const {
      searchTerm = "",
      regions = [],
      genders = [],
      categories = [],
      tags = [],
      paymentMethods = [],
      sortBy = "date",
      sortOrder = "desc",
      page = 1,
      limit = 10
    } = req.query;

    // Parse arrays
    const parseArray = (param) => {
      if (!param) return [];
      if (Array.isArray(param)) return param;
      return String(param).split(',').map(v => v.trim()).filter(Boolean);
    };

    let filtered = mockSalesData;
    
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
      _note: "Using mock data - replace with database when ready"
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🧪 Running in TEST MODE with mock data`);
  console.log(`📊 API endpoint: http://localhost:${PORT}/api/sales`);
  console.log(`💡 To use real database, set up MongoDB and restart with npm start`);
});

module.exports = app;