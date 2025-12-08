const fs = require("fs");
const csv = require("csv-parser");

function normalizeRecord(raw) {
  return {
    transactionId: raw["Transaction ID"],
    date: raw["Date"],
    customerId: raw["Customer ID"],
    customerName: raw["Customer Name"],
    phoneNumber: raw["Phone Number"],
    gender: raw["Gender"],
    age: raw["Age"] ? Number(raw["Age"]) : null,
    customerRegion: raw["Customer Region"],
    customerType: raw["Customer Type"],
    productId: raw["Product ID"],
    productName: raw["Product Name"],
    brand: raw["Brand"],
    productCategory: raw["Product Category"],
    tags: raw["Tags"] ? (typeof raw["Tags"] === 'string' ? raw["Tags"].split(",").map((t) => t.trim()) : raw["Tags"]) : [],
    quantity: raw["Quantity"] ? Number(raw["Quantity"]) : 0,
    pricePerUnit: raw["Price per Unit"] ? Number(raw["Price per Unit"]) : 0,
    discountPercentage: raw["Discount Percentage"] ? Number(raw["Discount Percentage"]) : 0,
    totalAmount: raw["Total Amount"] ? Number(String(raw["Total Amount"]).replace(/[,₹ ]/g, "")) : 0,
    finalAmount: raw["Final Amount"] ? Number(String(raw["Final Amount"]).replace(/[,₹ ]/g, "")) : 0,
    paymentMethod: raw["Payment Method"],
    orderStatus: raw["Order Status"],
    deliveryType: raw["Delivery Type"],
    storeId: raw["Store ID"],
    storeLocation: raw["Store Location"],
    salespersonId: raw["Salesperson ID"],
    employeeName: raw["Employee Name"],
  };
}

function loadSalesData(csvPath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (data) => {
        results.push(normalizeRecord(data));
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

module.exports = { loadSalesData };
