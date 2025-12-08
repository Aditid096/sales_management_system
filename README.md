# TruEstate Sales Management System

A comprehensive retail sales management system built with React and Node.js, featuring advanced search, filtering, sorting, and pagination capabilities for handling large-scale sales data.

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Axios  
**Backend:** Node.js, Express.js, csv-parser, CORS

## Search Implementation Summary

Implements case-insensitive full-text search across Customer Name and Phone Number fields. Search functionality works seamlessly alongside all filters and sorting options, maintaining query state across pagination.

## Filter Implementation Summary

**Multi-select filters** with checkbox-based dropdown UI for:
- Customer Region (North, South, East, West, Central)
- Gender (Male, Female) 
- Product Category (Beauty, Electronics, Clothing, Home & Garden, Sports, Books)
- Tags (organic, skincare, portable, wireless, gadgets, casual, fashion, unisex, ergonomic, gaming, fitness, outdoor)
- Payment Method (UPI, Credit Card, Debit Card, Cash, Net Banking)

**Range filters** for Age (min/max) and Date ranges. All filters work independently and in combination, with active filter visualization and individual removal capabilities.

## Sorting Implementation Summary

Sorting options include:
- Date (Newest/Oldest First) - Default: Newest First
- Customer Name (A-Z/Z-A)  
- Quantity (High-Low/Low-High)

All sorting preserves active search and filter states across pagination.

## Pagination Implementation Summary

Page size: 10 items per page with Next/Previous navigation. Pagination maintains all active search, filter, and sort states. Displays current page metadata and total results count.

## Setup Instructions

1. **Clone and install dependencies:**
   ```bash
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies  
   cd ../frontend && npm install
   ```

2. **Ensure dataset is in place:**
   - Place `truestate_assignment_dataset.csv` in the `backend/` directory

3. **Start the application:**
   ```bash
   # Terminal 1: Start backend server (port 4000)
   cd backend && npm start
   
   # Terminal 2: Start frontend dev server (port 5173)
   cd frontend && npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000/api/sales