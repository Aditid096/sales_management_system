# Retail Sales Management System – Architecture

## 1. System Overview
The Retail Sales Management System is a small full-stack application that allows users to explore sales transactions using search, filtering, sorting, and pagination.  
The backend loads sales records from a CSV file into memory and exposes a REST API.  
The frontend is a single-page React application that consumes this API and renders the “Sales Management System” screen with filters, summary statistics, and a transaction table.

---

## 2. High-Level Architecture

**Key components:**

- **Backend (API layer)**
  - Loads the CSV dataset once on startup.
  - Applies search, filters, sorting, and pagination to in-memory data.
  - Exposes a single main endpoint: `GET /api/sales`.

- **Frontend (UI layer)**
  - Manages the current query state (search term, filters, sort options, page).
  - Calls the backend API whenever the query state changes.
  - Renders summary stats and the paginated transaction table based on the API response.

**Data Flow (request/response):**

1. User interacts with search bar, filters, sorting dropdown, or pagination controls.  
2. Frontend builds a query object and sends it to `GET /api/sales` as URL query parameters.  
3. Backend reads the in-memory sales array, applies search → filters → sort → pagination, and computes summary stats.  
4. Backend returns `{ data, meta, stats }` JSON.  
5. Frontend updates the table, pagination controls, and statistics cards with the new data.

---

## 3. Backend Architecture

### 3.1 Folder Structure

```text
backend/
└── src/
    ├── index.js
    ├── routes/
    │   └── salesRoutes.js
    ├── controllers/
    │   └── salesController.js
    ├── services/
    │   └── salesService.js
    └── utils/
        ├── csvLoader.js
        └── filterUtils.js
```

### 3.2 Responsibilities by Layer

- **`index.js` (Application entry)**
  - Reads the CSV dataset from disk using `csvLoader`.  
  - Normalizes each row into a consistent JavaScript object.  
  - Stores the full array of records in memory.  
  - Attaches the records to each request via middleware.  
  - Registers the `/api/sales` route and starts the Express server.

- **`routes/salesRoutes.js` (Routing)**
  - Defines `GET /api/sales`.  
  - Connects this route to the `salesController.getSalesHandler` function.

- **`controllers/salesController.js` (Controller layer)**
  - Parses query parameters from the HTTP request.  
  - Normalizes array-type parameters (e.g., `regions`, `genders`, `categories`, `paymentMethods`, `tags`).  
  - Provides default values for sort and pagination (e.g., `sortBy`, `sortOrder`, `page`, `limit`).  
  - Calls the service layer with the normalized query.  
  - Sends JSON responses or errors back to the client.

- **`services/salesService.js` (Business logic)**
  - Implements the core pipeline to transform the dataset:
    1. `applySearch` – filter by customer name/phone.  
    2. `applyFilters` – apply all selected filters.  
    3. `computeStats` – calculate totals for the filtered results.  
    4. `applySort` – sort the filtered list.  
    5. `applyPagination` – slice the sorted list for the current page.  
  - Returns `{ data, meta, stats }` to the controller.

- **`utils/csvLoader.js` (CSV loading and normalization)**
  - Uses `csv-parser` to read `truestate_assignment_dataset.csv`.  
  - Converts the original CSV headers into camelCase keys.  
  - Ensures numeric fields (age, quantity, discount, amounts) are parsed as numbers.

- **`utils/filterUtils.js` (Search, filter, sort, pagination helpers)**
  - `applySearch(records, searchTerm)`  
    - Case-insensitive substring match on `customerName` and `phoneNumber`.  
  - `applyFilters(records, filters)`  
    - Applies all active filters (region, gender, age range, category, tags, payment method, date range) in one pass.  
  - `applySort(records, sortBy, sortOrder)`  
    - Sorts by fields like `date`, `customerName`, or `quantity`.  
  - `applyPagination(records, page, limit)`  
    - Returns a slice plus pagination metadata.  
  - `computeStats(records)`  
    - Computes total units sold, total amount, and total discount for the currently filtered set.

### 3.3 Data Model (Normalized Sales Record)

```js
{
  transactionId: string,
  date: string,                // "YYYY-MM-DD"
  customerId: string,
  customerName: string,
  phoneNumber: string,
  gender: string,
  age: number | null,
  customerRegion: string,
  customerType: string,
  productId: string,
  productName: string,
  brand: string,
  productCategory: string,
  tags: string[],
  quantity: number,
  pricePerUnit: number,
  discountPercentage: number,
  totalAmount: number,
  finalAmount: number,
  paymentMethod: string,
  orderStatus: string,
  deliveryType: string,
  storeId: string,
  storeLocation: string,
  salespersonId: string,
  employeeName: string
}
```

