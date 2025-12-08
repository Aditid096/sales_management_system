import { useState } from "react";

export default function FilterBar({ query, onChange, onSortChange }) {
  const [dropdownOpen, setDropdownOpen] = useState({});

  // Multi-select handler for arrays as per PDF requirement
  const handleMultiSelect = (field, value) => {
    const currentValues = query[field] || [];
    let newValues;
    
    if (currentValues.includes(value)) {
      // Remove if already selected
      newValues = currentValues.filter(v => v !== value);
    } else {
      // Add if not selected
      newValues = [...currentValues, value];
    }
    
    onChange({ [field]: newValues });
  };

  const handleSort = (e) => {
    const value = e.target.value;
    const [sortBy, sortOrder] = value.split("-");
    onSortChange(sortBy, sortOrder);
  };

  // Toggle dropdown visibility
  const toggleDropdown = (field) => {
    setDropdownOpen(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Multi-select dropdown component as per PDF "Multi-Select" requirement
  const MultiSelectDropdown = ({ field, label, options, selectedValues = [] }) => (
    <div className="relative">
      <button
        type="button"
        className="border border-gray-300 px-3 py-2 rounded bg-white text-left min-w-[120px] flex justify-between items-center hover:bg-gray-50"
        onClick={() => toggleDropdown(field)}
      >
        <span className="truncate text-sm">
          {selectedValues.length === 0 
            ? label 
            : selectedValues.length === 1 
            ? selectedValues[0] 
            : `${selectedValues.length} selected`
          }
        </span>
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {dropdownOpen[field] && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-20 min-w-[200px] max-h-48 overflow-y-auto">
          {options.map((option) => (
            <label key={option} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
              <input
                type="checkbox"
                className="mr-2 rounded"
                checked={selectedValues.includes(option)}
                onChange={() => handleMultiSelect(field, option)}
              />
              <span>{option}</span>
            </label>
          ))}
          {selectedValues.length > 0 && (
            <>
              <hr className="my-1" />
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={() => onChange({ [field]: [] })}
              >
                Clear All
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  // Close dropdowns when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.relative')) {
      setDropdownOpen({});
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4" onClick={handleClickOutside}>
      <div className="flex flex-wrap gap-4 items-center">
        {/* Refresh Button */}
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          onClick={() => {
            onChange({
              searchTerm: "",
              regions: [],
              genders: [],
              ageRange: [],
              categories: [],
              tags: [],
              paymentMethods: [],
              dateFrom: "",
              dateTo: "",
              page: 1
            });
            onSortChange("customerName", "asc");
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>

        {/* Customer Region - Multi-select as per PDF */}
        <MultiSelectDropdown
          field="regions"
          label="Customer Region"
          options={["North", "South", "East", "West", "Central"]}
          selectedValues={query.regions}
        />

        {/* Gender - Multi-select as per PDF */}
        <MultiSelectDropdown
          field="genders"
          label="Gender"
          options={["Male", "Female"]}
          selectedValues={query.genders}
        />

        {/* Age Range - Multi-select as requested */}
        <MultiSelectDropdown
          field="ageRange"
          label="Age Range"
          options={["18-25", "26-35", "36-45", "46-55", "56-65", "65+"]}
          selectedValues={query.ageRange}
        />

        {/* Product Category - Multi-select as per PDF */}
        <MultiSelectDropdown
          field="categories"
          label="Product Category"
          options={["Beauty", "Electronics", "Clothing"]}
          selectedValues={query.categories}
        />

        {/* Tags - Multi-select as per PDF */}
        <MultiSelectDropdown
          field="tags"
          label="Tags"
          options={["organic", "skincare", "portable", "wireless", "gadgets", "casual", "fashion", "unisex", "cotton", "formal"]}
          selectedValues={query.tags}
        />

        {/* Payment Method - Multi-select as per PDF */}
        <MultiSelectDropdown
          field="paymentMethods"
          label="Payment Method"
          options={["UPI", "Credit Card", "Debit Card", "Cash", "Wallet"]}
          selectedValues={query.paymentMethods}
        />

        {/* Date Range - Flexible inputs for scalability */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Date Range</span>
          <input
            type="date"
            className="border border-gray-300 px-2 py-2 rounded text-sm"
            placeholder="From Date"
            value={query.dateFrom || ""}
            onChange={(e) => onChange({ dateFrom: e.target.value })}
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            className="border border-gray-300 px-2 py-2 rounded text-sm"
            placeholder="To Date"
            value={query.dateTo || ""}
            onChange={(e) => onChange({ dateTo: e.target.value })}
          />
        </div>

        {/* Sort dropdown - as per PDF */}
        <select 
          className="border border-gray-300 px-3 py-2 rounded bg-white ml-auto text-sm" 
          onChange={handleSort}
          defaultValue="customerName-asc"
        >
          <option value="customerName-asc">Sort by: Customer Name (A-Z)</option>
          <option value="customerName-desc">Customer Name (Z-A)</option>
          <option value="date-desc">Date (Newest)</option>
          <option value="date-asc">Date (Oldest)</option>
          <option value="quantity-desc">Quantity (High-Low)</option>
          <option value="quantity-asc">Quantity (Low-High)</option>
        </select>
      </div>
    </div>
  );
}
