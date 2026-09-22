import { useState, useEffect } from 'react';
import { BrowserRouter as Router, NavLink } from 'react-router-dom';
import axios from 'axios';
import AppRoutes from './routes/AppRoutes';
import logoImg from './assets/grand.png';
import { LayoutDashboard, BedDouble, UtensilsCrossed, LayoutGrid, Store, Users, CalendarDays,ReceiptText } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'https://grand-resorts-api.onrender.com/api';

export default function App() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${API}/bookings`);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => { 
    fetchBookings(); 
  }, []);

  // Define navigation items in an array to keep the JSX clean
 const navItems = [
  { path: '/', icon: BedDouble, label: 'Front Desk', exact: true },
  { path: '/calendar', icon: CalendarDays, label: 'Calendar' }, // <-- NEW
  { path: '/guests', icon: Users, label: 'Guest List' },
  { path: '/rooms', icon: LayoutGrid, label: 'Room Overview' },
  { path: '/pos', icon: UtensilsCrossed, label: 'Service POS' },
  { path: '/restaurant', icon: Store, label: 'Ext. Checkout' },
  { path: '/restaurant-sales', icon: ReceiptText, label: 'Ext. Sales' } // Ensure ReceiptText is imported if missing
];

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
        
       {/* Responsive Sidebar */}
<div className="w-20 md:w-64 bg-slate-900 text-white flex flex-col transition-all duration-300 z-20 shrink-0">
  
  {/* Logo / Header */}
  <div className="py-4 md:py-6 border-b border-slate-800 flex flex-col items-center justify-center gap-1.5 md:gap-2 shrink-0 px-1">
    <div className="bg-white p-1.5 md:p-2.5 rounded-xl shadow-md flex items-center justify-center">
      <img 
        src={logoImg} 
        alt="Grand Resort Logo" 
        className="h-6 md:h-10 w-auto object-contain" 
      />
    </div>
    {/* FIX 1: Name is now visible on mobile! It uses a line break (<br>) so it stacks perfectly in the narrow width. */}
    <span className="text-[10px] md:text-lg font-bold tracking-wide text-center leading-tight mt-1 md:mt-0">
      Grand<br className="md:hidden" />Resort
    </span>
  </div>
  
  {/* Navigation Links */}
  <nav className="flex-1 p-2 md:p-4 space-y-1.5 md:space-y-2 mt-2 overflow-y-auto custom-scrollbar">
    {navItems.map((item) => (
      <NavLink 
        key={item.path}
        to={item.path} 
        end={item.exact}
        className={({ isActive }) => 
          /* FIX 2: Changed to flex-col on mobile so icon is on top, text is on bottom. Stays a row on desktop. */
          `flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 py-3 px-1 md:p-3 rounded-lg transition-colors ${
            isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800 hover:text-white'
          }`
        }
      >
        {/* Icon */}
        <item.icon size={22} className="min-w-[22px] md:w-[24px] md:h-[24px]" />
        
        {/* FIX 3: Tooltips removed entirely. Text is now always visible: Tiny text on mobile, normal text on desktop. */}
        <span className="text-[9px] md:text-base font-medium text-center md:text-left leading-tight md:whitespace-nowrap">
          {item.label}
        </span>
      </NavLink>
    ))}
  </nav>
</div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <AppRoutes bookings={bookings} refresh={fetchBookings} API={API} />
        </div>
        
      </div>
    </Router>
  );
}