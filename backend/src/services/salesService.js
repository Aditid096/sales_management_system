const {
  applySearch,
  applyFilters,
  applySort,
  applyPagination,
  computeStats,
} = require("../utils/filterUtils");

function getSales(records, query) {
  const {
    searchTerm,
    regions,
    genders,
    ageRange,
    categories,
    tags,
    paymentMethods,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    page,
    limit,
  } = query;

  const filters = {
    regions,
    genders,
    ageRange,
    categories,
    tags,
    paymentMethods,
    dateFrom,
    dateTo,
  };

  let filtered = records;
  filtered = applySearch(filtered, searchTerm);
  filtered = applyFilters(filtered, filters);

  const stats = computeStats(filtered);

  const sorted = applySort(filtered, sortBy, sortOrder || "desc");

  const pg = applyPagination(
    sorted,
    page != null ? Number(page) : 1,
    limit != null ? Number(limit) : 10
  );

  return {
    data: pg.paginated,
    meta: pg.meta,
    stats,
  };
}

module.exports = { getSales };
