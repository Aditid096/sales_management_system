const ciIncludes = (value, search) => {
  if (!value || !search) return false;
  return String(value).toLowerCase().includes(String(search).toLowerCase());
};

function applySearch(records, searchTerm) {
  if (!searchTerm) return records;
  return records.filter(
    (r) => ciIncludes(r.customerName, searchTerm) || ciIncludes(r.phoneNumber, searchTerm)
  );
}

function applyFilters(records, filters) {
  const { regions, genders, ageRange, categories, tags, paymentMethods, dateFrom, dateTo } = filters;

  return records.filter((r) => {
    // Multi-select Customer Region filter as per PDF
    if (regions?.length && !regions.includes(r.customerRegion)) return false;
    
    // Multi-select Gender filter as per PDF
    if (genders?.length && !genders.includes(r.gender)) return false;

    // Multi-select Age Range filter - check if record age falls into any selected range
    if (ageRange?.length) {
      const ageInAnyRange = ageRange.some(range => {
        if (range.includes("-")) {
          const [minAge, maxAge] = range.split("-").map(a => parseInt(a.trim()));
          return r.age >= minAge && r.age <= maxAge;
        } else if (range.includes("+")) {
          const minAge = parseInt(range.replace("+", "").trim());
          return r.age >= minAge;
        } else {
          const exactAge = parseInt(range);
          return r.age === exactAge;
        }
      });
      if (!ageInAnyRange) return false;
    }

    // Multi-select Product Category filter as per PDF
    if (categories?.length && !categories.includes(r.productCategory)) return false;

    // Multi-select Tags filter as per PDF
    if (tags?.length) {
      const recordTags = r.tags || [];
      const hasAnyTag = tags.some((t) => recordTags.includes(t));
      if (!hasAnyTag) return false;
    }

    // Multi-select Payment Method filter as per PDF
    if (paymentMethods?.length && !paymentMethods.includes(r.paymentMethod)) return false;

    // Date Range filter - separate from/to inputs for scalability
    if (dateFrom && r.date < dateFrom) return false;
    if (dateTo && r.date > dateTo) return false;

    return true;
  });
}

function applySort(records, sortBy, sortOrder = "asc") {
  if (!sortBy) return records;
  const dir = sortOrder === "desc" ? -1 : 1;

  const sorted = [...records].sort((a, b) => {
    let va = a[sortBy];
    let vb = b[sortBy];

    if (typeof va === "string" && typeof vb === "string") {
      return va.localeCompare(vb) * dir;
    }

    if (typeof va === "number" && typeof vb === "number") {
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    }

    return 0;
  });

  return sorted;
}

function applyPagination(records, page = 1, limit = 10) {
  const totalItems = records.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * limit;
  const end = start + limit;
  const paginated = records.slice(start, end);

  return {
    paginated,
    meta: {
      totalItems,
      totalPages,
      currentPage,
      pageSize: limit,
    },
  };
}

function computeStats(records) {
  const totalUnitsSold = records.reduce((sum, r) => sum + (r.quantity || 0), 0);
  const totalAmount = records.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const totalDiscount = records.reduce(
    (sum, r) => sum + ((r.totalAmount || 0) - (r.finalAmount || 0)),
    0
  );

  return { totalUnitsSold, totalAmount, totalDiscount };
}

module.exports = {
  applySearch,
  applyFilters,
  applySort,
  applyPagination,
  computeStats,
};
