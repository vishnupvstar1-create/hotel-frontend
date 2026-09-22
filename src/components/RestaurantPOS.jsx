import { useState } from 'react';
import axios from 'axios';
import { Store } from 'lucide-react';
import Toast from './Toast';            
import ErrorPopup from './ErrorPopup';

const RESTAURANT_MENU = [
  { name: 'Club Sandwich', price: 350 },
  { name: 'Chicken Biryani', price: 450 },
  { name: 'Paneer Tikka', price: 300 },
  { name: 'Fresh Lime Soda', price: 120 },
  { name: 'Cappuccino', price: 150 },
  { name: 'Buffet Breakfast', price: 800 },
  { name: 'Grilled Salmon', price: 1200 }
];

export default function RestaurantPOS({ API }) {
  const [order, setOrder] = useState({ 
    customerName: '', itemName: '', quantity: 1, price: 0, paymentMethod: 'Card' 
  });
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [apiError, setApiError] = useState('');

  const handleItemSelect = (e) => {
    const selectedItem = RESTAURANT_MENU.find(item => item.name === e.target.value);
    setOrder({ ...order, itemName: selectedItem?.name || '', price: selectedItem?.price || 0 });
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!order.itemName) return setApiError('Please select an item.');

    setLoading(true);
    try {
      await axios.post(`${API}/orders`, {
        orderType: 'External Restaurant',
        items: [{ itemName: order.itemName, quantity: order.quantity, price: order.price }],
        paymentStatus: `Paid via ${order.paymentMethod}`,
        customerName: order.customerName || 'Walk-in Customer'
      });
      
      setToastMsg('Payment received and order confirmed!');
      setOrder({ customerName: '', itemName: '', quantity: 1, price: 0, paymentMethod: 'Card' });
    } catch (error) {
      setApiError(error.response?.data?.error || "Failed to process external order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
          <Store size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Restaurant POS</h2>
          <p className="text-sm text-gray-500">Process instant payments for external guests</p>
        </div>
      </div>

      <form onSubmit={submitOrder} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name (Optional)</label>
            <input type="text" placeholder="Walk-in Guest" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" value={order.customerName} onChange={e => setOrder({...order, customerName: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Item</label>
            <select required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white" value={order.itemName} onChange={handleItemSelect}>
              <option value="">-- Choose Food/Beverage --</option>
              {RESTAURANT_MENU.map(item => (
                <option key={item.name} value={item.name}>{item.name} (₹{item.price})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input type="number" min="1" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" value={order.quantity} onChange={e => setOrder({...order, quantity: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white" value={order.paymentMethod} onChange={e => setOrder({...order, paymentMethod: e.target.value})}>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-md">
            {loading ? 'Processing...' : `Collect ₹${order.price * order.quantity}`}
          </button>
        </div>
      </form>

      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
      <ErrorPopup error={apiError} onClose={() => setApiError('')} />
    </div>
  );
}