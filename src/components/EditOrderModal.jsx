import { useState } from 'react';
import axios from 'axios';
import { Edit, X, Trash2, Plus } from 'lucide-react';

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
  // Global Order Info
  const [customerName, setCustomerName] = useState(order.customerName || '');
  const [paymentMethod, setPaymentMethod] = useState((order.paymentStatus || '').replace('Paid via ', '') || 'Card');
  
  // Cart State (Initialized with existing items)
  const [cart, setCart] = useState(Array.isArray(order.items) ? order.items : []);
  
  // Item Selection State for adding new things
  const [currentItem, setCurrentItem] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate Grand Total
  const grandTotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!currentItem) return;

    const menuItem = RESTAURANT_MENU.find(item => item.name === currentItem);
    const existingItemIndex = cart.findIndex(item => item.itemName === menuItem.name);
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += currentQuantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, { itemName: menuItem.name, price: menuItem.price, quantity: currentQuantity }]);
    }

    setCurrentItem('');
    setCurrentQuantity(1);
  };

  const handleRemoveItem = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError("An order must have at least one item.");
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API}/orders/${order._id}`, {
        customerName,
        paymentStatus: `Paid via ${paymentMethod}`,
        items: cart,
        totalAmount: grandTotal
      });
      onSuccess();
    } catch (err) {
      setError("Failed to update order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-5 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            <Edit size={20} /> <h2 className="font-bold text-lg">Edit Order #{order._id.slice(-6)}</h2>
          </div>
          <button onClick={onClose} className="hover:bg-slate-700 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{error}</div>}

          {/* Customer & Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Add Item Form */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Items to Order</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select className="flex-1 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white" value={currentItem} onChange={e => setCurrentItem(e.target.value)}>
                <option value="">-- Choose Menu Item --</option>
                {RESTAURANT_MENU.map(item => (
                  <option key={item.name} value={item.name}>{item.name} (₹{item.price})</option>
                ))}
              </select>
              <div className="flex gap-3">
                <input type="number" min="1" className="w-20 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={currentQuantity} onChange={e => setCurrentQuantity(Number(e.target.value))} />
                <button type="button" onClick={handleAddItem} className="bg-slate-900 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-slate-800 flex items-center gap-1">
                  <Plus size={18} /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Cart List */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-100 p-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-700 text-sm">Order Items</h3>
            </div>
            {cart.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">Cart is empty</div>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {cart.map((item, index) => (
                  <li key={index} className="p-3 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.itemName}</p>
                      <p className="text-xs text-gray-500">₹{item.price} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-emerald-600 text-sm">₹{item.price * item.quantity}</span>
                      <button onClick={() => handleRemoveItem(index)} type="button" className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
          <div className="text-gray-500 text-sm">
            Total: <span className="font-bold text-gray-900 text-lg ml-1">₹{grandTotal}</span>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={submitEdit} disabled={loading || cart.length === 0} className="px-6 py-2.5 rounded-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}