---

## 4. Frontend Architecture

### 4.1 Folder Structure

```text
frontend/
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── pages/
    │   └── SalesDashboard.jsx
    ├── components/
    │   ├── SearchBar.jsx
    │   ├── FilterBar.jsx
    │   ├── StatsCards.jsx
    │   ├── TransactionsTable.jsx
    │   └── PaginationControls.jsx
    └── services/
        └── api.js
```

### 4.2 Responsibilities

- **`App.jsx`**  
  - Root component that renders the `SalesDashboard` page.

- **`pages/SalesDashboard.jsx`**  
  - Central container for the Sales Management System screen.  
  - Holds the current query state (search term, filters, sort options, `page`, and `limit`).  
  - Calls `fetchSales` from `services/api.js` whenever the query state changes.  
  - Passes data and callbacks down to child components.

- **`components/SearchBar.jsx`**  
  - Text input for searching by customer name or phone number.  
  - Updates `searchTerm` in the parent state.

- **`components/FilterBar.jsx`**  
  - Renders filter controls for Customer Region, Gender, Age Range, Product Category, Payment Method, and Date From/To.  
  - Calls `onChange` (for filters) or `onSortChange` (for sorting).  
  - Resets the page to `1` when filters or sort change.

- **`components/StatsCards.jsx`**  
  - Displays summary metrics returned by the backend: total units sold, total amount, and total discount.  
  - Updates whenever the backend response changes.

- **`components/TransactionsTable.jsx`**  
  - Renders the paginated list of sales records as a table.  
  - Shows loading and “no results found” states as needed.

- **`components/PaginationControls.jsx`**  
  - Uses `meta.currentPage` and `meta.totalPages` from the backend response.  
  - Renders page buttons and previous/next controls.  
  - Calls `onPageChange(newPage)` from `SalesDashboard`.

- **`services/api.js`**  
  - Wraps Axios with a base URL pointing to the backend (`http://localhost:4000/api`).  
  - Exposes a `fetchSales(params)` function that sends all query parameters to `GET /sales`.

---

## 5. API Contract

### Endpoint

`GET /api/sales`

### Query Parameters

- `searchTerm` – free-text search on customer name and phone number.  
- `regions[]` or `regions` – one or more customer regions.  
- `genders[]` or `genders` – one or more genders.  
- `ageMin`, `ageMax` – numeric age bounds.  
- `categories[]` or `categories` – product categories.  
- `tags[]` or `tags` – tags associated with the sale.  
- `paymentMethods[]` or `paymentMethods` – payment methods.  
- `dateFrom`, `dateTo` – inclusive date range (YYYY-MM-DD).  
- `sortBy` – field name (`date`, `customerName`, `quantity`, etc.).  
- `sortOrder` – `asc` or `desc`.  
- `page` – page number (1-based).  
- `limit` – number of records per page.

### Response Format

```json
{
  "data": [],
  "meta": {
    "totalItems": 0,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 10
  },
  "stats": {
    "totalUnitsSold": 0,
    "totalAmount": 0,
    "totalDiscount": 0
  }
}
```

---

## 6. Edge Cases and Error Handling

- **No results:**  
  - If search/filters result in an empty list, `data` is `[]` and `meta.totalItems = 0`.  
  - The frontend shows a friendly “No results found” message.

- **Invalid numeric ranges (age):**  
  - Age filters are treated as optional; missing values are ignored.  
  - Values are converted to numbers; non-numeric values are ignored.

- **Date range:**  
  - If only `dateFrom` is provided, results must be on or after that date.  
  - If only `dateTo` is provided, results must be on or before that date.  
  - If both are provided, records must fall within the inclusive range.

- **Server errors:**  
  - Unexpected errors in the controller return HTTP 500 with a simple JSON error message.  
  - CSV loading errors on startup cause the server to log the error and exit.

---

## 7. Extensibility

- The CSV loader can be replaced with a database (e.g., PostgreSQL) while keeping the controller and service layers largely unchanged.  
- Additional filters (e.g., Store Location, Employee Name) can be added by extending `applyFilters` and exposing new UI controls.  
- New summary stats (e.g., average discount, average order value) can be computed in `computeStats` and displayed in `StatsCards`.  
- The same API can be consumed by multiple frontends, such as an admin dashboard or reporting tool.
