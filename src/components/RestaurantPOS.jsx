import { useState } from 'react';
import axios from 'axios';
import { Store, Trash2, Plus } from 'lucide-react';
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
  // Global Order Info
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  
  // Cart State
  const [cart, setCart] = useState([]);
  
  // Current Item Selection State
  const [currentItem, setCurrentItem] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [apiError, setApiError] = useState('');

  // Calculate Grand Total
  const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!currentItem) return setApiError('Please select an item to add.');

    const menuItem = RESTAURANT_MENU.find(item => item.name === currentItem);
    
    // Check if item already exists in cart to update quantity instead of duplicating
    const existingItemIndex = cart.findIndex(item => item.itemName === menuItem.name);
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += currentQuantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, { itemName: menuItem.name, price: menuItem.price, quantity: currentQuantity }]);
    }

    // Reset selection inputs
    setCurrentItem('');
    setCurrentQuantity(1);
  };

  const handleRemoveItem = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const submitOrder = async () => {
    if (cart.length === 0) return setApiError('Please add at least one item to the order.');

    setLoading(true);
    try {
      await axios.post(`${API}/orders`, {
        orderType: 'External Restaurant',
        items: cart, // Sending the full array of items
        paymentStatus: `Paid via ${paymentMethod}`,
        customerName: customerName || 'Walk-in Customer',
        totalAmount: grandTotal // Good practice to send the total to the backend
      });
      
      setToastMsg('Payment received and order confirmed!');
      
      // Reset form completely
      setCart([]);
      setCustomerName('');
      setPaymentMethod('Card');
    } catch (error) {
      setApiError(error.response?.data?.error || "Failed to process external order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
          <Store size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Restaurant POS</h2>
          <p className="text-sm text-gray-500">Process multi-item orders for external guests</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Top: Customer & Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name (Optional)</label>
            <input 
              type="text" 
              placeholder="Walk-in Guest" 
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white" 
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select 
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white" 
              value={paymentMethod} 
              onChange={e => setPaymentMethod(e.target.value)}
            >
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>

        {/* Middle: Item Selection Form */}
        <form onSubmit={handleAddItem} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Menu Item</label>
            <select 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white" 
              value={currentItem} 
              onChange={e => setCurrentItem(e.target.value)}
            >
              <option value="">-- Choose Food/Beverage --</option>
              {RESTAURANT_MENU.map(item => (
                <option key={item.name} value={item.name}>{item.name} (₹{item.price})</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-32">
            <label className="block text-sm font-medium text-gray-700 mb-2">Qty</label>
            <input 
              type="number" 
              min="1" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
              value={currentQuantity} 
              onChange={e => setCurrentQuantity(Number(e.target.value))} 
            />
          </div>

          <button 
            type="submit" 
            className="w-full md:w-auto bg-gray-900 text-white p-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add
          </button>
        </form>

        {/* Bottom: Cart Summary */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Current Order ({cart.length} items)</h3>
          </div>
          
          {cart.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No items added to the order yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {cart.map((item, index) => (
                <li key={index} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-bold text-gray-800">{item.itemName}</p>
                    <p className="text-sm text-gray-500">₹{item.price} × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-emerald-600">₹{item.price * item.quantity}</span>
                    <button 
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Checkout Button */}
        <div className="pt-4">
          <button 
            onClick={submitOrder}
            disabled={loading || cart.length === 0} 
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-between px-6"
          >
            <span>{loading ? 'Processing...' : 'Charge Payment'}</span>
            <span>₹{grandTotal}</span>
          </button>
        </div>
      </div>

      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
      <ErrorPopup error={apiError} onClose={() => setApiError('')} />
    </div>
  );
}