import { useState } from 'react';
import axios from 'axios';
import { Edit, X } from 'lucide-react';
import Toast from './Toast';
import ErrorPopup from './ErrorPopup';

export default function EditBookingModal({ booking, onClose, onSuccess, API }) {
  const formatDate = (dateString) => new Date(dateString).toISOString().split('T')[0];

  const [form, setForm] = useState({
    guestName: booking.guestName,
    phone: booking.phone,
    email: booking.email || '', 
    checkInDate: formatDate(booking.checkInDate),
    checkOutDate: formatDate(booking.checkOutDate),
    advancePaid: booking.advancePaid
  });
  
  const [errors, setErrors] = useState({ phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [apiError, setApiError] = useState('');

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setForm({ ...form, phone: val });
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (val && !phoneRegex.test(val)) {
      setErrors(prev => ({ ...prev, phone: 'Must be 10 to 15 digits' }));
    } else {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setForm({ ...form, email: val });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val && !emailRegex.test(val)) {
      setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (errors.phone || errors.email) return;

    setLoading(true);
    try {
      await axios.put(`${API}/bookings/${booking._id}`, form);
      setToastMsg("Booking updated successfully!");
      setTimeout(() => {
        onSuccess();
      }, 1500); // Give the user 1.5 seconds to see the toast before closing
    } catch (error) {
      setApiError(error.response?.data?.error || "Failed to update booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || errors.phone !== '' || errors.email !== '';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
        <div className="bg-slate-900 p-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Edit size={20} /> <h2 className="font-bold text-lg">Edit Guest Details</h2>
          </div>
          <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded"><X size={20}/></button>
        </div>

        <form onSubmit={submitEdit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
            <input required type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500" value={form.guestName} onChange={e => setForm({...form, guestName: e.target.value})} />
          </div>
          
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input required type="tel" className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:outline-none ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`} value={form.phone} onChange={handlePhoneChange} />
              {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:outline-none ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`} value={form.email} onChange={handleEmailChange} />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-In</label>
              <input required type="date" className="w-full border border-gray-300 p-2.5 rounded-lg" value={form.checkInDate} onChange={e => setForm({...form, checkInDate: e.target.value})} />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out</label>
              <input required type="date" className="w-full border border-gray-300 p-2.5 rounded-lg" value={form.checkOutDate} onChange={e => setForm({...form, checkOutDate: e.target.value})} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Advance Paid (₹)</label>
            <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500" value={form.advancePaid} onChange={e => setForm({...form, advancePaid: Number(e.target.value)})} />
          </div>
          
          <button type="submit" disabled={isSubmitDisabled} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 mt-2 disabled:bg-indigo-400">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <Toast message={toastMsg} onClose={() => setToastMsg('')} />
        <ErrorPopup error={apiError} onClose={() => setApiError('')} />
      </div>
    </div>
  );
}