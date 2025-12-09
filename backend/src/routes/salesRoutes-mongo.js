const express = require("express");
const Sales = require('../models/Sales');

const router = express.Router();

// MongoDB-based sales handler
const getSalesHandler = async (req, res) => {
  try {
    const {
      searchTerm = "",
      regions = [],
      genders = [],
      ageRange = [],
      categories = [],
      tags = [],
      paymentMethods = [],
      dateFrom = "",
      dateTo = "",
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

    // Build MongoDB query
    const query = {};
    
    // Search
    if (searchTerm) {
      query.$or = [
        { customerName: { $regex: searchTerm, $options: 'i' } },
        { phoneNumber: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Multi-select filters
    const regionArray = parseArray(regions);
    const genderArray = parseArray(genders);
    const categoryArray = parseArray(categories);
    const tagArray = parseArray(tags);
    const paymentArray = parseArray(paymentMethods);
    const ageRangeArray = parseArray(ageRange);

    if (regionArray.length) query.customerRegion = { $in: regionArray };
    if (genderArray.length) query.gender = { $in: genderArray };
    if (categoryArray.length) query.productCategory = { $in: categoryArray };
    if (tagArray.length) query.tags = { $in: tagArray };
    if (paymentArray.length) query.paymentMethod = { $in: paymentArray };

    // Age range filter
    if (ageRangeArray.length) {
      const ageConditions = [];
      ageRangeArray.forEach(range => {
        if (range.includes("-")) {
          const [min, max] = range.split("-").map(a => parseInt(a.trim()));
          ageConditions.push({ age: { $gte: min, $lte: max } });
        } else if (range.includes("+")) {
          const min = parseInt(range.replace("+", "").trim());
          ageConditions.push({ age: { $gte: min } });
        }
      });
      
      if (ageConditions.length > 0) {
        if (query.$or) {
          query.$and = [{ $or: query.$or }, { $or: ageConditions }];
          delete query.$or;
        } else {
          query.$or = ageConditions;
        }
      }
    }

    // Date range
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo + 'T23:59:59.999Z');
    }

    // Count total for pagination
    const totalItems = await Sales.countDocuments(query);

    // Sorting
    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Get data
    const data = await Sales.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Calculate stats
    const statsResult = await Sales.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalUnitsSold: { $sum: "$quantity" },
          totalAmount: { $sum: "$totalAmount" },
          totalDiscount: { $sum: { $subtract: ["$totalAmount", "$finalAmount"] } }
        }
      }
    ]);

    const stats = statsResult[0] || {
      totalUnitsSold: 0,
      totalAmount: 0,
      totalDiscount: 0
    };

    res.json({
      data,
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
        currentPage: pageNum,
        pageSize: limitNum,
        hasNextPage: pageNum < Math.ceil(totalItems / limitNum),
        hasPrevPage: pageNum > 1
      },
      stats,
      _meta: {
        source: 'MongoDB Atlas',
        queryTime: Date.now()
      }
    });

  } catch (error) {
    console.error("MongoDB query error:", error);
    res.status(500).json({ 
      message: "Database query failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

router.get("/sales", getSalesHandler);

module.exports = router;