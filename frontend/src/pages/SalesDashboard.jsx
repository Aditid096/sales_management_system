import { useEffect, useState } from "react";
import { fetchSales } from "../services/api";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import StatsCards from "../components/StatsCards";
import TransactionsTable from "../components/TransactionsTable";
import PaginationControls from "../components/PaginationControls";

const defaultQuery = {
  searchTerm: "",
  regions: [],
  genders: [],
  ageRange: [],
  categories: [],
  tags: [],
  paymentMethods: [],
  dateFrom: "",
  dateTo: "",
  sortBy: "customerName",
  sortOrder: "asc",
  page: 1,
  limit: 10,
};

export default function SalesDashboard() {
  const [query, setQuery] = useState(defaultQuery);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchSales(query);
      setData(res.data);
      setMeta(res.meta);
      setStats(res.stats);
    } catch (err) {
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [JSON.stringify(query)]);

  const handleSearchChange = (value) => {
    setQuery((prev) => ({ ...prev, searchTerm: value, page: 1 }));
  };

  const handleFiltersChange = (partial) => {
    setQuery((prev) => ({ ...prev, ...partial, page: 1 }));
  };

  const handlePageChange = (page) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const handleSortChange = (sortBy, sortOrder) => {
    setQuery((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  return (
    <div className="p-4">
      <header className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Sales Management System</h1>
        <SearchBar value={query.searchTerm} onChange={handleSearchChange} />
      </header>

      <FilterBar query={query} onChange={handleFiltersChange} onSortChange={handleSortChange} />

      <StatsCards stats={stats} loading={loading} />

      <TransactionsTable data={data} loading={loading} />

      <PaginationControls meta={meta} onPageChange={handlePageChange} />
    </div>
  );
}
