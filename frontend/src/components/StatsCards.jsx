export default function StatsCards({ stats, loading }) {
  if (loading && !stats) {
    return <div className="my-4">Loading...</div>;
  }

  const totalUnits = stats?.totalUnitsSold || 0;
  const totalAmount = stats?.totalAmount || 0;
  const totalDiscount = stats?.totalDiscount || 0;

  const formatNumber = (num) => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + " Cr";
    if (num >= 100000) return (num / 100000).toFixed(1) + " L";
    if (num >= 1000) return (num / 1000).toFixed(1) + " K";
    return num.toString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
      <div className="bg-white rounded shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Total units sold</div>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(totalUnits)}</div>
          </div>
          <div className="p-2 bg-blue-50 rounded">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Total Amount</div>
            <div className="text-2xl font-bold text-gray-900">₹{formatNumber(totalAmount)}</div>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">Total Discount</div>
            <div className="text-2xl font-bold text-gray-900">₹{formatNumber(totalDiscount)}</div>
          </div>
          <div className="p-2 bg-orange-50 rounded">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
