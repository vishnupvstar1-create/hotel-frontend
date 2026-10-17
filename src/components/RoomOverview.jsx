import { useState, useEffect } from 'react';
import { AlertTriangle, User, Calendar, LogOut, Globe } from 'lucide-react';

export default function RoomOverview({ bookings }) {
  const [filter, setFilter] = useState('All');
  const [rooms, setRooms] = useState([]); 
  const [loading, setLoading] = useState(true);

  // 1. Fetch real inventory from MongoDB on load
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('https://grand-resorts-api.onrender.com/api/rooms');
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error("Failed to fetch rooms", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // 2. Handle instant status updates (Available, Reserved, Occupied, Maintenance)
  const handleStatusChange = async (roomId, newStatus) => {
    try {
      const response = await fetch(`https://grand-resorts-api.onrender.com/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setRooms(rooms.map(room => room._id === roomId ? { ...room, status: newStatus } : room));
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const displayedRooms = filter === 'All' 
    ? rooms 
    : rooms.filter(r => r.roomType === filter);

  if (loading) return <div className="p-10 text-center text-gray-500 font-bold">Loading live inventory...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Room Overview</h2>
          <p className="text-sm text-gray-500">Live inventory and Next.js visibility control</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {['All', 'Super Luxury', 'Deluxe', 'Normal'].map(type => (
            <button 
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap ${filter === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Rooms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {displayedRooms.map(room => {
          
          const activeBooking = bookings.find(b => b.roomNumber === room.roomNumber && b.status === 'Checked-In');
          
          let isOverdue = false;
          if (activeBooking) {
            const today = new Date();
            today.setHours(0,0,0,0);
            const checkOutDate = new Date(activeBooking.checkOutDate);
            checkOutDate.setHours(0,0,0,0);
            if (today > checkOutDate) isOverdue = true;
          }

          const futureBooking = !activeBooking 
            ? bookings.find(b => b.roomNumber === room.roomNumber && b.status === 'Reserved')
            : null;

          return (
            <div key={room._id} className={`relative p-5 rounded-xl border-2 transition-all h-full flex flex-col ${
              isOverdue ? 'border-red-500 bg-red-50' : 
              activeBooking ? 'border-indigo-500 bg-indigo-50' : 
              futureBooking ? 'border-amber-400 bg-amber-50' :
              'border-emerald-500 bg-emerald-50'
            }`}>
              
              {isOverdue && (
                <div className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg animate-pulse">
                  <AlertTriangle size={18} />
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-2xl font-black ${
                    isOverdue ? 'text-red-700' : activeBooking ? 'text-indigo-700' : futureBooking ? 'text-amber-700' : 'text-emerald-700'
                  }`}>
                    {room.roomNumber}
                  </h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{room.roomType}</p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                  isOverdue ? 'bg-red-200 text-red-800' : activeBooking ? 'bg-indigo-200 text-indigo-800' : futureBooking ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800'
                }`}>
                  {isOverdue ? 'OVERDUE' : activeBooking ? 'OCCUPIED' : futureBooking ? 'RESERVED' : 'VACANT'}
                </div>
              </div>

              {/* Guest / Booking Info */}
              <div className="mt-auto pt-4 border-t border-black/5 mb-4">
                {activeBooking ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                      <User size={16} className={isOverdue ? "text-red-400" : "text-indigo-400"}/>
                      <span className="truncate">{activeBooking.guestName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <LogOut size={16} className={isOverdue ? "text-red-500" : "text-gray-400"}/>
                      <span className={isOverdue ? "text-red-600 font-bold" : ""}>
                        Out: {new Date(activeBooking.checkOutDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ) : futureBooking ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-amber-700 font-medium">
                      <User size={16} className="text-amber-500"/>
                      <span className="truncate">{futureBooking.guestName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-700">
                      <Calendar size={16} className="text-amber-500"/>
                      <span>In: {new Date(futureBooking.checkInDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-emerald-600 font-semibold flex items-center gap-2">
                    <Calendar size={16} /> Ready for Check-in
                  </div>
                )}
              </div>

              {/* Website Visibility Control with New Options */}
              <div className="pt-3 border-t border-black/10">
                <label className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  <Globe size={12} /> Website Status
                </label>
                <select 
                  value={room.status}
                  onChange={(e) => handleStatusChange(room._id, e.target.value)}
                  className={`w-full text-xs font-bold p-1.5 rounded border focus:outline-none ${
                    room.status === 'Available' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-300'
                  }`}
                >
                  <option value="Available">Available (Visible)</option>
                  <option value="Reserved">Reserved (Hidden)</option>
                  <option value="Occupied">Occupied (Hidden)</option>
                  <option value="Maintenance">Maintenance (Hidden)</option>
                </select>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}