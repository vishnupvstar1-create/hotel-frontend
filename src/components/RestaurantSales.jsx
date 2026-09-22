import { useState, useEffect } from 'react';
import axios from 'axios';
import EditOrderModal from './EditOrderModal';
import Toast from './Toast'; // <-- Import Toast
import { TrendingUp, ReceiptText, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RestaurantSales({ API }) {
  const [salesHistory, setSalesHistory] = useState([]);
  const [editOrder, setEditOrder] = useState(null);
  
  // <-- Add state for Toast
  const [toastMsg, setToastMsg] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchSales = async () => {
    try {
      const { data } = await axios.get(`${API}/orders/external`);
      const orderList = Array.isArray(data) ? data : (data?.orders || []);
      setSalesHistory(orderList);
    } catch (error) {
      console.error("Failed to fetch restaurant sales:", error);
      setSalesHistory([]);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [API]);

  // Reset page when changing items per page
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const safeHistory = Array.isArray(salesHistory) ? salesHistory : [];
  
  // Today's metrics calculation
  const todayString = new Date().toLocaleDateString();
  const todaysOrders = safeHistory.filter(o => new Date(o.createdAt).toLocaleDateString() === todayString);
  const todaysRevenue = todaysOrders.reduce((sum, currentOrder) => {
    const safeItems = Array.isArray(currentOrder.items) ? currentOrder.items : [];
    const orderTotal = safeItems.reduce((itemSum, item) => itemSum + (item.price * (item.quantity || 1)), 0);
    return sum + orderTotal;
  }, 0);

  // Pagination Logic for the Table
  const totalPages = Math.ceil(safeHistory.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSales = safeHistory.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Revenue Metric Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-8 text-white shadow-md flex items-center justify-between">
        <div>
          <p className="text-emerald-100 font-medium mb-1">Today's Restaurant Sales</p>
          <h3 className="text-4xl font-black">₹{todaysRevenue.toLocaleString()}</h3>
          <p className="text-sm text-emerald-200 mt-1">{todaysOrders.length} orders completed today</p>
        </div>
        <div className="p-5 bg-white/20 rounded-full">
          <TrendingUp size={48} className="text-white" />
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <ReceiptText size={20} className="text-gray-500" />
          <h2 className="text-lg font-bold text-gray-800">Sales Ledger</h2>
        </div>
        <div className="overflow-x-auto min-h-[400px] custom-scrollbar">
        
        
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="text-gray-500 border-b border-gray-200 text-sm">
                <th className="pb-3 font-semibold">Time</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Items Sold</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentSales.length === 0 ? (
                <tr><td colSpan="6" className="py-12 text-center text-gray-400">No sales recorded.</td></tr>
              ) : (
                currentSales.map(order => {
                  const safeItems = Array.isArray(order.items) ? order.items : [];
                  const orderTotal = safeItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
                  
                  return (
                    <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString() === todayString 
                          ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 font-medium text-gray-800">{order.customerName || 'Walk-in'}</td>
                      <td className="py-4 text-sm text-gray-600">
                        {safeItems.map((item, i) => <div key={i}>{item.quantity}x {item.itemName}</div>)}
                      </td>
                      <td className="py-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                          {(order.paymentStatus || '').replace('Paid via ', '')}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-emerald-600">₹{orderTotal}</td>
                      <td className="py-4 text-right">
                        <button onClick={() => setEditOrder(order)} className="text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-semibold hover:bg-gray-200 inline-flex items-center gap-1">
                          <Edit size={16} /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-100 text-sm text-gray-600 gap-4">
          <div className="flex items-center gap-3">
            <span>Show</span>
            <select 
              className="border border-gray-300 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={25}>25</option>
              <option value={30}>30</option>
            </select>
            <span>entries ({safeHistory.length} total)</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-medium px-2">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {editOrder && (
        <EditOrderModal 
          order={editOrder} 
          API={API} 
          onClose={() => setEditOrder(null)} 
          onSuccess={() => { 
            setEditOrder(null); 
            fetchSales(); 
            setToastMsg('Order updated successfully!'); // <-- Trigger toast on success
          }} 
        />
      )}

      {/* <-- Render the Toast component */}
      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
    </div>
  );
}