const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  customerId: {
    type: String,
    required: true,
    index: true
  },
  customerName: {
    type: String,
    required: true,
    index: true
  },
  phoneNumber: {
    type: String,
    required: true,
    index: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    index: true
  },
  age: {
    type: Number,
    min: 0,
    max: 120,
    index: true
  },
  customerRegion: {
    type: String,
    enum: ['North', 'South', 'East', 'West', 'Central'],
    index: true
  },
  customerType: String,
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  brand: String,
  productCategory: {
    type: String,
    index: true
  },
  tags: [{
    type: String,
    index: true
  }],
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking', 'Wallet'],
    index: true
  },
  orderStatus: String,
  deliveryType: String,
  storeId: String,
  storeLocation: String,
  salespersonId: String,
  employeeName: String,
}, {
  timestamps: true,
  collection: 'sales'
});

// Compound indexes for better query performance
salesSchema.index({ customerName: 'text', phoneNumber: 'text' }); // Text search
salesSchema.index({ customerRegion: 1, gender: 1 }); // Multi-filter queries
salesSchema.index({ productCategory: 1, tags: 1 }); // Product filters
salesSchema.index({ date: -1, customerName: 1 }); // Sorting combinations
salesSchema.index({ age: 1, gender: 1 }); // Age and gender filters

// Virtual for calculated discount amount
salesSchema.virtual('discountAmount').get(function() {
  return this.totalAmount - this.finalAmount;
});

// Static methods for common queries
salesSchema.statics.findBySearchTerm = function(searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    $or: [
      { customerName: regex },
      { phoneNumber: regex }
    ]
  });
};

salesSchema.statics.findByFilters = function(filters) {
  const query = {};
  
  if (filters.regions?.length) query.customerRegion = { $in: filters.regions };
  if (filters.genders?.length) query.gender = { $in: filters.genders };
  if (filters.categories?.length) query.productCategory = { $in: filters.categories };
  if (filters.tags?.length) query.tags = { $in: filters.tags };
  if (filters.paymentMethods?.length) query.paymentMethod = { $in: filters.paymentMethods };
  
  return this.find(query);
};

const Sales = mongoose.model('Sales', salesSchema);

module.exports = Sales;