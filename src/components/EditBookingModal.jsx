import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

export default function EditBookingModal({ booking, API, onClose, onSuccess }) {
  // Normalize data to handle both "Pending" web payloads and existing "Checked-In" payloads
  const [formData, setFormData] = useState({
    guestName: booking.guestName || '',
    phone: booking.phone || booking.guestPhone || '',
    email: booking.email || booking.guestEmail || '',
    roomType: booking.roomType || 'Normal',
    roomNumber: booking.roomNumber || '',
    checkInDate: (booking.checkInDate || booking.checkIn || '').split('T')[0],
    checkOutDate: (booking.checkOutDate || booking.checkOut || '').split('T')[0],
    status: booking.status || 'Pending',
    advancePaid: booking.advancePaid || 0,
    totalRoomCharge: booking.totalRoomCharge || 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Require a room number if they are moving out of 'Pending'
    if ((formData.status === 'Reserved' || formData.status === 'Checked-In') && !formData.roomNumber) {
      setError('A Room Number is required to mark a guest as Reserved or Checked-In.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API}/bookings/${booking._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update booking');
      
      onSuccess(); // Triggers the refresh() function passed from GuestList
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {booking.status === 'Pending' ? 'Review Booking Request' : 'Edit Booking'}
            </h3>
            <p className="text-sm text-gray-500">ID: {booking._id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-3 text-sm font-medium">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form id="edit-booking-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Status & Assignment Row - Highlighted for emphasis */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-indigo-900 mb-1">Booking Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="Pending">Pending (Web Request)</option>
                  <option value="Reserved">Reserved (Confirmed)</option>
                  <option value="Checked-In">Checked-In (In House)</option>
                  <option value="Checked-Out">Checked-Out (Settled)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-indigo-900 mb-1">Assign Room #</label>
                <input 
                  type="text" 
                  name="roomNumber" 
                  value={formData.roomNumber} 
                  onChange={handleChange}
                  placeholder="e.g. 204"
                  className="w-full p-2.5 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Guest Details */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2">Guest Details</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" name="guestName" value={formData.guestName} onChange={handleChange} required className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2">Stay Details</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Category</label>
                  <select name="roomType" value={formData.roomType} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500">
                    <option value="Normal">Normal Room</option>
                    <option value="Deluxe">Deluxe Room</option>
                    <option value="Super Luxury">Super Luxury Suite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                  <input type="date" name="checkInDate" value={formData.checkInDate} onChange={handleChange} required className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                  <input type="date" name="checkOutDate" value={formData.checkOutDate} onChange={handleChange} required className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>

            {/* Financials */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2">Financials (₹)</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Room Charge</label>
                  <input type="number" name="totalRoomCharge" value={formData.totalRoomCharge} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Advance Paid</label>
                  <input type="number" name="advancePaid" value={formData.advancePaid} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="edit-booking-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Booking'}
          </button>
        </div>

      </div>
    </div>
  );
}