import { useState, useEffect } from 'react';
import CheckoutModal from './CheckoutModal';
import EditBookingModal from './EditBookingModal';
import FolioModal from './FolioModal';
import { Users, Edit, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GuestList({ bookings, refresh, API }) {
const [view, setView] = useState('active'); // 'active' | 'reserved' | 'history
  const [checkoutModalId, setCheckoutModalId] = useState(null);
  const [editBooking, setEditBooking] = useState(null);
  const [folioBooking, setFolioBooking] = useState(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter Active vs History
 const displayedBookings = bookings.filter(b => {
  if (view === 'active') return b.status === 'Checked-In';
  if (view === 'reserved') return b.status === 'Reserved';
  return b.status === 'Checked-Out';
});

  // Reset to page 1 when switching views or changing items per page
  useEffect(() => {
    setCurrentPage(1);
  }, [view, itemsPerPage]);

  // Pagination Logic
  const totalPages = Math.ceil(displayedBookings.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = displayedBookings.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-6xl mx-auto">
      
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-100 pb-4">
  <div className="flex items-center gap-3">
    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24} /></div>
    <div>
      <h2 className="text-2xl font-bold text-gray-800">Guest Directory</h2>
      <p className="text-sm text-gray-500">Manage in-house guests and view checkout history</p>
    </div>
  </div>
        
     {/* Filters - Stacks on mobile and triggers horizontal scroll */}
  <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto custom-scrollbar w-full md:w-auto max-w-full">
    <button 
      onClick={() => setView('active')} 
      className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap ${view === 'active' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
    >
      Active Guests
    </button>
    <button 
      onClick={() => setView('reserved')} 
      className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap ${view === 'reserved' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
    >
      Upcoming
    </button>
    <button 
      onClick={() => setView('history')} 
      className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap ${view === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
    >
      History
    </button>
  </div>
</div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="text-gray-500 border-b border-gray-200 text-sm">
              <th className="pb-3 font-semibold">Room</th>
              <th className="pb-3 font-semibold">Guest & Phone</th>
              <th className="pb-3 font-semibold">Dates</th>
              <th className="pb-3 font-semibold">{view === 'active' ? 'Advance' : 'Status'}</th>
              <th className="pb-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.length === 0 ? (
              <tr><td colSpan="5" className="py-12 text-center text-gray-400">No guests found.</td></tr>
            ) : (
              currentBookings.map(b => (
                <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4">
                    <span className="font-bold text-indigo-600 block">#{b.roomNumber}</span>
                    <span className="text-xs text-gray-500">{b.roomType}</span>
                  </td>
                  <td className="py-4">
                    <span className="font-bold text-gray-800 block">{b.guestName}</span>
                    <span className="text-sm text-gray-500">{b.phone}</span>
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    {new Date(b.checkInDate).toLocaleDateString()} <br/>
                    <span className="text-gray-400">to</span> {new Date(b.checkOutDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-sm font-medium">
                    {view === 'active' ? <span className="text-green-600">₹{b.advancePaid}</span> : <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-xs">Checked Out</span>}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setFolioBooking(b)} className="text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg font-semibold hover:bg-blue-100 flex items-center gap-1 transition-colors">
                        <Receipt size={16} /> Folio
                      </button>

                      {b.status === 'Checked-In' ? (
                        <>
                          <button onClick={() => setEditBooking(b)} className="text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-semibold hover:bg-gray-200 flex items-center gap-1 transition-colors">
                            <Edit size={16} /> Edit
                          </button>
                          <button onClick={() => setCheckoutModalId(b._id)} className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition-colors">
                            Checkout
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg ml-2 border border-emerald-100">
                          Settled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-100 text-sm text-gray-600 gap-4">
        <div className="flex items-center gap-3">
          <span>Show</span>
          <select 
            className="border border-gray-300 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={25}>25</option>
            <option value={30}>30</option>
          </select>
          <span>entries ({displayedBookings.length} total)</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-medium px-2">Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Modals */}
      {checkoutModalId && <CheckoutModal bookingId={checkoutModalId} API={API} onClose={() => setCheckoutModalId(null)} onSuccess={() => { setCheckoutModalId(null); refresh(); }} />}
      {editBooking && <EditBookingModal booking={editBooking} API={API} onClose={() => setEditBooking(null)} onSuccess={() => { setEditBooking(null); refresh(); }} />}
      {folioBooking && <FolioModal booking={folioBooking} API={API} onClose={() => setFolioBooking(null)} />}
    </div>
  );
}