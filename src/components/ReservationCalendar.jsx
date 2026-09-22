import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users } from 'lucide-react';

export default function ReservationCalendar({ bookings }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
      
      {/* Header - Now stacks on mobile (flex-col) and sits side-by-side on desktop (md:flex-row) */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Future Arrivals</h2>
            <p className="text-xs md:text-sm text-gray-500">Monthly view of upcoming check-ins</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end bg-gray-50 md:bg-transparent p-2 md:p-0 rounded-lg">
          <button onClick={handlePrevMonth} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm md:shadow-none">
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-lg md:text-xl font-black text-gray-800 min-w-[130px] md:min-w-[150px] text-center">
            {monthNames[month]} {year}
          </h3>
          <button onClick={handleNextMonth} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm md:shadow-none">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid Wrapper - Enables horizontal scrolling on mobile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto custom-scrollbar">
        
        {/* Force a minimum width so the 7 columns never squish */}
        <div className="min-w-[768px]">
          
          <div className="grid grid-cols-7 bg-slate-900 text-white text-center text-xs md:text-sm font-bold tracking-wider rounded-t-xl overflow-hidden">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="py-2 md:py-3 border-r border-slate-700 last:border-0">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 auto-rows-fr">
            {blanks.map(blank => (
              <div key={`blank-${blank}`} className="min-h-[100px] md:min-h-[140px] bg-gray-50 border-r border-b border-gray-100 p-2"></div>
            ))}

            {days.map(day => {
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              
              const dayArrivals = bookings.filter(b => {
                const checkIn = new Date(b.checkInDate);
                return checkIn.getDate() === day && 
                       checkIn.getMonth() === month && 
                       checkIn.getFullYear() === year &&
                       (b.status === 'Reserved' || b.status === 'Checked-In');
              });

              return (
                <div key={day} className={`relative group min-h-[100px] md:min-h-[140px] border-r border-b border-gray-100 p-1.5 md:p-2 transition-colors hover:bg-gray-50 ${isToday ? 'bg-blue-50/50' : 'bg-white'}`}>
                  
                  <div className="flex justify-between items-start mb-1.5 md:mb-2">
                    <span className={`text-xs md:text-sm font-bold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>
                      {day}
                    </span>
                    {dayArrivals.length > 0 && (
                      <span className="text-[9px] md:text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 md:px-2 py-0.5 rounded-full">
                        {dayArrivals.length} <span className="hidden md:inline">Arrival{dayArrivals.length > 1 ? 's' : ''}</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 md:space-y-1.5 overflow-y-auto max-h-[70px] md:max-h-[90px] pr-1 custom-scrollbar">
                    {dayArrivals.map(arrival => (
                      <div key={arrival._id} className="text-[10px] md:text-xs p-1 md:p-1.5 rounded bg-amber-50 border border-amber-100 text-amber-900 truncate">
                        <span className="font-bold">#{arrival.roomNumber}</span> {arrival.guestName}
                      </div>
                    ))}
                  </div>

                  {dayArrivals.length > 0 && (
                    <div className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] md:w-[110%] min-h-[110%] bg-slate-900 text-white p-3 md:p-4 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none flex flex-col scale-95 group-hover:scale-100">
                      <div className="flex items-center gap-2 border-b border-slate-700 pb-2 mb-2 md:mb-3">
                        <Users size={14} className="text-amber-400" />
                        <h4 className="font-bold text-xs md:text-sm text-amber-400">
                          {new Date(year, month, day).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </h4>
                      </div>
                      
                      <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1">
                        {dayArrivals.map(arrival => (
                          <div key={`popup-${arrival._id}`} className="flex flex-col text-xs md:text-sm bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-black text-amber-200">Rm {arrival.roomNumber}</span>
                              <span className="text-[10px] md:text-xs text-slate-400">{arrival.phone}</span>
                            </div>
                            <span className="font-medium text-slate-100 truncate">{arrival.guestName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}