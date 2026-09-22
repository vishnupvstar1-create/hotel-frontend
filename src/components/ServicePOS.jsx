import { useState } from 'react';
import axios from 'axios';
import { Receipt, BedDouble } from 'lucide-react';
import Toast from './Toast';
import ErrorPopup from './ErrorPopup';

const MENU_CATALOG = {
  'Food & Beverage': [
    { name: 'Club Sandwich', price: 350 },
    { name: 'Chicken Biryani', price: 450 },
    { name: 'Paneer Tikka', price: 300 },
    { name: 'Fresh Lime Soda', price: 120 },
    { name: 'Cappuccino', price: 150 }
  ],
  'Laundry': [
    { name: 'Standard Wash', price: 200 },
    { name: 'Dry Cleaning', price: 500 }
  ],
  'Spa & Wellness': [
    { name: 'Swedish Massage', price: 1500 },
    { name: 'Aroma Therapy', price: 2500 }
  ]
};

export default function ServicePOS({ bookings, API }) {
  const [order, setOrder] = useState({ 
    bookingId: '', category: 'Food & Beverage', itemName: '', quantity: 1, price: 0 
  });
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [apiError, setApiError] = useState('');

  const handleItemSelect = (e) => {
    const selectedItem = MENU_CATALOG[order.category].find(item => item.name === e.target.value);
    setOrder({ ...order, itemName: selectedItem?.name || '', price: selectedItem?.price || 0 });
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!order.bookingId || !order.itemName) return setApiError('Please select a room and an item.');

    setLoading(true);
    try {
      await axios.post(`${API}/orders`, {
        bookingId: order.bookingId,
        orderType: order.category,
        items: [{ itemName: order.itemName, quantity: order.quantity, price: order.price }],
        paymentStatus: 'Bill to Room'
      });
      setToastMsg('Charge posted to room folio successfully!');
      setOrder({ ...order, itemName: '', quantity: 1, price: 0 }); 
    } catch (error) {
      setApiError(error.response?.data?.error || "Failed to post charge.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><BedDouble size={24} /></div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Room Billing POS</h2>
          <p className="text-sm text-gray-500">Post charges directly to an in-house guest's final bill</p>
        </div>
      </div>

      <form onSubmit={submitOrder} className="space-y-6">
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <label className="block text-sm font-semibold text-indigo-900 mb-2">Charge to Room</label>
          <select required className="w-full border border-indigo-200 p-3 rounded-lg bg-white" value={order.bookingId} onChange={e => setOrder({...order, bookingId: e.target.value})}>
            <option value="">-- Select Active Guest --</option>
            {bookings.map(b => (
              <option key={b._id} value={b._id}>Room {b.roomNumber} - {b.guestName}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select className="w-full border border-gray-300 p-3 rounded-lg" value={order.category} onChange={e => setOrder({...order, category: e.target.value, itemName: '', price: 0})}>
              {Object.keys(MENU_CATALOG).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Item</label>
            <select required className="w-full border border-gray-300 p-3 rounded-lg" value={order.itemName} onChange={handleItemSelect}>
              <option value="">-- Choose Item --</option>
              {MENU_CATALOG[order.category].map(item => (
                <option key={item.name} value={item.name}>{item.name} (₹{item.price})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input type="number" min="1" className="w-full border border-gray-300 p-3 rounded-lg" value={order.quantity} onChange={e => setOrder({...order, quantity: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (₹)</label>
            <div className="w-full border border-gray-200 bg-gray-50 p-3 rounded-lg font-bold text-gray-800">
              ₹{order.price * order.quantity}
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors mt-4">
          {loading ? 'Processing...' : 'Post Charge to Room'}
        </button>
      </form>

      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
      <ErrorPopup error={apiError} onClose={() => setApiError('')} />
    </div>
  );
}