import { useState, useEffect } from 'react';
import axios from 'axios';
import { Receipt, X, Coffee } from 'lucide-react';

export default function FolioModal({ booking, onClose, API }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(`${API}/orders/booking/${booking._id}`);
        const orderList = Array.isArray(data) ? data : (data?.orders || []);
        setOrders(orderList);
      } catch (error) {
        console.error("Failed to fetch folio:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [booking._id, API]);

  // 1. Calculate POS Charges safely
  const safeOrders = Array.isArray(orders) ? orders : [];
  const posTotal = safeOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  // 2. Calculate Room Charges dynamically
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  // Calculate nights (minimum 1 night)
  const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
  // Fallback to manual calculation if totalRoomCharge isn't saved in the DB yet
  const roomTotal = booking.totalRoomCharge || (nights * booking.roomRate);

  // 3. Calculate Grand Total
  const grandTotal = posTotal + roomTotal;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <Receipt size={22} className="text-indigo-400" /> 
            <div>
              <h2 className="font-bold text-lg leading-tight">Room {booking.roomNumber} Folio</h2>
              <p className="text-xs text-slate-400">{booking.guestName}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-slate-700 p-1.5 rounded-lg transition-colors">
            <X size={20}/>
          </button>
        </div>

        {/* Content (Scrollable POS Orders) */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Service Details</h3>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500 font-medium">Loading charges...</div>
          ) : safeOrders.length === 0 ? (
            <div className="text-center py-12">
              <Coffee size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No service charges posted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {safeOrders.map((order, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {order.orderType || 'Room Service'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.quantity}x {item.itemName}
                        </span>
                        <span className="font-medium text-gray-800">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grand Total Footer Area */}
        <div className="bg-white border-t border-gray-200 p-6 shrink-0">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Room Charge ({nights} {nights === 1 ? 'night' : 'nights'} @ ₹{booking.roomRate})
              </span>
              <span className="font-bold text-gray-800">₹{roomTotal}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total POS Services</span>
              <span className="font-bold text-gray-800">₹{posTotal}</span>
            </div>
            
            {booking.advancePaid > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 font-medium">
                <span>Advance Paid</span>
                <span>- ₹{booking.advancePaid}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center border-t border-gray-100 pt-4">
            <span className="text-gray-800 font-bold">Grand Total:</span>
            <span className="text-2xl font-black text-indigo-700">
              ₹{grandTotal - (booking.advancePaid || 0)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}