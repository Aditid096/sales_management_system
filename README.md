# TruEstate Sales Management System

A production-ready Retail Sales Management System demonstrating essential software engineering capabilities across both frontend and backend components. Built for the TruEstate SDE Intern Assignment, supporting advanced Search, Filtering, Sorting, and Pagination functionalities based on the provided dataset specifications.

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Axios  
**Backend:** Node.js, Express.js, Mongoose  
**Database:** MongoDB Atlas (512MB free tier)  
**Deployment:** Vercel (Full-stack serverless deployment)  
**Data Processing:** MongoDB aggregation pipelines with indexed queries

## Search Implementation Summary

Implements case-insensitive full-text search across Customer Name and Phone Number fields as specified in assignment requirements. Uses MongoDB text indexes and regex queries for optimal performance on 1M+ records. Search is accurate, performant, and works alongside filters and sorting with complete state preservation.

## Filter Implementation Summary

Multi-select filtering system supporting all assignment-required fields:
- **Customer Region:** Multi-select dropdown (North, South, East, West, Central)
- **Gender:** Multi-select options (Male, Female)
- **Age Range:** Predefined range selection (18-25, 26-35, 36-45, 46-55, 56+)
- **Product Category:** Multi-select categories from dataset
- **Tags:** Multi-select product tags
- **Payment Method:** Multi-select payment options (UPI, Credit Card, Debit Card, Cash, Net Banking, Wallet)
- **Date Range:** From/To date inputs with validation

Filters work independently, in combination, and maintain state alongside sorting and search as specified.

## Sorting Implementation Summary

Implements sorting for all assignment-required fields:
- **Date (Newest First):** Primary sorting option as specified
- **Quantity:** High-to-Low and Low-to-High options
- **Customer Name (A-Z):** Alphabetical sorting with reverse option

Sorting preserves active search and filters, implemented at database level using MongoDB sort operations for optimal performance on large datasets.

## Pagination Implementation Summary

Implements pagination exactly as specified in assignment requirements:
- **Page size:** 10 items per page (as required)
- **Navigation:** Next/Previous buttons with page numbers
- **State retention:** Maintains active search, filter, and sort states across page changes
- **Database-level:** Uses MongoDB skip/limit for efficient pagination on 1M+ records
- **Metadata display:** Shows current page, total pages, and total items count

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (free tier)

### Local Development
1. **Clone repository:**
   ```bash
   git clone https://github.com/Aditid096/sales_management_system.git
   cd sales_management_system
   ```

2. **Backend setup:**
   ```bash
   cd backend
   npm install
   ```

3. **Environment configuration:**
   ```bash
   # Create backend/.env
   MONGODB_URI=your_mongodb_atlas_connection_string
   NODE_ENV=development
   PORT=4000
   ```

4. **Import dataset to MongoDB:**
   ```bash
   npm run import-data
   ```

5. **Start backend:**
   ```bash
   npm start
   ```

6. **Frontend setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. **Access application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000/api/sales

### Production Deployment
Live application: https://salesmanagementsystem-pied.vercel.app