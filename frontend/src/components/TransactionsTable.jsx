export default function TransactionsTable({ data, loading }) {
  if (loading && !data.length) {
    return <div className="mt-4 p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!loading && data.length === 0) {
    return (
      <div className="bg-white rounded shadow p-8 text-center text-gray-500">
        <h3 className="text-lg font-medium mb-2">No transactions found</h3>
        <p className="text-sm">Try adjusting your search criteria or filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left">Transaction ID</th>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Customer ID</th>
            <th className="px-3 py-2 text-left">Customer Name</th>
            <th className="px-3 py-2 text-left">Phone Number</th>
            <th className="px-3 py-2 text-left">Gender</th>
            <th className="px-3 py-2 text-left">Age</th>
            <th className="px-3 py-2 text-left">Customer Region</th>
            <th className="px-3 py-2 text-left">Product Category</th>
            <th className="px-3 py-2 text-left">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={`${row.transactionId}-${idx}`} className="border-t hover:bg-gray-50">
              <td className="px-3 py-2">{row.transactionId}</td>
              <td className="px-3 py-2">{row.date}</td>
              <td className="px-3 py-2">{row.customerId}</td>
              <td className="px-3 py-2">{row.customerName}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span>{row.phoneNumber}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(row.phoneNumber);
                      // Optional: Add toast notification here
                    }}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    title="Copy phone number"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </td>
              <td className="px-3 py-2">{row.gender}</td>
              <td className="px-3 py-2">{row.age}</td>
              <td className="px-3 py-2">{row.customerRegion}</td>
              <td className="px-3 py-2">{row.productCategory}</td>
              <td className="px-3 py-2">{row.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
