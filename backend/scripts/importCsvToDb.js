require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Sales = require('../src/models/Sales');

// Database connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// Normalize and clean CSV data
function normalizeRecord(raw) {
  // Helper function to clean numeric values
  const cleanNumber = (value) => {
    if (!value) return 0;
    const cleaned = String(value).replace(/[,₹$ ]/g, '');
    return isNaN(cleaned) ? 0 : Number(cleaned);
  };

  // Helper function to parse tags
  const parseTags = (tags) => {
    if (!tags) return [];
    return typeof tags === 'string' 
      ? tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];
  };

  return {
    transactionId: raw["Transaction ID"] || `TXN${Date.now()}`,
    date: new Date(raw["Date"]) || new Date(),
    customerId: raw["Customer ID"] || '',
    customerName: raw["Customer Name"] || '',
    phoneNumber: raw["Phone Number"] || '',
    gender: raw["Gender"] || null,
    age: cleanNumber(raw["Age"]) || null,
    customerRegion: raw["Customer Region"] || '',
    customerType: raw["Customer Type"] || '',
    productId: raw["Product ID"] || '',
    productName: raw["Product Name"] || '',
    brand: raw["Brand"] || '',
    productCategory: raw["Product Category"] || '',
    tags: parseTags(raw["Tags"]),
    quantity: cleanNumber(raw["Quantity"]) || 1,
    pricePerUnit: cleanNumber(raw["Price per Unit"]) || 0,
    discountPercentage: cleanNumber(raw["Discount Percentage"]) || 0,
    totalAmount: cleanNumber(raw["Total Amount"]) || 0,
    finalAmount: cleanNumber(raw["Final Amount"]) || 0,
    paymentMethod: raw["Payment Method"] || '',
    orderStatus: raw["Order Status"] || '',
    deliveryType: raw["Delivery Type"] || '',
    storeId: raw["Store ID"] || '',
    storeLocation: raw["Store Location"] || '',
    salespersonId: raw["Salesperson ID"] || '',
    employeeName: raw["Employee Name"] || '',
  };
}

// Import CSV data to MongoDB
async function importCsvData() {
  const csvPath = path.join(__dirname, '..', 'truestate_assignment_dataset.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found:', csvPath);
    process.exit(1);
  }

  console.log('🔄 Starting CSV import...');
  
  const results = [];
  let processedCount = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        try {
          const normalized = normalizeRecord(data);
          results.push(normalized);
          processedCount++;
          
          // Log progress every 10000 records
          if (processedCount % 10000 === 0) {
            console.log(`📊 Processed ${processedCount} records...`);
          }
        } catch (error) {
          console.warn(`⚠️ Error processing record ${processedCount}:`, error.message);
        }
      })
      .on('end', async () => {
        try {
          console.log(`✅ CSV parsing complete. Total records: ${results.length}`);
          
          // Clear existing data
          console.log('🧹 Clearing existing data...');
          await Sales.deleteMany({});
          
          // Insert in batches to avoid memory issues
          const batchSize = 1000;
          let insertedCount = 0;
          
          console.log('💾 Starting database insertion...');
          
          for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            
            try {
              await Sales.insertMany(batch, { ordered: false });
              insertedCount += batch.length;
              console.log(`📈 Inserted batch: ${insertedCount}/${results.length}`);
            } catch (error) {
              // Handle duplicate key errors gracefully
              const validInserts = error.insertedDocs ? error.insertedDocs.length : 0;
              insertedCount += validInserts;
              console.warn(`⚠️ Batch insertion warning: ${error.message}`);
              console.log(`📊 Valid inserts in batch: ${validInserts}`);
            }
          }
          
          // Verify final count
          const finalCount = await Sales.countDocuments();
          console.log(`✅ Import complete! Records in database: ${finalCount}`);
          
          // Create additional indexes for performance
          console.log('🔧 Creating database indexes...');
          await Sales.syncIndexes();
          console.log('✅ Indexes created successfully');
          
          resolve(finalCount);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Main execution
async function main() {
  try {
    await connectDB();
    const importedCount = await importCsvData();
    
    console.log('\n🎉 IMPORT SUMMARY:');
    console.log(`📊 Total records imported: ${importedCount}`);
    console.log('🚀 Database is ready for production!');
    
    // Test a sample query
    console.log('\n🧪 Testing sample queries...');
    const sampleCustomer = await Sales.findOne({ customerName: { $exists: true } });
    if (sampleCustomer) {
      console.log(`✅ Sample record: ${sampleCustomer.customerName}`);
    }
    
    const totalRecords = await Sales.countDocuments();
    console.log(`✅ Total records in DB: ${totalRecords}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the import
if (require.main === module) {
  main();
}

module.exports = { importCsvData, normalizeRecord };