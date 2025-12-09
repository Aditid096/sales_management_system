# TruEstate Sales Management System - Architecture

## Overview

This document outlines the architecture of the TruEstate Sales Management System, built for the SDE Intern Assignment. The system demonstrates essential software engineering capabilities with clean, maintainable, and modular architecture supporting advanced Search, Filtering, Sorting, and Pagination functionalities on 1M+ sales records.

## Backend Architecture

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (512MB free tier)
- **ODM:** Mongoose
- **Deployment:** Vercel Serverless Functions

### Core Components

**1. Entry Point (`src/index-production.js`)**
- Smart data loading with MongoDB-first, CSV fallback strategy
- Environment detection and configuration
- Graceful error handling and health monitoring
- CORS configuration for cross-origin requests

**2. Controllers (`src/controllers/salesController.js`)**
- Request validation and parameter parsing
- Query parameter sanitization
- Response formatting and error handling
- Array parameter processing for multi-select filters

**3. Services (`src/services/salesService.js`)**
- Database abstraction layer
- MongoDB aggregation pipeline construction
- Efficient filtering, sorting, and pagination logic
- Statistics calculation with database-level aggregation

**4. Models (`src/models/Sales.js`)**
- MongoDB schema definition with validation
- Performance-optimized indexes for search and filtering
- Data normalization and type enforcement
- Compound indexes for multi-field queries

**5. Database Configuration (`src/config/database.js`)**
- MongoDB Atlas connection management
- Connection pooling and error handling
- Graceful shutdown procedures
- Environment-based configuration

## Frontend Architecture

### Technology Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Deployment:** Vercel Static Site

### Component Hierarchy

**1. Application Root (`App.jsx`)**
- Main application wrapper
- Global state initialization
- Error boundary implementation

**2. Dashboard Page (`pages/SalesDashboard.jsx`)**
- Central state management for all filters, search, and pagination
- API integration and data fetching
- State synchronization across all child components
- Loading and error state handling

**3. UI Components**
- **`SearchBar.jsx`** - Customer Name and Phone Number search
- **`FilterBar.jsx`** - Multi-select filters with dropdown UI
- **`TransactionsTable.jsx`** - Data display with responsive design
- **`PaginationControls.jsx`** - Navigation with state preservation
- **`StatsCards.jsx`** - Real-time statistics display

**4. Services (`services/api.js`)**
- API endpoint abstraction
- Request/response interceptors
- Error handling and retry logic
- Environment-based URL configuration

## Data Flow

### Request Processing Pipeline

1. **User Interaction** → Frontend component state update
2. **State Synchronization** → Dashboard centralizes all query parameters
3. **API Request** → Axios service layer constructs HTTP request
4. **Backend Routing** → Express router directs to sales controller
5. **Parameter Processing** → Controller validates and parses query parameters
6. **Service Layer** → Sales service builds MongoDB aggregation pipeline
7. **Database Query** → MongoDB executes optimized queries with indexes
8. **Data Aggregation** → Database-level filtering, sorting, and pagination
9. **Statistics Calculation** → Real-time aggregation for summary statistics
10. **Response Formatting** → Structured JSON with data, metadata, and statistics
11. **Frontend Update** → React state update triggers component re-rendering

### Database Query Optimization

**MongoDB Aggregation Pipeline:**
```javascript
// Example pipeline for complex queries
[
  { $match: { customerName: { $regex: searchTerm, $options: 'i' } } },
  { $match: { customerRegion: { $in: selectedRegions } } },
  { $sort: { date: -1 } },
  { $skip: (page - 1) * limit },
  { $limit: limit },
  { $project: { /* selected fields */ } }
]
```

**Performance Features:**
- Text indexes for search operations
- Compound indexes for multi-field filtering
- Database-level pagination to minimize memory usage
- Aggregation pipelines for efficient data processing

## Folder Structure

Following the exact structure specified in the assignment requirements:

