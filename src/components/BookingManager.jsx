import { useState } from 'react';
import axios from 'axios';
import { BedDouble } from 'lucide-react';
import Toast from './Toast';             
import ErrorPopup from './ErrorPopup';

export default function BookingManager({ bookings, refresh, API }) {
  const [form, setForm] = useState({ 
    guestName: '', 
    phone: '', 
    email: '', 
    roomType: 'Normal', 
    roomNumber: '', 
    checkInDate: '', 
    checkOutDate: '', 
    advancePaid: 0 
  });

  // NEW: State to track live typing errors
  const [errors, setErrors] = useState({ phone: '', email: '' });
  const [toastMsg, setToastMsg] = useState('');
  const [apiError, setApiError] = useState('');

  const roomRates = { 'Super Luxury': 20000, 'Deluxe': 15000, 'Normal': 7500 };

  const roomInventory = [
    ...Array.from({ length: 5 }, (_, i) => ({ number: 101 + i, type: 'Super Luxury' })),
    ...Array.from({ length: 10 }, (_, i) => ({ number: 201 + i, type: 'Deluxe' })),
    ...Array.from({ length: 10 }, (_, i) => ({ number: 301 + i, type: 'Normal' }))
  ];

  const occupiedRoomNumbers = bookings
    .filter(b => b.status === 'Checked-In')
    .map(b => Number(b.roomNumber));

  const availableRooms = roomInventory.filter(
    room => room.type === form.roomType && !occupiedRoomNumbers.includes(room.number)
  );

  const handleRoomTypeChange = (e) => {
    setForm({ ...form, roomType: e.target.value, roomNumber: '' });
  };

  // NEW: Live validation handlers
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

  const submit = async (e) => {
    e.preventDefault();
    if (!form.roomNumber) return alert("Please select an available room.");
    // Extra safety check in case they bypass HTML disables
    if (errors.phone || errors.email) return; 

    try {
      await axios.post(`${API}/bookings`, { 
        ...form, 
        roomRate: roomRates[form.roomType] 
      });
      
      setToastMsg("Guest checked in successfully!");
      setForm({ guestName: '', phone: '', email: '', roomType: 'Normal', roomNumber: '', checkInDate: '', checkOutDate: '', advancePaid: 0 });
      setErrors({ phone: '', email: '' });
      refresh();
    } catch (error) {
      console.error("Error creating booking:", error);
      const errorDetail = error.response?.data?.error || "Failed to connect to the server.";
      setApiError(errorDetail);
    }
  };

  // Disable button if no rooms OR if there are validation errors
  const isSubmitDisabled = availableRooms.length === 0 || errors.phone !== '' || errors.email !== '';

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <BedDouble size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">New Check-In</h2>
          <p className="text-sm text-gray-500">Register a new guest and assign an available room</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name <span className="text-red-500">*</span></label>
            <input required type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={form.guestName} onChange={e => setForm({...form, guestName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
            <input required type="tel" className={`w-full border p-3 rounded-lg focus:ring-2 focus:outline-none ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`} value={form.phone} onChange={handlePhoneChange} />
            {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address (Optional)</label>
          <input type="email" className={`w-full border p-3 rounded-lg focus:ring-2 focus:outline-none ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`} value={form.email} onChange={handleEmailChange} />
          {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-50/50 p-4 rounded-xl border border-indigo-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
            <select className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white" value={form.roomType} onChange={handleRoomTypeChange}>
              <option value="Normal">Normal (₹7,500)</option>
              <option value="Deluxe">Deluxe (₹15,000)</option>
              <option value="Super Luxury">Super Luxury (₹20,000)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Room #</label>
            <select required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400" value={form.roomNumber} onChange={e => setForm({...form, roomNumber: e.target.value})} disabled={availableRooms.length === 0}>
              <option value="">-- Select --</option>
              {availableRooms.map(room => (
               <option key={room.number} value={room.number}>Room {room.number}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Check-In Date</label>
            <input required type="date" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-700" value={form.checkInDate} onChange={e => setForm({...form, checkInDate: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Check-Out Date</label>
            <input required type="date" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-700" value={form.checkOutDate} onChange={e => setForm({...form, checkOutDate: e.target.value})} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Advance Paid (₹)</label>
          <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={form.advancePaid} onChange={e => setForm({...form, advancePaid: Number(e.target.value)})} />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button type="submit" disabled={isSubmitDisabled} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 shadow-md">
            Confirm Check-In
          </button>
        </div>
      </form>
      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
        <ErrorPopup error={apiError} onClose={() => setApiError('')} />
    </div>
  );
}