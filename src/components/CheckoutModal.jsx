import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, X } from 'lucide-react';
import Toast from './Toast';
import ErrorPopup from './ErrorPopup';

export default function CheckoutModal({ bookingId, onClose, onSuccess, API }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const { data } = await axios.get(`${API}/bookings/${bookingId}/checkout`);
        setInvoice(data);
      } catch (error) {
        console.error("Error fetching bill:", error);
        setApiError(error.response?.data?.error || "Could not load invoice details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [bookingId, API]);

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      await axios.put(`${API}/bookings/${bookingId}/checkout`);
      setToastMsg("Checkout processed successfully!");
      setTimeout(() => {
        onSuccess();
      }, 1500); // Allow time for toast to be seen
    } catch (error) {
      console.error("Checkout failed:", error);
      setApiError(error.response?.data?.error || "Failed to process checkout.");
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl font-medium">Calculating Final Bill...</div>
    </div>
  );

  // If the invoice fails to load completely, only show the Error Popup (which handles its own background overlay)
  if (!invoice) return <ErrorPopup error={apiError} onClose={onClose} />;

  const { booking, bill } = invoice;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <FileText size={20} />
            <h2 className="text-xl font-bold">Checkout Invoice</h2>
          </div>
          <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Guest Details */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg">{booking.guestName}</h3>
          <p className="text-gray-500 text-sm">Room {booking.roomNumber} ({booking.roomType})</p>
          <div className="flex justify-between mt-4 text-sm">
            <div>
              <span className="text-gray-400 block">Check-In</span>
              <span className="font-medium">{new Date(booking.checkInDate).toLocaleDateString()}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-400 block">Check-Out</span>
              <span className="font-medium">{new Date(booking.checkOutDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="p-6 bg-gray-50 space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Total Room Charges</span>
            <span>₹{bill.totalRoomCharge}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Room Service & Dining</span>
            <span>₹{bill.totalOrderCharges}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800 pt-3 border-t border-gray-200">
            <span>Gross Total</span>
            <span>₹{bill.totalRoomCharge + bill.totalOrderCharges}</span>
          </div>
          <div className="flex justify-between text-green-600 font-medium pt-1">
            <span>Advance Paid</span>
            <span>- ₹{bill.advancePaid}</span>
          </div>
        </div>

        {/* Final Balance & Action */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Balance Due</span>
            <span className="text-3xl font-bold text-indigo-600">₹{bill.remainingBalance}</span>
          </div>
          <button 
            onClick={handleCheckout} 
            disabled={processing}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
          >
            {processing ? 'Processing...' : 'Confirm Payment & Check Out'}
          </button>
        </div>

        <Toast message={toastMsg} onClose={() => setToastMsg('')} />
        <ErrorPopup error={apiError} onClose={() => setApiError('')} />
      </div>
    </div>
  );
}