```
root/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── salesController.js         # Request handling and validation
│   │   ├── services/
│   │   │   └── salesService.js           # Business logic and database queries
│   │   ├── utils/
│   │   │   ├── csvLoader.js              # CSV fallback functionality
│   │   │   └── filterUtils.js            # Legacy filtering utilities
│   │   ├── routes/
│   │   │   └── salesRoutes.js            # API endpoint definitions
│   │   ├── models/
│   │   │   └── Sales.js                  # MongoDB schema and indexes
│   │   ├── config/
│   │   │   └── database.js               # MongoDB connection configuration
│   │   ├── scripts/
│   │   │   └── importCsvToDb.js          # Data import automation
│   │   └── index-production.js           # Entry point with smart data loading
│   ├── package.json                      # Dependencies and scripts
│   ├── .env                              # Environment configuration
│   └── truestate_assignment_dataset.csv  # Original dataset (234MB)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FilterBar.jsx             # Multi-select filtering interface
│   │   │   ├── SearchBar.jsx             # Customer Name/Phone search
│   │   │   ├── TransactionsTable.jsx     # Data display grid
│   │   │   ├── PaginationControls.jsx    # Navigation controls
│   │   │   └── StatsCards.jsx            # Summary statistics
│   │   ├── pages/
│   │   │   └── SalesDashboard.jsx        # Main dashboard with state management
│   │   ├── services/
│   │   │   └── api.js                    # HTTP client and API abstraction
│   │   ├── App.jsx                       # Application root component
│   │   ├── main.jsx                      # React application entry point
│   │   └── index.css                     # Tailwind CSS imports
│   ├── package.json                      # Frontend dependencies
│   ├── vite.config.js                    # Build tool configuration
│   └── tailwind.config.js                # Styling framework configuration
├── docs/
│   └── architecture.md                   # Technical documentation
├── README.md                             # Project documentation
├── vercel.json                           # Full-stack deployment configuration
└── package.json                          # Monorepo configuration
```

## Module Responsibilities

### Backend Modules

**Controllers Layer:**
- Handle HTTP requests and responses
- Validate and sanitize input parameters
- Parse query strings into structured data
- Format API responses with consistent structure

**Services Layer:**
- Implement business logic for data operations
- Construct optimized database queries
- Handle data aggregation and calculations
- Manage error handling and data validation

**Models Layer:**
- Define MongoDB schemas with proper validation
- Configure database indexes for performance
- Handle data normalization and transformation
- Enforce data integrity constraints

**Utils Layer:**
- Provide utility functions for data processing
- Handle CSV parsing and fallback operations
- Implement common helper functions
- Manage configuration and environment variables

### Frontend Modules

**Components Layer:**
- Implement reusable UI components
- Handle user interactions and input validation
- Manage component-level state and props
- Provide responsive and accessible interfaces

**Pages Layer:**
- Coordinate multiple components into complete views
- Manage application-level state and data flow
- Handle routing and navigation logic
- Integrate with backend APIs

**Services Layer:**
- Abstract HTTP communication with backend
- Handle request/response transformation
- Implement error handling and retry logic
- Manage API endpoint configurations

## Assignment Compliance

### Functional Requirements Implementation

**1. Search Functionality:**
- Full-text search across Customer Name and Phone Number fields
- Case-insensitive matching using MongoDB regex queries
- Performant implementation with database indexes
- Seamless integration with filtering and sorting

**2. Multi-Select Filtering:**
- Customer Region, Gender, Age Range, Product Category, Tags, Payment Method, Date Range
- Independent and combined filter operations
- State preservation across pagination and sorting
- Efficient database-level filtering using MongoDB aggregation

**3. Sorting Implementation:**
- Date (Newest First), Quantity, Customer Name (A-Z) sorting options
- Database-level sorting for optimal performance
- Complete state preservation with active filters and search
- Responsive sorting UI with clear indicators

**4. Pagination System:**
- Exactly 10 items per page as specified
- Next/Previous navigation with page metadata
- State retention across all operations
- Efficient database pagination using skip/limit

### Engineering Standards

**Code Quality:**
- Clean separation of frontend and backend responsibilities
- Modular architecture with clear boundaries
- No duplicate logic for filtering or sorting operations
- Professional coding standards with comprehensive error handling

**Performance Optimization:**
- Database indexes for fast query execution
- Aggregation pipelines for efficient data processing
- Minimal data transfer with selective field projection
- Connection pooling and resource management

**Scalability Features:**
- Database-first architecture supporting millions of records
- Serverless deployment for automatic scaling
- Efficient memory usage with streaming operations
- Stateless backend design for horizontal scaling