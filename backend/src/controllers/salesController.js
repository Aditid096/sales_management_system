const { getSales } = require("../services/salesService");

function parseArrayParam(param) {
  if (!param) return [];
  if (Array.isArray(param)) return param;
  return String(param)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

const getSalesHandler = (req, res) => {
  try {
    const q = req.query;
    
    const queryData = {
      searchTerm: q.searchTerm || "",
      regions: parseArrayParam(q.regions),
      genders: parseArrayParam(q.genders),
      ageRange: parseArrayParam(q.ageRange),
      categories: parseArrayParam(q.categories),
      tags: parseArrayParam(q.tags),
      paymentMethods: parseArrayParam(q.paymentMethods),
      dateFrom: q.dateFrom || "",
      dateTo: q.dateTo || "",
      sortBy: q.sortBy || "customerName",
      sortOrder: q.sortOrder || "asc",
      page: q.page || 1,
      limit: q.limit || 10,
    };

    const result = getSales(req.salesData, queryData);

    res.json(result);
  } catch (err) {
    console.error("Error in getSalesHandler:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getSalesHandler };
