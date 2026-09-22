import { useState } from 'react';
import axios from 'axios';
import { Edit, X } from 'lucide-react';

const RESTAURANT_MENU = [
  { name: 'Club Sandwich', price: 350 },
  { name: 'Chicken Biryani', price: 450 },
  { name: 'Paneer Tikka', price: 300 },
  { name: 'Fresh Lime Soda', price: 120 },
  { name: 'Cappuccino', price: 150 },
  { name: 'Buffet Breakfast', price: 800 },
  { name: 'Grilled Salmon', price: 1200 }
];

export default function EditOrderModal({ order, onClose, onSuccess, API }) {
  // Extract the first item (since our POS creates 1 item per order)
  const currentItem = order.items[0] || { itemName: '', quantity: 1, price: 0 };
  const currentMethod = order.paymentStatus.replace('Paid via ', '');

  const [form, setForm] = useState({
    customerName: order.customerName || '',
    itemName: currentItem.itemName,
    quantity: currentItem.quantity,
    price: currentItem.price,
    paymentMethod: currentMethod
  });
  const [loading, setLoading] = useState(false);

  const handleItemSelect = (e) => {
    const selectedItem = RESTAURANT_MENU.find(item => item.name === e.target.value);
    setForm({ ...form, itemName: selectedItem?.name || '', price: selectedItem?.price || 0 });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API}/orders/${order._id}`, {
        customerName: form.customerName,
        paymentStatus: `Paid via ${form.paymentMethod}`,
        items: [{ itemName: form.itemName, quantity: form.quantity, price: form.price }]
      });
      onSuccess();
    } catch (error) {
      alert("Failed to update order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 p-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Edit size={20} /> <h2 className="font-bold text-lg">Edit Order</h2>
          </div>
          <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded"><X size={20}/></button>
        </div>

        <form onSubmit={submitEdit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
            <select className="w-full border border-gray-300 p-2.5 rounded-lg" value={form.itemName} onChange={handleItemSelect}>
              {RESTAURANT_MENU.map(item => (
                <option key={item.name} value={item.name}>{item.name} (₹{item.price})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" min="1" className="w-full border border-gray-300 p-2.5 rounded-lg" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
              <select className="w-full border border-gray-300 p-2.5 rounded-lg" value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})}>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 mt-2">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}